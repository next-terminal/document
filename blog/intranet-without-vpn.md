---
layout: doc
title: "Access Intranet Without VPN: 3 Secure Alternatives Compared"
description: "How to securely access internal SSH/RDP/Web systems without a VPN? Compare port forwarding, self-hosted VPN, and bastion host + security gateway. Use Next Terminal open source bastion host's reverse tunnel for zero-trust intranet access — a lightweight JumpServer/Teleport alternative."
head:
  - - meta
    - name: keywords
      content: "intranet access, intranet tunneling, VPN alternative, zero trust, security gateway, reverse tunnel, bastion host, open source bastion, jump server, operations audit, Next Terminal, JumpServer alternative, Teleport alternative"
  - - meta
    - property: og:title
      content: "Access Intranet Without VPN: 3 Secure Alternatives Compared"
  - - meta
    - property: og:description
      content: "Port forwarding, self-hosted VPN, or bastion host + security gateway reverse tunnel — compare three ways to reach internal systems, and use Next Terminal for zero-trust access with unified audit."
---

# Access Intranet Without VPN: 3 Secure Alternatives Compared

"How do we give external colleagues access to internal systems?" This question lands on every operations team's desk at least once a quarter. The traditional answer is a VPN, but client distribution, routing conflicts and over-broad account permissions are pushing more teams to look for a **VPN alternative**. For small and medium teams, zero-trust intranet access built on an **open source bastion host** is becoming the more pragmatic choice: instead of granting everyone a network-layer tunnel, it moves the "who can reach which system" decision to the application layer and keeps a full audit trail.

This article compares three common approaches — public port forwarding, a self-hosted VPN, and a bastion host with a **security gateway** reverse tunnel — and shows how Next Terminal lets you securely reach internal SSH, RDP and Web systems without rolling out a VPN. All steps follow the current v3.7.2 documentation.

## Why "no VPN" is becoming common

A VPN solves network-layer connectivity: once a client connects, it is as if the machine were plugged into the internal switch. The problems live in exactly that property.

- **Client and routing overhead**: every user needs a client, a config, and help with disconnects and reconnects. Cross-platform experience varies, and IT support costs grow.
- **Coarse permission boundary**: a VPN opens a whole network, not a specific asset. A leaked account often grants overly broad network access, inviting lateral movement.
- **Hard-to-enforce audit**: a VPN usually records "who connected, for how long", but rarely answers "who accessed which server at what time, and what did they do" — a gap for operations audit and compliance.

That is why "zero trust replaces VPN" is gaining ground: instead of trusting anyone who gets inside the network, verify identity and authorization on every single access.

## Approach 1: Public port forwarding — cheapest, most dangerous

Mapping an internal server `192.168.1.10:22` to a public port like `1.2.3.4:2222` via a router or cloud security group is the lowest-effort path — it works in minutes. The cost is just as immediate:

- **Exposed attack surface**: once ports 22 or 3389 are reachable, scanners and brute-force scripts arrive within hours, and the logs fill with failed logins.
- **No identity or authorization**: port forwarding solves connectivity, not who may reach which asset. A reachable port is a port everyone can try.
- **Almost no audit**: there is no single place to trace who accessed what.

Port forwarding fits temporary debugging and personal projects; it does not hold up once multiple people and compliance are involved.

## Approach 2: Self-hosted VPN — network reach, but a blurry boundary

Self-hosted VPNs such as WireGuard or OpenVPN offer strong encryption and a natural post-connect experience, making them the first "not port forwarding" option. In multi-user scenarios their limits are also clear:

- **Connect = inside the network**: joining a VPN grants reachability to the whole internal segment by default. Fine-grained "who can reach which machine" still requires extra network policies.
- **Expensive account leaks**: one leaked VPN credential hands over the internal boundary, and the blast radius is hard to contain quickly.
- **Weak audit**: VPN logs rarely link to "who operated which server"; forensics depend on per-host logs.

VPNs suit office networks controlled by network admins with a stable user base. For high-frequency needs like "grant a contractor temporary access", the account lifecycle and audit cost of a VPN is significant.

## Approach 3: Bastion host + security gateway — zero trust, reverse tunnel

This is the recommended direction: deploy a lightweight **security gateway** inside the internal network. It dials out to the bastion host over a WebSocket reverse tunnel, so internal servers need no inbound public port, no port mapping, and no VPN. When a user reaches an asset through the bastion, traffic is forwarded by the gateway to the internal target.

Compared with the first two approaches, this path has several key advantages:

- **Identity first**: every access passes through the bastion's unified login and authorization — verify before forwarding, by default.
- **Per-asset fine-grained authorization**: the grant targets "this SSH/RDP/Web asset", not a whole network — least privilege by construction.
- **Unified audit and recording**: sessions are recorded and replayable; who accessed what and when is fully traceable.
- **No public ports**: the gateway connects outward, which naturally suits cloud VPCs, customer sites and isolated datacenters.

Protocol coverage is not limited to SSH — RDP, VNC and Telnet can also be forwarded through the security gateway. Combined with the built-in SSH proxy server and RDP proxy server, users can work directly in the browser or through their familiar local client tools, balancing ease of use with existing workflows.

A typical access chain looks like this: the user's browser or local client first signs in to the bastion host and passes authorization, then the bastion delivers the request over the WebSocket reverse tunnel to the intranet security gateway, which forwards it to the target asset. Throughout the chain there is no open inbound port on the intranet side, leaving scanners nothing to find — the most visible difference from port forwarding and VPN.

If you are evaluating a **JumpServer alternative** or a **Teleport alternative**, the reverse-tunnel capability and audit completeness of the security gateway are dimensions worth comparing closely.

## Comparing the three approaches

| Approach | Connection direction | Identity / authorization | Audit | Best for |
| --- | --- | --- | --- | --- |
| Public port forwarding | Inbound direct | None | Almost none | Temporary debugging, personal projects |
| Self-hosted VPN | Inbound (gateway) | Network layer, coarse | Weak | Stable office networks, fixed users |
| **Bastion host + security gateway** | **Reverse tunnel (outbound)** | **Application layer, per asset** | **Session recording, full audit** | **Multi-network, external collaborators, compliance** |

Approach 3 replaces "network-layer access" with "identity and authorization first" — the core difference from VPN, and the most concrete form of zero trust in practice.

## Landing approach 3: reverse tunnel + per-asset authorization

Landing approach 3 needs three pieces: a lightweight gateway that connects out, a bastion host that owns identity and authorization, and a per-asset authorization model. Below we use the open source bastion **Next Terminal** as a concrete example — it packages the gateway, authorization, and session audit out of the box, and the flow is largely similar in other bastions. Once you understand this structure, you can apply it to whichever tool you choose.

The example grants an external user access to a Linux server on the company intranet.

### 1. Deploy the bastion host

Deploy Next Terminal via [Container Installation](/install/container-install), make sure the admin UI is reachable, and configure HTTPS correctly — the security gateway's encrypted communication relies on server-side HTTPS.

### 2. Deploy a security gateway on the intranet

Install the security gateway on a machine inside the company network and register it to the server. The gateway auto-registers after installation; it only needs to reach the server's Web port:

```shell
nt-tunnel run --endpoint https://nt.example.com --token TUN_xxxxxxxxxxxxxxxx
```

After registration, the gateway appears as online on the "Security Gateway" admin page. For full installation and configuration (custom server address, proxy, discovery scope), see [Security Gateway](/usage/agent-gateway) and [Security Gateway Configuration](/usage/agent-gateway-config).

### 3. Create the asset and bind the gateway

When creating an asset, set the IP to an internal address reachable from the gateway's network (e.g. `192.168.1.100`), port `22`, and select the gateway in the "Security Gateway" dropdown. See [Assets](/usage/asset) for field details.

### 4. Authorize and audit

Authorize the asset to users or groups; the external user can then reach the internal server through the bastion. Sessions are recorded and replayable, satisfying [Compliance](/usage/compliance) requirements.

### 5. Use a native client (optional)

If your colleagues prefer local SSH or RDP clients, enable the bastion's SSH proxy server and RDP proxy server: the local client connects to the bastion first, and the bastion forwards through the security gateway to the internal asset. This keeps the familiar tooling while routing access through the bastion's authorization and audit — see [Asset Access](/usage/access) for details.

## Security hardening

Approach 3 shrinks the attack surface, but the bastion host itself is the single externally exposed entry and still needs care:

- **Enforce HTTPS**: the security gateway's encrypted communication relies on server-side HTTPS; a plaintext deployment defeats the purpose, so configure a valid certificate.
- **Least-privilege authorization**: grant only the assets each person or group needs — avoid authorizing the whole intranet for convenience.
- **Two-factor auth**: enable 2FA (TOTP) or passkeys for the admin UI facing the internet to reduce account-takeover risk.
- **Regular review**: check audit logs and session recordings periodically, and make "who accessed what" part of routine inspection.

## FAQ

**Does the security gateway need a public IP on the intranet?** No. The gateway dials outward, so internal servers need no inbound port and no public IP.

**What about multiple sites or VPCs?** Deploy one security gateway per network and select the matching gateway when creating assets — no separate public entry per network is needed.

**Can I reach Web systems?** Yes. Web systems are published through [Web Assets](/usage/website): the browser authenticates first, then the bastion forwards to the internal service, sharing the same authorization and audit model as SSH/RDP assets.

**How does the bastion host itself stay secure?** The bastion is the only external entry, so enable HTTPS, enforce access controls (2FA/passkeys) and upgrade promptly; keep every other asset off the public internet.

**Should I keep my VPN?** It depends. A bastion host solves controlled, per-asset access with audit; for the few cases that need full network-layer interconnectivity (e.g. a development environment), a VPN still has value, and the two can coexist.

**How do I migrate from port forwarding?** First close the externally exposed SSH/RDP ports and onboard the assets into the bastion with per-asset authorization; once permissions are verified, remove the public port mappings and the corresponding security-group rules to avoid a blind spot from running old and new paths in parallel.

## Summary

"Without a VPN" does not mean giving up remote access — it means replacing coarse provisioning with finer authorization and audit. Public port forwarding is cheap but dangerous; a self-hosted VPN encrypts well but blurs the boundary. A **security gateway** reverse tunnel on an **open source bastion host** instead collapses intranet access onto a single manageable, zero-trust path: identity first, per-asset authorization, no public ports, and auditable sessions.

Each approach has its place: port forwarding for quick temporary debugging, a self-hosted VPN where you need full network-layer interconnectivity, and a bastion host with a security gateway when you deal with external collaborators, multiple networks, or compliance requirements. When choosing, compare on: per-asset fine-grained authorization, complete session audit, and how well the reverse tunnel adapts to multiple networks.
