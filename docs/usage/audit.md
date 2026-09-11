---
layout: doc
title: "Audit Logs — Next Terminal"
description: "Review online and offline sessions, commands, files, access, sign-in, administration and database SQL logs in Next Terminal."
---

# Audit Logs

The **Log Audit** menu collects records produced while users access assets. Administrators can trace the actor, target, time and result for troubleshooting and security investigations.

## Audit entries

| Page | Purpose |
| --- | --- |
| Online Sessions | Inspect and manage active SSH, RDP, VNC and Telnet sessions |
| Offline Sessions | Find ended sessions and replay terminal or graphical recordings |
| Command Logs | Review commands and command-filter results from terminal sessions |
| File Logs | Review upload, download, create, edit, rename and delete operations |
| Access Logs | Review asset and Web-resource access events |
| Access Statistics | Aggregate activity by asset, user and time |
| Sign-in Logs | Review authentication sources, times and results |
| Operation Logs | Review administrative configuration changes |
| Database SQL Logs | Review SQL executed or intercepted through the database proxy |

## Investigate an asset operation

1. Confirm successful entry in Access Logs.
2. Locate the corresponding online or offline session.
3. For SSH/Telnet, inspect Command Logs.
4. For upload, download or deletion, inspect File Logs.
5. For database activity, inspect SQL logs and work orders.
6. If authorization or configuration may have changed, inspect Operation Logs and the applicable [Resource Authorization](/docs/usage/authorization).

## Session replay

Offline sessions can reconstruct ended text or graphical sessions. Recording availability depends on protocol, recording settings, successful session establishment and healthy recording storage. Direct connections that bypass Next Terminal cannot produce a Next Terminal recording.

<!-- TODO(image): Add online sessions, offline sessions and playback screenshots. -->

## File, command and SQL audit

Browser-side SSH filesystem and RDP storage operations appear in File Logs. A copy from the mapped drive to Windows `C:` or `D:` occurs inside the desktop and should be investigated through session replay. Terminal commands appear in Command Logs; database statements appear in Database SQL Logs and, where applicable, work orders.

<!-- TODO(image): Add file-log filtering and detail screenshots. -->

## Routine review

1. Review failed sign-ins and unusual access.
2. Inspect long-running sessions and sensitive assets.
3. Sample recordings, commands and file records for privileged assets.
4. Verify recording capacity, retention and backup.
5. Revoke temporary authorization after an incident or maintenance window.

If a record is missing, verify filters, server time and time zone, confirm the action passed through Next Terminal, and check recording/log storage settings.
