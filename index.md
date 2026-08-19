---
layout: doc
title: Next Terminal Documentation
description: Official Next Terminal documentation for installation, secure remote access, asset management, gateways, authentication, operations audit, upgrades, and troubleshooting.
head:
  - - meta
    - name: keywords
      content: Next Terminal documentation, bastion host installation, Web SSH, remote access, operations audit
---

# Next Terminal Documentation

Use this documentation to deploy Next Terminal, connect your first asset, configure secure access, and maintain an existing installation. Next Terminal brings SSH, RDP, VNC, SFTP, Telnet, Web assets, permissions, and operations audit into one self-hosted access platform.

## Install and operate

- [Check system requirements](/install/system-requirements) before choosing a host.
- [Install with Docker Compose](/install/container-install) and initialize the administrator account.
- [Configure a reverse proxy](/install/reverse-proxy) and preserve the [real client IP](/install/real-ip).
- Plan availability with the [primary/standby deployment guide](/install/ha-primary-standby-guide).

## Start using Next Terminal

- Follow the [quick start](/usage/readme) to sign in and understand the dashboard.
- Add and organize [assets and credentials](/usage/asset).
- Connect through the [asset access workspace](/usage/access), [SSH proxy server](/usage/ssh-server), or [RDP proxy server](/usage/rdp-server).
- Publish internal applications as [Web assets](/usage/website) or reach private networks through a [security gateway](/usage/agent-gateway).

## Identity and access security

- Enable [Passkey sign-in](/usage/passkey) or [TOTP two-factor authentication](/usage/otp).
- Integrate applications with the [OIDC identity server](/usage/oidc_server).
- Configure [HTTPS mutual TLS](/usage/mtls) when client-certificate authentication is required.

## Maintain and troubleshoot

- Start with the [FAQ and troubleshooting hub](/faq/readme).
- Review [configuration options](/install/config-desc) and [system properties](/faq/property).
- Back up before upgrades and follow the dedicated [PostgreSQL 16 to 18 migration guide](/faq/postgresql-16-to-18) only if you choose to migrate database major versions.

For product positioning and capabilities, visit the [Next Terminal official website](https://next-terminal.typesafe.cn/). Version-specific behavior should always be checked against the documentation for the version you run.
