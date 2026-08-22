---
layout: doc
title: "Get Real Client IP — Next Terminal"
description: "How Next Terminal open source bastion host retrieves the real client IP behind reverse proxy and Docker — X-Forwarded-For, real-ip and audit accuracy."
head:
  - - meta
    - name: keywords
      content: real client IP, reverse proxy, X-Forwarded-For, bastion host audit, Next Terminal
  - - meta
    - property: og:title
      content: "Get Real Client IP — Next Terminal"
  - - meta
    - property: og:description
      content: "How Next Terminal open source bastion host retrieves the real client IP behind reverse proxy and Docker — X-Forwarded-For, real-ip and audit accuracy."
---

# Get the Real Client IP

When NextTerminal sits behind Nginx, a CDN, a WAF, or a load balancer, the IP NextTerminal sees on the network connection is the **previous proxy hop**, not the real user. This page explains where and how to configure NextTerminal so that the real client IP is identified correctly.

## ⚠ Important: NextTerminal Has Two IP-Extraction Configurations

The single most common reason users cannot get the real IP working is that they don't realize this: **NextTerminal treats its admin backend and its built-in Web-asset reverse proxy as two independent services, and each has its own IP-extraction configuration.**

| # | Where | Affects |
| --- | --- | --- |
| **A** | `App.ReverseProxy.IpExtractor` / `IpTrustList` in `config.yaml` | Web asset access logs, temporary allowlist, public-access IP rules, geo-restriction — anything driven by the **Web asset reverse proxy** |
| **B** | Admin UI → **System Settings → Network Settings** → "IP Extraction Method" / "Trusted IPs" | Admin **login logs**, IP-based login lockout, login policy IP checks, access token tracking — anything driven by the **admin backend** |

::: tip Which one to change
- **Wrong IP in Web asset access logs** → change A (`config.yaml`).
- **Wrong IP in admin login logs / security audit** → change B (System Settings).
- **Wrong in both** → change both, usually with the same values.
:::

::: warning SelfProxyEnabled = true deployments
When `SelfProxyEnabled: true`, requests to the admin UI first pass through the built-in reverse proxy (A), which then dispatches them to the admin handler (B). In this layout the admin backend sees the built-in proxy as its previous hop, so B usually needs `x-forwarded-for` plus `127.0.0.1/32` in the trust list.
:::

## The Three Extraction Modes

Both A and B accept the same set of values:

| Mode | Description | Use when |
| --- | --- | --- |
| `direct` | Use the network connection's remote IP as the client IP | NextTerminal has no proxy in front (default value) |
| `x-forwarded-for` | Read the real IP from the `X-Forwarded-For` header | **Preferred** whenever there is any proxy in front |
| `x-real-ip` | Read the `X-Real-IP` header | Only when the upstream proxy sets `X-Real-IP` exclusively, with no multi-hop chain |

::: tip Pick `x-forwarded-for` over `x-real-ip`
Whenever multiple proxy hops are possible, prefer `x-forwarded-for`. It records the full chain and survives CDN + Nginx, WAF + load-balancer, and similar mixed deployments. `x-real-ip` carries only the last hop's value.
:::

::: warning Docker userland-proxy can hide the real IP
If NextTerminal is exposed through Docker published ports and every visitor appears as a Docker gateway or host-side address, such as `172.17.0.1` or `172.18.0.1`, check Docker's `userland-proxy` first. Once `userland-proxy` has hidden the original network peer address and no standard `X-Forwarded-For` / `X-Real-IP` header exists, NextTerminal cannot reconstruct the real client IP from its own configuration.

See [Disable Docker userland-proxy](./disable-docker-userland-proxy) for the fix.
:::

## Pick Your Configuration by Access Path

Identify your access path first, then fill in both A and B from the row that matches.

| Access path | A: `config.yaml` (Web asset) | B: System Settings (admin) |
| --- | --- | --- |
| User → NextTerminal | `direct`, trust list empty | `direct`, trust list empty |
| User → NextTerminal (`SelfProxyEnabled: true`) | `direct`, trust list empty | `x-forwarded-for`, trust `127.0.0.1/32` |
| User → Nginx → NextTerminal | `x-forwarded-for`, trust Nginx outbound IP | `x-forwarded-for`, trust Nginx outbound IP |
| User → Load balancer → NextTerminal | `x-forwarded-for`, trust LB origin IP | `x-forwarded-for`, trust LB origin IP |
| User → CDN/WAF → NextTerminal | `x-forwarded-for`, trust **all** CDN/WAF origin ranges | `x-forwarded-for`, trust all CDN/WAF origin ranges |
| User → CDN → Nginx → NextTerminal | `x-forwarded-for`, trust CDN ranges + Nginx IP | `x-forwarded-for`, trust CDN ranges + Nginx IP |

The full configurations for each row are below.

## Scenario 1: User Connects Directly to NextTerminal

Path:

```text
User → NextTerminal
```

**A. config.yaml**

```yaml
App:
  ReverseProxy:
    IpExtractor: "direct"
    IpTrustList: []
```

**B. System Settings → Network Settings**

| Field | Value |
| --- | --- |
| IP extraction method | `Direct` |
| Trusted IPs | empty |

::: warning
If a proxy is actually present and you pick `direct`, you will only ever see the proxy's IP — not the real user's.
:::

## Scenario 2: SelfProxyEnabled Only (No External Proxy)

Path:

```text
User → NextTerminal built-in proxy (:80/:443) → admin UI / Web asset
```

This is the easiest scenario to misconfigure: there is no Nginx, no CDN, but because `SelfProxyEnabled: true` the admin UI goes through the built-in proxy first. From the admin backend's view, "the previous hop" is the built-in proxy on loopback.

**A. config.yaml** (Web asset side)

```yaml
App:
  ReverseProxy:
    SelfProxyEnabled: true
    SelfDomain: "nt.example.com"
    IpExtractor: "direct"
    IpTrustList: []
```

The Web asset reverse proxy is hit directly by users, so `direct` is correct here.

**B. System Settings → Network Settings** (admin side)

| Field | Value |
| --- | --- |
| IP extraction method | `X-Forwarded-For` |
| Trusted IPs | `127.0.0.1/32` |

If you deploy with Docker and the admin log shows the container gateway address (e.g. `172.18.0.1`) instead of `127.0.0.1`, use that range:

| Field | Value |
| --- | --- |
| IP extraction method | `x-forwarded-for` |
| Trusted IPs | `172.18.0.0/16` |

## Scenario 3: User → Nginx → NextTerminal

Path:

```text
User → Nginx → NextTerminal
```

Nginx config:

```nginx
location / {
    proxy_pass http://127.0.0.1:8088;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $http_connection;
}
```

**A. config.yaml**

```yaml
App:
  ReverseProxy:
    IpExtractor: "x-forwarded-for"
    IpTrustList:
      - "127.0.0.1/32"   # Nginx and NextTerminal on the same host, looped back
```

**B. System Settings → Network Settings**

| Field | Value |
| --- | --- |
| IP extraction method | `x-forwarded-for` |
| Trusted IPs | `127.0.0.1/32` |

If Nginx reaches NextTerminal over an internal IP (e.g. `10.0.0.5 → 10.0.0.10`), replace `127.0.0.1/32` with `10.0.0.5/32`.

## Scenario 4: User → CDN, WAF, or Load Balancer

Path:

```text
User → CDN/WAF/Load balancer → NextTerminal
```

or:

```text
User → CDN/WAF/Load balancer → Nginx → NextTerminal
```

**A. config.yaml**

```yaml
App:
  ReverseProxy:
    IpExtractor: "x-forwarded-for"
    IpTrustList:
      - "10.0.0.5/32"        # Nginx / LB origin IP if any
      - "203.0.113.0/24"     # CDN/WAF origin range — placeholder, replace with the real list
```

**B. System Settings → Network Settings**

Use the same extraction method and trust list as A.

::: warning Use the vendor's official origin ranges
Get the **official origin IP range list** from your CDN/WAF console (Cloudflare, AWS CloudFront, Alibaba Cloud CDN, Tencent Cloud CDN, etc.) and add **every** range to the trust list. **Do not** keep the placeholder `203.0.113.0/24` in production.
:::

If your vendor only forwards the real client IP in a custom header (for example Cloudflare's `CF-Connecting-IP`), NextTerminal does not read those custom headers directly. Translate them into a standard `X-Forwarded-For` in your outermost Nginx or load balancer before they reach NextTerminal.

## Scenario 5: Use X-Real-IP

Path:

```text
User → Nginx (sets only X-Real-IP) → NextTerminal
```

Nginx:

```nginx
location / {
    proxy_pass http://127.0.0.1:8088;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**A. config.yaml**

```yaml
App:
  ReverseProxy:
    IpExtractor: "x-real-ip"
    IpTrustList:
      - "127.0.0.1/32"
```

**B. System Settings → Network Settings**

| Field | Value |
| --- | --- |
| IP extraction method | `X-Real-IP` |
| Trusted IPs | `127.0.0.1/32` |

::: warning
`X-Real-IP` can be forged by clients, so it is only honored when the request comes from a trusted proxy. If your chain has a CDN, WAF, or any multi-hop layout, switch to `x-forwarded-for`.
:::

## How to Fill In the Trust List

**Trust list entries are the IPs / CIDRs of trusted proxies — not regular users.**

Example:

```text
Real user IP:    8.8.8.8
Nginx IP:        10.0.0.5
NextTerminal IP: 10.0.0.10

Path:
8.8.8.8 → 10.0.0.5 → 10.0.0.10
```

✅ Correct:

```yaml
IpTrustList:
  - "10.0.0.5/32"
```

❌ Wrong:

```yaml
IpTrustList:
  - "8.8.8.8/32"
```

`8.8.8.8` is a regular user IP. Putting it in the trust list is meaningless and unsafe.

### Multi-hop Example

```text
Real user IP:    8.8.8.8
CDN origin IP:   203.0.113.10
Nginx IP:        10.0.0.5
NextTerminal IP: 10.0.0.10

Path:
8.8.8.8 → 203.0.113.10 → 10.0.0.5 → 10.0.0.10
```

✅ Correct:

```yaml
IpTrustList:
  - "203.0.113.10/32"
  - "10.0.0.5/32"
```

CDNs typically have dozens to hundreds of origin ranges. Add every range from the vendor's list.

## How `X-Forwarded-For` Is Parsed

A typical header looks like:

```text
X-Forwarded-For: 8.8.8.8, 203.0.113.10, 10.0.0.5
```

It records roughly:

```text
8.8.8.8 → 203.0.113.10 → 10.0.0.5 → NextTerminal
```

In `x-forwarded-for` mode NextTerminal scans the list **right to left**:

1. If the IP is in the trust list, it's a trusted proxy — keep going left.
2. The first IP **not** in the trust list becomes the real client IP.

For example, with:

```yaml
IpTrustList:
  - "203.0.113.10/32"
  - "10.0.0.5/32"
```

and `X-Forwarded-For: 8.8.8.8, 203.0.113.10, 10.0.0.5`, the resolved client IP is `8.8.8.8`.

## Default Trusted Ranges

Even if `IpTrustList` is empty, NextTerminal automatically trusts the following ranges to keep typical internal deployments simple:

- IPv4: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8` (loopback), `169.254.0.0/16` (link-local)
- IPv6: `fc00::/7`, `::1/128`, `fe80::/10`

::: warning This behavior is built in and cannot be disabled
Even if you fill in your own `IpTrustList`, the ranges above are always appended. If your proxy is in those ranges, you can leave the trust list empty. If it is not (for example a public CDN origin range), you must add it explicitly.
:::

::: tip Still recommended in production
Default private-range trust is just a convenience. For multi-cloud, container-network, or mixed public/private deployments, list your real proxy IPs / ranges explicitly — it makes auditing and troubleshooting much easier.
:::

## Troubleshooting

### 1. Confirm the access path

Write the chain down:

```text
User → ? → ? → NextTerminal
```

Don't fill in the trust list if you can't write the chain.

### 2. Check whether the proxy actually forwards the headers

For Nginx, add a debug log temporarily:

```nginx
log_format realip_debug '$remote_addr | $http_x_forwarded_for | $http_x_real_ip | $host | $request';
access_log /var/log/nginx/realip_debug.log realip_debug;
```

Hit NextTerminal or a Web asset once and inspect:

| Field | Meaning |
| --- | --- |
| `$remote_addr` | The previous hop Nginx sees |
| `$http_x_forwarded_for` | `X-Forwarded-For` from the upstream |
| `$http_x_real_ip` | `X-Real-IP` from the upstream |

Diagnose:

- Empty `X-Forwarded-For` → the upstream did not set it; fix the upstream first.
- Header has values but NextTerminal still shows the proxy IP → extraction mode or trust list is wrong.
- Every user shows the same IP → you are seeing the last proxy's IP.

### 3. Check the right log page for the symptom

| Symptom appears in | Configuration to change |
| --- | --- |
| Web Assets → Access Logs | A: `config.yaml` |
| Login Logs / Security Audit / Login lockout | B: System Settings → Network Settings |

### 4. When changes take effect

| Configuration | Takes effect |
| --- | --- |
| A: `config.yaml` change | **Restart required** |
| B: System Settings → Network Settings | **Immediately on save**, no restart |

### 5. Don't trust everyone

❌ Don't do this:

```yaml
IpTrustList:
  - "0.0.0.0/0"
  - "::/0"
```

That trusts every source, which lets clients forge `X-Forwarded-For` / `X-Real-IP` and bypass IP-based controls.

## Security Notes

1. Never trust HTTP headers blindly. `X-Forwarded-For` and `X-Real-IP` can both be forged.
2. Only honor proxy IP headers when the request comes from a trusted proxy.
3. The trust list contains only trusted proxy IPs / ranges.
4. Outermost proxies should **overwrite** or correctly **append** client-supplied IP headers so users can't smuggle their own values.
5. Don't ship `0.0.0.0/0` or `::/0` to production.

## Related Docs

- [Web Asset Guide](../usage/website) — Configure the Web asset reverse proxy
- [`config.yaml` Reference](./config-desc) — Full field reference
- [Reverse Proxy NextTerminal](./reverse-proxy) — Putting Nginx / Caddy in front of NextTerminal
