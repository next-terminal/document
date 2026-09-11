---
layout: doc
title: "RDP and VNC Connection Issues — Next Terminal"
description: "Troubleshoot RDP black screens, domain authentication, clipboard, mapped drives, legacy Windows and RealVNC in Next Terminal."
---

# RDP and VNC Connection Issues

See [Windows / RDP Assets](/docs/usage/rdp), [VNC and Telnet Assets](/docs/usage/vnc-telnet), and [RDP/VNC Error Codes](/docs/usage/error-codes) for configuration and codes.

## RDP black screen or immediate disconnect

Test the target port from Next Terminal or the final gateway, verify the same account in a controlled native-client test, check username/password/domain, keep security mode on automatic negotiation unless the server requires a specific mode, test conservative display settings, and review both Next Terminal and Windows logs. See the [RDP troubleshooting guide](/docs/blog/rdp-black-screen-failed).

## Windows 7 or Server 2008 disconnects

These systems have legacy RDP, TLS, NLA and graphics support. The old FAQ instruction to disable glyph caching no longer maps to the current asset form. Apply all available OS updates, verify NLA/security-mode compatibility, test a lower color depth and fixed resolution, and prefer upgrading Windows over permanently weakening security validation.

## Domain account authentication fails

Enter the account as the username and the Windows domain in the asset's Domain setting. Verify domain-controller reachability and Remote Desktop logon rights. Local accounts normally leave Domain empty.

## Clipboard button is present but copy/paste fails

Check copy/paste permissions in the authorization strategy and browser clipboard permission. Use the session clipboard panel when automatic browser synchronization is unavailable. Reconnect after strategy changes.

## Windows does not show the mapped drive

Enable the asset network drive, verify selected or default storage and strategy, then disconnect the old session completely and reconnect. See [Windows File Management](/docs/usage/rdp#windows-file-management).

## RemoteApp opens the desktop or fails to start

Use the published Windows alias in `||alias` form, verify path/arguments/working directory and account permission, and download a new `.rdp` file for native proxy access.

## RealVNC authentication fails

On **RealVNC Server**, allow VNC Password authentication, configure a separate VNC password, and use that password in the asset. `Prefer On` encryption can be used for compatibility testing. Enable legacy-viewer compatibility only on an isolated trusted network because it weakens compatibility security. Do not assume the OS login password is the VNC password.

## VNC black screen or incorrect dimensions

Verify that the server shares the intended active display, check lock/headless state, test a lower color depth and fixed size, and review the VNC server logs and [error codes](/docs/usage/error-codes).
