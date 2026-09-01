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

## Key notes on the built-in reverse proxy

Web asset publishing is handled by Next Terminal's built-in reverse proxy. The relevant settings live under `App.ReverseProxy` in `config.yaml`:

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

Worth calling out: `SelfDomain` is the admin domain, so the built-in proxy serves the console and Web assets on the same port pair; turn on `HttpRedirectToHttps` to push HTTP traffic to HTTPS. If an external proxy (Nginx/CDN) sits in front, do not leave `IpExtractor` as `direct` — otherwise audit and rate limiting will record the previous hop's IP. Configure it per [Get the Real Client IP](/install/real-ip).

**Do not confuse the two addresses.** The Web asset domain (what users type, e.g. `gitlab.example.com`) must resolve to Next Terminal, not to the internal service itself — misconfiguring this is the most common first-time error. The asset address (e.g. `http://192.168.1.10:80`) is the internal location the proxy actually forwards to. Two A records to the same public IP are enough:

| Host | Type | Value |
| --- | --- | --- |
| `nt` | A | `1.2.3.4` |
| `gitlab` | A | `1.2.3.4` |

With many Web assets, use a wildcard `*.example.com → 1.2.3.4` so new entries like `wiki.example.com` need no further DNS changes.

Certificates are managed in the admin UI under Certificate Management, with support for self-signed (testing only — the browser will warn), imported PEM, and auto-issued ACME certificates. For production use a valid certificate covering `nt.example.com` and `gitlab.example.com`, or a wildcard `*.example.com`. If you need stronger endpoint identity, layer [HTTPS mTLS](/usage/mtls) on top of Web assets: Web assets decide who may access which system, and mTLS adds client-certificate verification.

The proxy routes each request by domain to the internal service, e.g. `gitlab.example.com → http://192.168.1.10:80`. Every access through this entry lands in the unified audit log — unauthenticated visits redirect to login, authorized users pass straight through, and unauthorized access is denied and recorded.

## Unified entry for multi-network environments with Security Gateways

When Web services span multiple clouds, sites or isolated networks, you do not need a separate public entry per network. Deploy a lightweight [Security Gateway](/usage/agent-gateway) in each internal network; gateways register back to Next Terminal via reverse tunnels. When creating a Web asset, select the matching gateway — all services become reachable through one entry point.

For gateway configuration and network filtering, see [Security Gateway](/usage/agent-gateway) and [Security Gateway Configuration](/usage/agent-gateway-config), including fields such as `network_include`.
