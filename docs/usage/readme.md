---
layout: doc
title: "Quick Start — Next Terminal"
description: "Initialize an administrator, add the first asset, authorize a user and open a browser session in Next Terminal."
---

# Quick Start

This page provides the shortest path from first sign-in to opening an asset, followed by a task-oriented map of the user guides.

## First-time workflow

### 1. Initialize and sign in

Create the administrator after installation, then sign in to the management interface.

![Initialize administrator](images/setup.png)

![Sign in](images/login.png)

![Dashboard](images/dashboard.png)

### 2. Choose the resource type

- Linux, Unix or network devices: [SSH Assets](/docs/usage/ssh)
- Windows servers or desktops: [Windows / RDP Assets](/docs/usage/rdp)
- VNC or Telnet: [VNC and Telnet Assets](/docs/usage/vnc-telnet)
- Internal websites: [Web Assets](/docs/usage/website)
- Databases: [Database Audit](/docs/usage/database)

If Next Terminal cannot directly reach the target network, configure a [Security Gateway](/docs/usage/agent-gateway) or [SSH Gateway](/docs/usage/ssh-gateway) first.

### 3. Create credentials and the asset

Create a reusable [Credential](/docs/usage/credential) when appropriate. Add the asset with its protocol, address, port and target account, then perform an administrator connection test. See [Asset Management Overview](/docs/usage/asset).

### 4. Authorize users

Under **Resource Authorization > Asset Authorization**, select users or departments and assets or asset groups. Attach an access strategy and expiration when needed. See [Resource Authorization](/docs/usage/authorization).

### 5. Open the asset

Users open authorized assets from the [Browser Access Workspace](/docs/usage/access). For native clients, use the [SSH Proxy Server](/docs/usage/ssh-server), [RDP Proxy Server](/docs/usage/rdp-server) or [Termark](/docs/usage/termark).

### 6. Verify audit records

After a test operation, verify online/offline sessions, command logs, file logs and access logs so that authorization, recording and audit behavior match expectations.

## Find a guide by task

| Task | Guide |
| --- | --- |
| Add and organize protocol assets | [Asset Overview](/docs/usage/asset) |
| Manage passwords and SSH keys | [Credentials](/docs/usage/credential) |
| Assign assets and file permissions | [Resource Authorization](/docs/usage/authorization) |
| Upload/download files on Linux | [SSH File Management](/docs/usage/file-management#ssh-file-management) |
| Transfer files between Windows and a local computer | [Windows File Management](/docs/usage/rdp#windows-file-management) |
| Reach a VPC, office or remote network | [Security Gateway](/docs/usage/agent-gateway) |
| Use a standard SSH client | [SSH Proxy Server](/docs/usage/ssh-server) |
| Use Windows Remote Desktop | [RDP Proxy Server](/docs/usage/rdp-server) |
| Publish an authenticated internal site | [Web Assets](/docs/usage/website) |
| Configure MFA | [Passkey](/docs/usage/passkey) or [TOTP](/docs/usage/otp) |

## Recommended go-live checks

1. Test an asset as both administrator and normal user.
2. Confirm users see only authorized assets.
3. Confirm file and clipboard controls match the strategy.
4. Enable HTTPS and MFA for external entry points.
5. Verify session, command and file audit logs.
6. Set expiration for temporary access.
