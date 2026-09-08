---
layout: doc
title: "VNC and Telnet Assets — Next Terminal"
description: "Add, authorize and access VNC and Telnet assets in Next Terminal, including display settings, authentication and security limitations."
---

# VNC and Telnet Assets

Both protocols are available from the browser workspace, but they serve very different systems and have different security properties.

## VNC assets

Create an asset, select `VNC` (default port `5900`), enter the target address and VNC password or password credential, select a gateway when required, and configure display or WOL settings. Save, test and authorize the asset.

VNC does not provide an SSH filesystem. Clipboard behavior depends on server compatibility and the access strategy.

<!-- TODO(image): Add VNC basic settings, display settings and session screenshots. -->

Do not expose VNC directly to the public Internet. Verify its authentication and encryption capabilities and prefer a Security Gateway for private networks.

## Telnet assets

Create an asset, select `Telnet` (default port `23`), enter the address and gateway chain, then save, test and authorize it. Telnet login is normally interactive after terminal connection, so its asset form does not provide the same account-type section as SSH or RDP.

<!-- TODO(image): Add Telnet settings and interactive sign-in screenshots. -->

Telnet does not encrypt credentials or commands. Use it only inside an isolated trusted network when the target cannot provide SSH.

## File management

VNC and Telnet sessions do not provide Next Terminal file management. Use SSH/SFTP, an RDP network drive or another controlled method.

For display or protocol errors, see [RDP/VNC Error Codes](/usage/error-codes).
