---
layout: doc
title: "File Management Issues — Next Terminal"
description: "Troubleshoot SSH/SFTP listings, file permissions, upload progress and Windows RDP mapped drives in Next Terminal."
---

# File Management Issues

SSH directly operates the target filesystem; RDP operates Next Terminal storage through a Windows mapped drive. See [File Management](/docs/usage/file-management).

## SSH filesystem is empty or cannot open

An SSH terminal can work while SFTP is unavailable. Check:

```shell
grep -E '^\s*Subsystem\s+sftp' /etc/ssh/sshd_config
```

Expected configurations include `Subsystem sftp /usr/lib/openssh/sftp-server` or `Subsystem sftp internal-sftp`. Also verify directory permissions, chroot or forced-command restrictions, gateway behavior, and the user's access strategy. Validate `sshd_config` before reloading SSH.

## Upload, download or delete buttons are missing

The authorization strategy controls each action. Directory upload, batch download and online editing may also require a premium license. Reconnect after changing the strategy.

## Upload remains at 99%

At 99%, browser upload may be complete while backend transmission is still running. Open transfer progress to distinguish upload, transmission and failure. Check quota, target disk, permissions, network and server logs if it does not complete.

## Uploaded Windows file cannot be found

The browser uploads to Next Terminal storage, not directly to `C:` or `D:`. Open the mapped drive in Windows and copy the file to its final disk. See [RDP and VNC](/docs/faq/rdp-vnc#windows-does-not-show-the-mapped-drive) if the drive is absent.

## Browser does not show a file copied into the Windows mapped drive

Verify the same storage is mapped, wait for the copy to complete, refresh the browser list, and check quota, filename compatibility and download permission.

## Why is an internal Windows copy absent from File Logs?

Browser operations against Next Terminal storage are logged. A copy between the mapped drive and a Windows system disk occurs inside the RDP session and should be investigated with session replay.

## Can a deleted file be recovered?

Deletion is permanent in the file tool. Recovery depends on target or storage snapshots and backups. Restrict delete permission through the access strategy.
