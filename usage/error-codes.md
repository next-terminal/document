---
layout: doc
title: "RDP/VNC Error Codes — Next Terminal"
description: "RDP and VNC error code reference for Next Terminal bastion host — troubleshooting remote desktop and virtual network computing errors."
head:
  - - meta
    - name: keywords
      content: RDP error, VNC error, troubleshooting, bastion host, Next Terminal
  - - meta
    - property: og:title
      content: "RDP/VNC Error Codes — Next Terminal"
  - - meta
    - property: og:description
      content: "RDP and VNC error code reference for Next Terminal bastion host — troubleshooting remote desktop and virtual network computing errors."
---

# RDP/VNC Error Codes

When connecting to remote desktops using RDP or VNC, you may encounter errors. This document lists common status codes and meanings for faster troubleshooting.

## Status Codes

Next Terminal uses a unified numeric status-code system to represent success/failure states.

### Success

#### 0 (SUCCESS)
Operation completed successfully.

### Unsupported Operation

#### 256 (UNSUPPORTED)
Requested operation is not supported.

### Server Errors

#### 512 (SERVER_ERROR)
Internal server error. Operation cannot be completed.

#### 513 (SERVER_BUSY)
Server is busy. Operation cannot be completed.

#### 514 (UPSTREAM_TIMEOUT)
Upstream server did not respond in time.

#### 515 (UPSTREAM_ERROR)
Upstream server returned an error.

### Resource Errors

#### 516 (RESOURCE_NOT_FOUND)
Related resource (file/stream etc.) was not found.

#### 517 (RESOURCE_CONFLICT)
Resource is in use or locked.

#### 518 (RESOURCE_CLOSED)
Related resource has been closed.

### Upstream Connectivity Errors

#### 519 (UPSTREAM_NOT_FOUND)
Upstream server does not exist or is unreachable.

#### 520 (UPSTREAM_UNAVAILABLE)
Upstream server refused the connection.

### Session Errors

#### 521 (SESSION_CONFLICT)
Session ended due to conflict with another session.

#### 522 (SESSION_TIMEOUT)
Session ended due to inactivity timeout.

#### 523 (SESSION_CLOSED)
Session was forcibly closed.

### Client Errors

#### 768 (CLIENT_BAD_REQUEST)
Request parameters are invalid.

#### 769 (CLIENT_UNAUTHORIZED)
Authorization denied because user is not authenticated.

#### 771 (CLIENT_FORBIDDEN)
Permission denied. Logging in cannot resolve this.

#### 776 (CLIENT_TIMEOUT)
Client response timeout (usually browser/user side).

#### 781 (CLIENT_OVERRUN)
Client sent more data than protocol allows.

#### 783 (CLIENT_BAD_TYPE)
Client sent unexpected/invalid data type.

#### 797 (CLIENT_TOO_MANY)
Client has consumed too many resources.

## Troubleshooting

### Timeout issues
- **514, 522**: check network and remote desktop server health
- **776**: check client network, refresh and reconnect

### Authentication issues
- **769**: verify username/password
- **771**: verify permission settings for remote desktop access

### Server-side issues
- **519, 520**: verify remote host address/port
- **513**: retry later when server load is lower

### Session conflicts
- **521**: check whether same account is in use elsewhere
- **523**: ask admin to check session management settings

If you encounter an unlisted code, contact the administrator and check server logs for details.
