---
layout: doc
title: "Compliance with Next Terminal — Meeting Audit and Regulatory Requirements"
description: "How Next Terminal open source bastion host helps meet compliance: session audit and recording, command interception, access control, mTLS, offline sessions and access log analytics for regulated operations."
head:
  - - meta
    - name: keywords
      content: bastion host compliance, audit, session recording, command audit, mTLS, offline recording, access log analytics, Next Terminal
  - - meta
    - property: og:title
      content: "Compliance with Next Terminal — Audit and Regulatory Requirements"
  - - meta
    - property: og:description
      content: "Map Next Terminal capabilities to audit/compliance controls: recordings, command rules, access policies and log analytics."
---

# Compliance with Next Terminal

Next Terminal is a self-hosted bastion host. For teams that face internal audit or external compliance requirements, this page maps product capabilities to common controls. It is not legal advice — validate against your specific framework (e.g., ISO 27001, SOC 2, internal audit).

## What auditors typically ask

| Control | Question |
|---------|----------|
| Access control | Who can access which asset, from where, and when? |
| Authentication | How is identity verified before access? |
| Session accountability | Can every operation be traced to a person? |
| Evidence retention | Are recordings and logs retained and tamper-evident? |
| Least privilege | Can high-risk actions be blocked before execution? |

## How Next Terminal addresses each control

### 1. Access control and least privilege

- **Asset authorization** by user, group and asset ([Assets](/usage/asset), [Asset Access](/usage/access)); time/source constraints via sign-in policies.
- **Access policies** ([Access Policies](/usage/access)) and **command filtering** ([SSH Proxy](/usage/ssh-server)) for high-risk commands — block or require approval before execution.
- **Security Gateway** ([Security Gateway](/usage/agent-gateway)) for VPC/multi-site assets — single entry, no direct public ports.

### 2. Strong authentication

- **Passkey/WebAuthn** ([Passkey](/usage/passkey)), **TOTP** ([OTP](/usage/otp)), **LDAP** and **OIDC** ([OIDC](/usage/oidc_server)) — bring remote access into the corporate IdP.
- **mTLS client certificates** ([mTLS](/usage/mtls), `strict/ca_only`) — verify identity before the reverse proxy forwards to the business system.
- **SSH Gateway** ([SSH Gateway](/usage/ssh-gateway)) keeps `ssh user@host` workflows under bastion authentication.

### 3. Session audit, recording and replay

- **Online sessions** plus **offline recording** and **transcoding** — retain text and graphical sessions for replay; see [RDP Proxy](/usage/rdp-server) and [Pricing — enhanced audit](https://www.next-terminal.com/pricing).
- **File operation logs** and **SQL audit** ([Database Audit](/usage/database)) — who did what, when.
- **Access log analytics** — aggregate access events for review and alerts (enhanced edition).

### 4. Evidence retention and separation

- Recordings to **local or S3** (`App.Recording.Type: s3`); `data` on shared storage only for the demo HA path — see [Primary/Standby HA](/install/ha-primary-standby-guide) and [Production HA Checklist](/install/ha-production-checklist) for S3 migration.
- **System backup** ([Backup](/faq/backup)) — PostgreSQL + `data` (or S3 versioning) with restore drills.

## Suggested policy set (starter)

1. Require MFA (Passkey or TOTP) + mTLS for Web assets exposed via reverse proxy.
2. Block high-risk commands (e.g., `rm -rf /`, `drop database`) via command rules; exempt only via approval workflow.
3. Retain recordings ≥180 days (or per policy), store in S3 with object lock/versioning.
4. Quarterly HA and restore drills (see Checklist) and retain drill logs as audit evidence.

## What to show an auditor

- User/asset authorization matrix export
- Sample session replay + file/SQL audit log
- Access log analytics report
- mTLS/IdP configuration and sign-in policy
- Backup/restore drill record and HA checklist sign-off

> Questions about a specific framework? Open an issue with your control list at [GitHub](https://github.com/next-terminal/next-terminal) or contact via [License Portal](https://license.next-terminal.com).
