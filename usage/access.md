---
layout: doc
title: "Browser Access Workspace — Next Terminal"
description: "Find and open authorized SSH, RDP, VNC and Telnet assets in the Next Terminal browser workspace and use session tools."
---

# Browser Access Workspace

The browser workspace is the common entry point for users to open authorized assets. This page covers shared navigation; protocol-specific tools are documented separately.

## Prerequisites

- The administrator created and successfully tested the asset.
- The current account has [Resource Authorization](/usage/authorization).
- The Next Terminal server or gateway can reach the target.

## Find and open an asset

Use the group tree and search field. The list contains resources authorized to the current account and available through the workspace. Click an asset to open it in a tab; multiple sessions can remain open in separate tabs.

<!-- TODO(image): Add the current workspace, asset search and multiple-session tabs. -->

## Use by protocol

- [SSH Assets](/usage/ssh): terminal, SFTP filesystem, snippets, monitoring and AI assistant.
- [Windows / RDP Assets](/usage/rdp): desktop, clipboard, key combinations, network drive and RemoteApp.
- [VNC and Telnet Assets](/usage/vnc-telnet): graphical VNC desktop or Telnet terminal.
- [Web Assets](/usage/website): authenticated and authorized access to internal sites.
- [Database Audit](/usage/database): database-client proxy access rather than a browser SQL session.

## Session sharing

SSH, RDP and VNC sessions can provide a sharing entry. Verify the recipient and close sharing when collaboration ends. Shared activity remains subject to audit and data-access policies.

## Files and clipboard

SSH file management directly operates the target SFTP filesystem. RDP uses Next Terminal storage and a Windows mapped drive. RDP/VNC clipboard availability depends on strategy and browser permission. See [File Management](/usage/file-management).

## Connection troubleshooting order

1. Confirm the asset still appears for the user.
2. Check authorization expiration and strategy.
3. Ask whether an administrator also fails; if so, inspect address, credential and gateway.
4. For RDP/VNC, consult [Error Codes](/usage/error-codes).
5. Review access and session logs.

For native clients, use the [SSH Proxy Server](/usage/ssh-server), [RDP Proxy Server](/usage/rdp-server) or [Termark](/usage/termark).
