---
layout: doc
title: Next Terminal Documentation
description: Next Terminal open source bastion host and PAM documentation — install, SSH/RDP/VNC/Telnet access, asset management, session audit and recording. A JumpServer/Teleport alternative.
head:
  - - meta
    - name: keywords
      content: Next Terminal, bastion host, open source bastion host, JumpServer alternative, Teleport alternative, PAM, jump server, SSH bastion, RDP audit, operations audit, session recording
---

# Next Terminal Documentation

Use this documentation to deploy Next Terminal, connect your first asset, configure secure access, and maintain an existing installation. Next Terminal brings SSH, RDP, VNC, SFTP, Telnet, Web assets, permissions, and operations audit into one self-hosted access platform.

## Install and operate

- [Check system requirements](/docs/install/system-requirements) before choosing a host.
- [Install with Docker Compose](/docs/install/container-install) and initialize the administrator account.
- [Configure a reverse proxy](/docs/install/reverse-proxy) and preserve the [real client IP](/docs/install/real-ip).
- For production, design database, recording storage, mapped-drive storage, and ingress availability together.

## Start using Next Terminal

- Follow the [quick start](/docs/usage/readme) to sign in and understand the dashboard.
- Add and organize [assets and credentials](/docs/usage/asset).
- Connect through the [asset access workspace](/docs/usage/access), [SSH proxy server](/docs/usage/ssh-server), or [RDP proxy server](/docs/usage/rdp-server).
- Publish internal applications as [Web assets](/docs/usage/website) or reach private networks through a [security gateway](/docs/usage/agent-gateway).

## Identity and access security

- Enable [Passkey sign-in](/docs/usage/passkey) or [TOTP two-factor authentication](/docs/usage/otp).
- Integrate applications with the [OIDC identity server](/docs/usage/oidc_server).
- Configure [HTTPS mutual TLS](/docs/usage/mtls) when client-certificate authentication is required.

## Maintain and troubleshoot

- Start with the [FAQ and troubleshooting hub](/docs/faq/readme).
- Review [configuration options](/docs/install/config-desc) and [system properties](/docs/usage/system-properties).
- Back up before upgrades and follow the dedicated [PostgreSQL 16 to 18 migration guide](/docs/install/postgresql-16-to-18) only if you choose to migrate database major versions.

For product positioning and capabilities, visit the [Next Terminal official website](https://www.next-terminal.com/). Version-specific behavior should always be checked against the documentation for the version you run.
