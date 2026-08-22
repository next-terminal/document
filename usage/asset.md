---
layout: doc
title: "Asset Management — Next Terminal"
description: "Asset management in Next Terminal open source bastion host — SSH/RDP/VNC/Telnet assets, groups, credentials and authorization for unified access."
head:
  - - meta
    - name: keywords
      content: asset management, bastion host, SSH asset, RDP asset, Next Terminal, open source bastion
  - - meta
    - property: og:title
      content: "Asset Management — Next Terminal"
  - - meta
    - property: og:description
      content: "Asset management in Next Terminal open source bastion host — SSH/RDP/VNC/Telnet assets, groups, credentials and authorization for unified access."
---

# Asset Management

### Supported Protocols
- RDP (Windows Remote Desktop)
- SSH (Secure shell for Linux/Unix)
- VNC (Graphical remote control)
- Telnet (Traditional terminal protocol)

### Add an Asset
1. Click **Add Asset**.
2. Select the protocol type.
3. Fill in connection information:
   - Enter username/password directly, or
   - Select pre-created credential records.
4. Save.

![Asset list](images/asset-list.png)
![Asset add form](images/asset-post.png)

### Advanced Features

#### RemoteApp Configuration

1. Use [RemoteApp Tool](https://github.com/kimmknight/remoteapptool) to configure the server side.
2. In asset settings, fill in:
   - **Remote Application**: format `||application_name` (for example `||notepad`)
   - **Working Directory** (optional)
   - **Startup Parameters** (optional)

Windows example:
![assets-rdp](images/asset-rdp-remote-app-win.png)

System parameter example:
![assets-rdp](images/asset-rdp-remote-app-setting.png)

After successful connection:
![assets-rdp](images/asset-rdp-remote-app-view.png)

#### Network Drive

> **Purpose**: Solve RDP file transfer limitations.

How to enable:
1. Edit the asset.
2. Enable **Device Mapping**.
3. Configure storage as a mapped network drive.

![img.png](images/asset-rdp-drive.png)

### Credentials

Credentials provide centralized account/password management. After creating credentials, select account type **Credential** when creating assets, then choose the saved credential for reuse.

![img.png](images/credential.png)

### Command Snippets

Command snippets are useful for saving complex commands and running them directly in terminal sessions.

![img.png](images/snippet-list.png)

![img_1.png](images/snippet-use.png)
