---
layout: doc
title: "Database Won't Expose to Public? 3 Secure Remote Access Methods for MySQL/PostgreSQL"
description: "MySQL远程访问、PostgreSQL远程、数据库安全、堡垒机 — 3 ways to securely access MySQL/PostgreSQL remotely without exposing database ports: SSH tunnel, bastion host with audit, WireGuard/Tailscale VPN."
head:
  - - meta
    - name: keywords
      content: MySQL远程访问,PostgreSQL远程,数据库安全,堡垒机,SSH tunnel,database port forwarding,WireGuard database,Tailscale
  - - meta
    - property: og:title
      content: "Database Won't Expose to Public? 3 Secure Remote Access Methods for MySQL/PostgreSQL"
  - - meta
    - property: og:description
      content: "MySQL remote access, PostgreSQL remote, database security, bastion host audit — 3 secure methods to connect to databases remotely without exposing ports."
date: 2026-08-31
updated: 2026-08-31
author: Next Terminal Team
---

# Database Won't Expose to Public? 3 Secure Remote Access Methods for MySQL/PostgreSQL

When deploying MySQL or PostgreSQL on a cloud server, the first instinct is often to open port 3306 or 5432 to the public internet. This is essentially painting a target on your server — Shodan and Censys index millions of exposed database ports, and brute-force and ransomware attacks are non-stop. This article presents **3 secure remote access methods that don't require exposing database ports**, progressing from lightweight SSH tunnels to enterprise-grade bastion host auditing.

## Method 1: SSH Tunnel Port Forwarding

SSH tunneling is the lightest-weight solution — zero additional components, just a server with public SSH access.

### How It Works

The local client connects to a jump server via SSH and maps a local port to the remote database port. All traffic is encrypted through the SSH tunnel. The database only listens on localhost or an internal address, with no public exposure.

### Setup

```bash
# 将本地 3307 端口 forwarded to remote internal MySQL 3306
ssh -L 3307:127.0.0.1:3306 user@jump-server -N -f
# PostgreSQL: ssh -L 5433:127.0.0.1:5432 user@jump-server -N -f

# Connect to the database locally
mysql -h 127.0.0.1 -P 3307 -u dbuser -p
```

### Pros and Cons

| Dimension | Description |
| --- | --- |
| Deployment cost | Zero, only requires SSH |
| Audit capability | None — no SQL statement logging |
| Use case | Individual developers, ad-hoc debugging |
| Limitations | No operation audit, inconvenient multi-user management |

## Method 2: Bastion Host with Audit

When multiple team members need database access, SSH tunnels lack unified management and operation auditing — a classic use case for [database audit](/usage/database).

### How It Works

The bastion host serves as the single entry point for all database access. Connections are proxied through the bastion, which logs user identity, SQL statements, and execution results for compliance and internal audit requirements.

### Setup

Using [Next Terminal](https://www.next-terminal.com) as an example, after configuring the database proxy, users connect via the command line:

```bash
# Connect to MySQL through bastion proxy
mysql -h bastion-host -P 7001 -u dbuser@mysql-prod -p

# Connect to PostgreSQL through bastion proxy
psql -h bastion-host -p 7002 -U dbuser@pg-prod -d mydb
```

The database listens only on an internal address; the bastion exposes the proxy port:

```bash
# Verify MySQL listens only on internal address
ss -tlnp | grep 3306
# Output: 10.0.1.50:3306 — internal only

# Verify bastion proxy port
ss -tlnp | grep 7001
# Output: 0.0.0.0:7001 — externally reachable
```

### Pros and Cons

| Dimension | Description |
| --- | --- |
| Deployment cost | Medium — requires bastion host |
| Audit capability | Complete — SQL-level audit, session recording |
| Use case | Team collaboration, compliance auditing |
| Limitations | Adds a hop, requires bastion maintenance |

> Combining with a [security gateway](/usage/agent-gateway) further reduces database exposure by whitelisting only internal network access.

## Method 3: WireGuard / Tailscale VPN

For scenarios requiring frequent connections to multiple databases, VPNs provide the closest experience to being on the local network.

### How It Works

An encrypted tunnel is established between the database server and the developer's machine, making both sides appear to be on the same LAN. WireGuard is kernel-level VPN with performance superior to OpenVPN. Tailscale wraps WireGuard with mesh networking and NAT traversal for zero-configuration setup.

### Setup

WireGuard configuration:

```bash
# Database server wg0.conf
[Interface]
Address = 10.10.0.1/24
ListenPort = 51820
PrivateKey = <server-private-key>

[Peer]
PublicKey = <client-public-key>
AllowedIPs = 10.10.0.2/32

# Client wg0.conf
[Interface]
Address = 10.10.0.2/24
PrivateKey = <client-private-key>

[Peer]
PublicKey = <server-public-key>
Endpoint = db-server-ip:51820
AllowedIPs = 10.10.0.0/24
PersistentKeepalive = 25

# After connecting, access via VPN internal address:
# mysql -h 10.10.0.1 -P 3306 -u dbuser -p
# psql -h 10.10.0.1 -p 5432 -U dbuser -d mydb
```

Tailscale is even simpler — install on both ends, log in, and the mesh network forms automatically:

```bash
# Install and authenticate on both ends
tailscale up

# Connect to database via Tailscale IP
mysql -h 100.x.x.x -P 3306 -u dbuser -p
```

### Pros and Cons

| Dimension | Description |
| --- | --- |
| Deployment cost | Low for WireGuard, zero for Tailscale |
| Audit capability | None — requires additional tooling |
| Use case | Frequent multi-DB access, dev/test environments |
| Limitations | No SQL audit, WireGuard requires kernel support |

## Comparison

| | SSH Tunnel | Bastion Host Audit | VPN (WireGuard/Tailscale) |
| --- | --- | --- | --- |
| Public exposure | SSH only | Proxy port | VPN port |
| SQL audit | ❌ | ✅ | ❌ |
| Deployment complexity | Low | Medium | Low |
| Multi-user management | Poor | Good | Medium |
| Compliance audit | Not met | Met | Not met |
| Connection latency | Slightly higher | Medium | Lowest |
| Recommended for | Personal / ad-hoc | Team / production | Dev / test |

## Summary

- **Individual developers**: SSH tunnel is sufficient — zero-cost remote access for ad-hoc needs.
- **Team production environments**: Bastion host is the only correct answer — audit and compliance are non-negotiable.
- **Dev/test environments**: WireGuard or Tailscale provide a smooth local-network experience.

The core principle holds regardless of method: **database ports should never be directly exposed to the public internet**. Next Terminal v3.8.1 adds PostgreSQL protocol-level audit support to the bastion host solution, combined with SQL work-order approval and session recording for secure and traceable database remote access.

---

**Next steps:**

- Learn about database auditing at [Database Audit](/usage/database).
- Security gateway setup at [Security Gateway](/usage/agent-gateway).
- Evaluate Next Terminal pricing at [Next Terminal Pricing](https://www.next-terminal.com/pricing) and try the [online demo](https://demo.next-terminal.com).
