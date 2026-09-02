---
layout: doc
title: "SSH Brute-Force Attacks: How to Read Login Logs and Defend Your Server"
description: "SSH brute force is the most common attack against public servers. Learn how the attack works, how to confirm it from /var/log/auth.log and journalctl, the common defense mistakes, and how two-factor authentication and a unified entry point contain the risk."
head:
  - - meta
    - name: keywords
      content: ssh brute force, brute force attack, ssh login logs, fail2ban, weak password, two-factor authentication, bastion host, Next Terminal
  - - meta
    - property: og:title
      content: "SSH Brute-Force Attacks: How to Read Login Logs and Defend Your Server"
  - - meta
    - property: og:description
      content: Spot brute force in /var/log/auth.log, understand how the attack works, and converge login onto a unified entry point.
---

# SSH Brute-Force Attacks: How to Read Login Logs and Defend Your Server

Any Linux server with port 22 open to the internet will, sooner or later, come under SSH brute-force attack. Put a freshly installed host online and within hours `/var/log/auth.log` fills with rows of `Failed password` — source IPs from every continent, usernames ranging from `root` and `admin` to `ubuntu` and `test`. Most of these attacks are not aimed at you personally; they are automated scanners running continuously across the internet. But they still bring two real consequences: sustained bandwidth and CPU consumption, and the fact that a single account with a weak password is only a matter of time away from being cracked.

This article covers three things: how SSH brute force actually works, how to confirm from your login logs that you are being scanned, and the common defense mistakes. It closes with how to converge "login" onto a single entry point and back it with strong authentication and auditing.

## What the Attacker Is Doing: From Port Scan to Credential Stuffing

A typical brute-force attack is not "a person trying passwords against your machine" but a fully automated pipeline.

The first step is **discovering targets**. The attacker runs a scanner that probes entire public IP ranges with TCP connection attempts to ports like 22, 3389, and 5432. This step needs no interaction and can sweep a /24 in seconds.

The second step is **fingerprinting the service**. Once connected to port 22, the SSH server returns its own version string, such as `SSH-2.0-OpenSSH_8.9p1`. The attacker uses this to determine your distribution and version, then picks a matching wordlist.

The third step is **username enumeration**. The real attack begins by probing common usernames: `root`, `admin`, `git`, `oracle`, `ubuntu`, `test`, `postgres`... On some misconfigured OpenSSH versions, the difference in server responses between users even lets the attacker confirm whether a given username exists.

The fourth step is **dictionary attack**. With usernames in hand, the attacker tries each against a weak-password wordlist. The entries at the top of every list are always `123456`, `password`, `root`, `admin123`, `qwerty`. If a target account happens to use a weak password, the odds of it being cracked are not low.

Close to the dictionary attack is a variant called **credential stuffing**: the attacker does not guess passwords but tries username-password pairs from previously breached databases. If you reuse the same password in several places, one breach elsewhere gets this host cracked too. This is why, once a password leaks, changing it on a single server is not enough.

Understanding this pipeline explains why "changing the port" helps so little: scanners do not rely on memory, they rely on full-port probing, so port 2222 gets scanned just like 22.

## Recognizing Brute Force in the Logs

The most direct way to tell whether you are being scanned is to read the failed-login logs. Debian/Ubuntu use `/var/log/auth.log`, RHEL/CentOS use `/var/log/secure`, and on systemd distros you can query the journal directly:

```bash
journalctl -u sshd --since "1 hour ago" | grep "Failed password" | tail -20
```

Brute-force logs have several distinct characteristics:

- **The same source IP appears at high frequency.** One IP making dozens or hundreds of failed logins in a short window is a script, not a user mistyping a password.
- **Usernames show enumeration patterns.** Unrelated usernames like `root`, `admin`, `test`, and `oracle` appearing in sequence.
- **Very short gaps between failures.** A real user pauses after a wrong password; an attack script fires back-to-back within milliseconds.
- **Source IPs are unfamiliar and dispersed.** If the source is a datacenter IP range rather than your office network or home broadband, it is almost certainly a scan.

How do you tell a normal mistyped password from brute force? In normal use, a user fails once or twice, then either succeeds with a key or retries after a while. Brute force is dense failures from one source IP with almost no successes. The ratio of failures to successes in a log window is more telling than the raw failure count.

To review blocked attempts, use `lastb`:

```bash
lastb | head -20
```

Looking at the output of these two commands together is enough to judge the scale, source, and duration of an attack.

## Three Common Mistakes

The first mistake is **believing a port change stops brute force**. As noted above, scanners do full-port probing, so 2222 gets scanned just like 22. Changing the port only makes low-end scripts that check default ports skip you; it is meaningless against a patient attacker and adds operational friction.

The second mistake is **treating fail2ban as the whole solution**. fail2ban reads logs and blocks source IPs, which does cut down most of the noise, but it blocks "source IPs" rather than "credentials". When an attacker comes back from a botnet with a different IP, fail2ban has to keep updating its ban list — while the real threat, weak and shared passwords, sits there untouched. The point of defense should be "make the password useless", not "block a particular IP".

The third mistake is **thinking disabling root login is enough**. Disabling direct root login is worth doing, but attackers will simply enumerate other usernames. `PermitRootLogin no` only moves the attack surface from `root` to equally common accounts like `admin` and `ubuntu`.

## Converging Login onto a Single Entry Point

Before talking about a unified entry point, get the single-host baseline right: disable password login in favor of keys, forbid weak passwords on every login account, and restrict the allowed source IPs at the firewall where practical. These are the cheapest and most effective first steps — without them, even a strong unified entry point just leaves the problem deferred.

Configuring fail2ban, editing configs, and reading logs on every server is manageable with a few dozen hosts but falls apart at a few hundred. A more thorough approach is to pull "login" back from each machine and centralize it behind one entry point.

Do three things at that entry point and the risk drops sharply:

| Measure | What it solves |
|---------|----------------|
| Strong authentication (OTP / Passkey) | Even with a leaked password, no second factor means no login |
| Centralized login logs | Who logged in, from where, and when — at a glance |
| Unified authorization | After login, access only to authorized assets |

Strong authentication is the most critical piece. Passwords are inherently unreliable — they can be guessed, leaked, and stuffed. Adding a **time-based one-time password (TOTP)** on top of login, or switching to **Passkey/WebAuthn** outright, keeps an attacker out even with the password in hand. This cuts the core of brute force: the goal of the attack is to "guess the password", and two-factor authentication makes "guessing the password" no longer equal "getting in".

The difference between TOTP and Passkey: TOTP still relies on a shared secret that merely rotates every 30 seconds, while Passkey authenticates with a public-private key pair whose private key never leaves the device — fundamentally leaving no "password" to steal.

Login logs are also evidence. Frameworks such as MLPS and ISO 27001 require login behavior to be traceable — who logged in, when, and from where. Centralizing login logs puts both incident response and audit in one place; see the mapping in [Compliance and Auditing](/usage/compliance).

> In an **open-source bastion host** like Next Terminal, SSH assets are accessed through the bastion, where you can layer [OTP two-factor authentication](/usage/otp) and [passkeys](/usage/passkey) on login and record every access in the [asset access](/usage/access) log. With the [SSH gateway](/usage/ssh-gateway), the `ssh user@host` habit is preserved too — once the entry point is unified, brute force turns into repeatedly bumping against a single gate.
