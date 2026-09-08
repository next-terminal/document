---
layout: doc
title: "Troubleshooting — Next Terminal"
description: "Find Next Terminal troubleshooting guidance by symptom for authentication, SSH, RDP/VNC, files, Web assets and gateways."
---

# Troubleshooting

This section is organized by symptoms. Use the [User Guide](/usage/readme) for normal configuration and workflows; backup, upgrades and migrations live under system maintenance or installation.

## Find an issue by category

| Category | Typical symptoms | Guide |
| --- | --- | --- |
| Authentication | Locked account, secret viewing, OTP or Passkey | [Authentication](./authentication) |
| SSH | Authentication failure, key incompatibility, disconnects or encoding | [SSH Connections](./ssh) |
| Windows / RDP / VNC | Black screen, disconnect, domain, clipboard or RealVNC | [RDP and VNC](./rdp-vnc) |
| Files | Empty SFTP, missing file button or absent Windows upload | [File Management](./file-management) |
| Web assets | Domain, WebSocket, redirect or Grafana Origin errors | [Web Assets](./web-assets) |
| Network and gateways | Offline asset, gateway routing, IPv6 or WOL | [Network and Gateways](./network-gateway) |

## General diagnostic order

1. Record the complete error, time, user and asset.
2. Determine whether one user/asset or the entire system is affected.
3. Test the same asset as an administrator to separate connection and authorization issues.
4. Check [Resource Authorization](/usage/authorization).
5. Test connectivity from Next Terminal or the selected gateway to the target.
6. Search [Audit Logs](/usage/audit).
7. Start a new session after configuration changes.

## Information to include in a support request

- Next Terminal version and deployment method.
- Browser or native client and version.
- Protocol, target OS and access method.
- Gateway or gateway-chain use.
- Complete error and timestamp.
- Reproduction steps and whether an administrator also fails.
- Relevant logs with passwords, tokens, private keys, cookies and sensitive addresses removed.

## Maintenance and reference

- [Backup and Restore](/usage/backup)
- [CLI Reference](/usage/cli)
- [System Property Reference](/usage/system-properties)
- [Native Installation Upgrade](/install/native-upgrade)
- [PostgreSQL 16 to 18 Migration](/install/postgresql-16-to-18)
- [Upgrade 1.x to 2.x (historical)](/install/v1-to-v2)
