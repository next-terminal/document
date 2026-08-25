---
layout: doc
title: "Secure Web Asset Publishing: Replace VPN with Next Terminal"
description: "Publish internal Web systems securely with Next Terminal open source bastion host: browser-native Web assets and built-in reverse proxy as a VPN/frp alternative — identity-first, per-asset authorization, unified audit. A lightweight JumpServer/Teleport alternative."
head:
  - - meta
    - name: keywords
      content: "web asset, security gateway, VPN alternative, frp alternative, bastion host, open source bastion, zero trust, Next Terminal, JumpServer alternative, Teleport alternative"
  - - meta
    - property: og:title
      content: "Secure Web Asset Publishing: Replace VPN with Next Terminal"
  - - meta
    - property: og:description
      content: "Expose internal GitLab, Jenkins and more through Next Terminal Web assets and built-in reverse proxy — browser-native, identity-first, unified entry with audit."
---

# Secure Web Asset Publishing: Replace VPN with Next Terminal

For teams that need to expose internal systems, a **bastion host** is no longer just an SSH jump box. As GitLab, Jenkins, wikis and internal admin panels grow, securely publishing Web services without rolling out a VPN has become a decisive factor when evaluating an **open source bastion host**. Next Terminal addresses this with **Web Assets** and a built-in reverse proxy: a zero-trust gateway that replaces VPN and frp, verifies identity and authorization in the browser, then forwards the request — with a unified audit trail.

This guide shows the minimal working setup for your first Web Asset and how to extend it to multi-network environments with Security Gateways. All steps follow the current v3.7.2 documentation.

## Why internal Web services should not be exposed directly

Mapping `192.168.1.10:80` to a public port or pushing an internal service to the internet with frp may be the fastest short-term fix, but it creates three long-term risks:

- **Larger attack surface**: scanners discover non-standard ports within minutes, followed by brute-force probes and vulnerability scans.
- **No identity or authorization**: frp solves connectivity, not the question of who may access which asset. Once a port is reachable, anyone can try the target system.
- **Missing audit**: without a central gateway you cannot trace who accessed which page, when, or whether an access was an unauthorized attempt — a gap for operations audit and compliance.

A bastion-host-based publishing path enforces an identity-first, forward-after-verification model that reduces exposure and keeps a single audit log.

## Limitations of VPN and frp

| Approach | Strength | Limitation | Best for |
| --- | --- | --- | --- |
| VPN (e.g. WireGuard) | Network-layer encryption; natural access once connected | Client distribution, routing and reconnection overhead; a leaked account often grants overly broad network access | Stable office networks with dedicated network admins |
| frp / tunneling | Lightweight, good connectivity | No identity/authorization, weak audit; pushes internal services to the public internet | Temporary debugging, personal projects |
| **Next Terminal Web Assets** | **Browser-native, identity and authorization first, per-asset fine-grained control, unified audit** | Requires correct DNS/certificate and reverse proxy ports | **Small teams self-hosting a JumpServer/Teleport alternative that covers SSH and Web access** |

If you are comparing a **JumpServer alternative** or **Teleport alternative**, pay close attention to Web publishing usability and audit completeness.

## How the Web asset gateway works

Typical flow:

```text
User browser
  → opens https://gitlab.example.com
  → DNS points to the Next Terminal server
  → Next Terminal verifies login and Web asset authorization
  → forwards to internal address http://192.168.1.10:80
```

Two addresses must not be confused:

- **Web asset domain** (e.g. `gitlab.example.com`): what users type in the browser; it must resolve to the Next Terminal server.
- **Asset address** (e.g. `192.168.1.10:80`): the internal Web service that Next Terminal forwards to.

Forwarding is handled by Next Terminal's built-in reverse proxy, which is a different layer from an external reverse proxy such as Nginx or a CDN placed in front of Next Terminal. With a simple **User → Next Terminal → Internal service** chain, the configuration below is enough. If the chain is **User → Nginx/CDN → Next Terminal → Internal service**, handle real client IP correctly — see [Get the Real Client IP](/install/real-ip) and [Reverse Proxy](/install/reverse-proxy).

> For the full asset and authorization model, see [Web Assets](/usage/website) and [Assets](/usage/asset).

## Publish your first Web asset in 5 minutes

The example maps `gitlab.example.com → http://192.168.1.10:80`.

### Prerequisites

- Next Terminal is deployed via [Container Installation](/install/container-install) and the admin UI is reachable.
- You control DNS for the domain and can create `nt.example.com` (admin) and `gitlab.example.com` (Web asset).
- The Next Terminal server (or the chosen Security Gateway) can reach `192.168.1.10:80`.
- Port `80`/`443` on the Next Terminal server is reachable by users.

### 1. Configure DNS

Add two A records to the same public IP (example `1.2.3.4`):

| Host | Type | Value |
| --- | --- | --- |
| `nt` | A | `1.2.3.4` |
| `gitlab` | A | `1.2.3.4` |

For many Web assets, use a wildcard record `*.example.com → 1.2.3.4` so new entries like `wiki.example.com` need no further DNS changes.

### 2. Enable the built-in reverse proxy

Edit `config.yaml` under `App`:

```yaml
App:
  ReverseProxy:
    Enabled: true
    HttpEnabled: true
    HttpAddr: ":80"
    HttpRedirectToHttps: true
    HttpsEnabled: true
    HttpsAddr: ":443"
    SelfProxyEnabled: true
    SelfDomain: "nt.example.com"
    Root: ""
    IpExtractor: "direct"
    IpTrustList: []
```

Notes: `SelfDomain` is the admin domain; enabling `HttpRedirectToHttps` is recommended. If an external proxy sits in front, do not leave `IpExtractor` as `direct` — adjust it per [Get the Real Client IP](/install/real-ip).

### 3. Map ports and restart

For a container deployment, expose the proxy ports:

```yaml
services:
  next-terminal:
    ports:
      - "8088:8088" # Admin UI
      - "80:80"     # Web asset HTTP
      - "443:443"   # Web asset HTTPS
```

Then:

```shell
docker compose down
docker compose up -d
```

### 4. Configure certificates

Go to **Certificate Management** in the admin UI. Supported types include self-signed (testing only), imported PEM, and auto-issued ACME certificates. The certificate must cover both `nt.example.com` and `gitlab.example.com`, or use a wildcard `*.example.com`.

### 5. Create and authorize the Web asset

In **Resource Management → Web Assets**, create a new asset with domain `gitlab.example.com` and asset address `http://192.168.1.10:80`, then authorize it to users or groups. See [Web Assets](/usage/website) for field details.

Verification:

- An unauthenticated visit to `https://gitlab.example.com` redirects to the Next Terminal login.
- An authenticated and authorized user reaches GitLab directly.
- An unauthorized user is denied, and each attempt is recorded in audit logs.

## Unified entry for multi-network environments with Security Gateways

When Web services span multiple clouds, sites or isolated networks, you do not need a separate public entry per network. Deploy a lightweight [Security Gateway](/usage/agent-gateway) in each internal network; gateways register back to Next Terminal via reverse tunnels. When creating a Web asset, select the matching gateway — all services become reachable through one entry point.

For gateway configuration and network filtering, see [Security Gateway](/usage/agent-gateway) and [Security Gateway Configuration](/usage/agent-gateway-config), including fields such as `network_include`.

## FAQ

**What should the Web asset domain be?** The domain users open in the browser (e.g. `gitlab.example.com`). It must resolve to Next Terminal, not to the internal service itself — misconfiguring this is the most common first-time error.

**Is 443 required?** HTTPS with a valid certificate is recommended for production. Self-signed certificates work for internal testing but trigger browser warnings.

**What if Nginx or a CDN already sits in front of Next Terminal?** That creates a two-layer structure (external proxy in front, built-in proxy behind). Be sure to forward and parse the real client IP correctly; otherwise audit and rate limiting will record the previous hop's IP.

**Can Web assets be combined with mTLS?** Yes. Web assets control who may access which Web system; [HTTPS mTLS](/usage/mtls) adds client-certificate verification on top, for environments that need stronger endpoint identity.

## Summary

Compared with VPN's broad network access or frp's direct port exposure, Next Terminal Web Assets provide a pragmatic zero-trust path: verify identity and authorization in the browser first, then let the bastion gateway forward to the internal target — easy to use and fully auditable. For small teams looking for a lightweight, self-hosted way to unify SSH and Web access, it is a solid **VPN alternative**.

To try it quickly, bring up the service via [Container Installation](/install/container-install), follow [Web Assets](/usage/website) and [Security Gateway](/usage/agent-gateway) for the first publish, or explore the live demo and pricing at [https://demo.next-terminal.com](https://demo.next-terminal.com) and [https://www.next-terminal.com/pricing](https://www.next-terminal.com/pricing).
