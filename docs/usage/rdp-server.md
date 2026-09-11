---
layout: doc
title: "RDP Proxy Server — Next Terminal"
description: "RDP proxy server in Next Terminal — access Windows RDP assets via native client with unified permissions, audit and recording. Lightweight bastion host."
head:
  - - meta
    - name: keywords
      content: RDP proxy, remote desktop, bastion host, session audit, Next Terminal, open source bastion
  - - meta
    - property: og:title
      content: "RDP Proxy Server — Next Terminal"
  - - meta
    - property: og:description
      content: "RDP proxy server in Next Terminal — access Windows RDP assets via native client with unified permissions, audit and recording. Lightweight bastion host."
---

# RDP Proxy Server

RDP Proxy Server is a native RDP entry point provided by Next Terminal. After it is enabled, users can download `.rdp` files for authorized RDP assets from the web UI, then connect to Next Terminal with standard RDP clients such as Windows Remote Desktop or Microsoft Remote Desktop. Next Terminal then proxies the connection to the real Windows remote desktop asset.

Unlike browser-based remote desktop access, RDP Proxy Server is designed for local RDP clients. It is suitable when users need native client behavior, clipboard, drive redirection, RemoteApp, or other local RDP client capabilities.

## Key Features

- **Standard RDP client access**: users can open `.rdp` files with built-in or common RDP clients
- **Unified RDP entry point**: expose one fixed RDP proxy address and let Next Terminal resolve different target assets
- **Short-lived one-time tickets**: `.rdp` files use `NTICKET` tickets to log in to the proxy; tickets are valid for 300 seconds by default and are invalidated after successful resolution
- **Permission control**: users can generate tickets and download `.rdp` files only for RDP assets they are authorized to access
- **Session auditing**: RDP sessions established through the proxy create Next Terminal session records and can participate in audit and recording policies
- **Clipboard and drive redirection**: generated `.rdp` files enable clipboard and redirect all client drives by default
- **RemoteApp support**: if the RDP asset has RemoteApp configured, the generated `.rdp` file includes RemoteApp settings automatically

## Usage

### Step 1: Decide Whether to Expose the RDP Proxy Port

RDP Proxy Server listens on a dedicated port. Whether you need to map this port in `docker-compose.yaml` depends on the access method:

- **Directly connecting to the proxy address with a local RDP client**: map the RDP proxy port.
- **Opening a downloaded `.rdp` file from the web UI**: map the RDP proxy port, because the local RDP client connects to the proxy address in the `.rdp` file.
- **Accessing through Termark WebSocket tunnel**: usually no need to expose the RDP proxy port. Termark establishes a tunnel through the Next Terminal web service and forwards the RDP proxy locally.

The default RDP proxy listen port is `3390`. If you need direct access to the proxy address, add a port mapping to the `next-terminal` service:

```yaml
services:
  next-terminal:
    ports:
      - "8088:8088"
      - "2022:2022"
      - "3390:3390"
```

If you use another listen port in system settings, update the port mapping accordingly. For example, if the listen address is `0.0.0.0:3391`, map:

```yaml
ports:
  - "3391:3391"
```

After updating `docker-compose.yaml`, recreate the `next-terminal` container so the port mapping takes effect:

```bash
docker compose up -d --force-recreate next-terminal
```

::: tip Termark WebSocket Tunnel
If you access RDP assets only through Termark WebSocket tunnel, you can avoid mapping `3390` to the host and do not need to allow this port in the firewall or security group. In this mode, make sure Termark can reach the Next Terminal web service URL and the reverse proxy supports WebSocket.
:::

### Step 2: Enable RDP Proxy Server in System Settings

Log in to Next Terminal and open **System Settings** > **RDP Proxy Server**. Configure the following options:

- **RDP Proxy Service**: enable it to start the RDP proxy listener
- **Listen Address**: the IP address and port the RDP Proxy Server listens on, default `0.0.0.0:3390`
- **Public Address**: the address written into generated `.rdp` files, for example `rdp.example.com:3390`. If empty, the system infers it from the listen address and the current web request
- **Ticket TTL (seconds)**: the validity period of tickets in `.rdp` files, default `300` seconds, configurable from `60` to `3600` seconds

::: tip Public Address
If Next Terminal is deployed behind a reverse proxy, NAT, container port mapping, or load balancer, explicitly set the RDP address that clients can actually reach, for example `rdp.example.com:3390` or `10.0.0.10:3390`. If this field is empty and the listen address is `0.0.0.0:3390`, the system infers the host from the current web request and appends the RDP port, which may be inaccurate in complex network environments.
:::

::: warning Security Recommendation
If the listen address is `0.0.0.0:3390`, the RDP proxy port may be reachable from external networks. Use firewall rules, cloud security groups, or access control policies to allow only trusted sources.
:::

When RDP Proxy Server starts, it automatically generates the certificate and private key used for the RDP security layer. The default paths are:

```text
data/rdp-proxy/server.crt
data/rdp-proxy/server.key
```

When using a self-signed certificate, the RDP client may show a certificate or server identity warning on first connection. Continue only after confirming the address is correct.

### Step 3: Create and Authorize RDP Assets

RDP Proxy Server supports only assets whose protocol is `RDP`. Before using it, make sure:

1. The asset protocol is `RDP`.
2. The asset address, port, username, password, domain, and other connection settings are correct.
3. The current user is authorized to access the asset.
4. If the target asset must be accessed through a gateway, the gateway configuration works correctly.

When a user downloads an `.rdp` file, Next Terminal first checks asset authorization. After the RDP client connects to the proxy, the proxy resolves the real target asset and credentials from the ticket. Users do not need to know the target Windows host credentials.

### Step 4: Download the `.rdp` File

Open the **Assets** page, find the RDP asset, and click **Download RDP File** from the action menu.

Next Terminal creates a short-lived ticket and downloads a file similar to:

```text
next-terminal-RTxxxx.rdp
```

Key fields in the `.rdp` file look like:

```text
full address:s:rdp.example.com:3390
username:s:NTICKET:<ticketId>:<secret>
prompt for credentials:i:0
authentication level:i:2
enablecredsspsupport:i:0
redirectclipboard:i:1
drivestoredirect:s:*
```

Field meanings:

- `full address`: the RDP Proxy Server address, from **Public Address** or inferred automatically
- `username`: the one-time ticket generated by Next Terminal, in the format `NTICKET:<ticketId>:<secret>`
- `prompt for credentials:i:0`: do not show an extra credential prompt
- `enablecredsspsupport:i:0`: disable CredSSP/NLA between the front-end RDP client and the proxy
- `redirectclipboard:i:1`: enable clipboard redirection
- `drivestoredirect:s:*`: redirect all client drives

::: warning Tickets Are Short-Lived
The ticket in the `.rdp` file expires after 300 seconds by default and is invalidated after successful resolution. Open the file soon after downloading it, and do not keep or reuse old `.rdp` files. If a connection fails with a ticket expired, not found, or already used error, download a new `.rdp` file.
:::

### Step 5: Connect with an RDP Client

After downloading the `.rdp` file, open it with a local RDP client:

- Windows: double-click the `.rdp` file, or open it with Remote Desktop Connection
- macOS: import or open the `.rdp` file with Microsoft Remote Desktop
- Linux: use an RDP client that supports `.rdp` files, or manually enter the proxy address and username from the file

Connection flow:

1. The RDP client connects to the Next Terminal RDP proxy address.
2. The proxy reads the `NTICKET` ticket from the `.rdp` file.
3. Next Terminal validates the ticket, user permissions, and asset information.
4. The proxy connects to the real RDP asset and logs in to the target Windows host with the credentials configured on the asset.
5. After the session ends, Next Terminal records the disconnected state.

::: tip About NLA
Generated `.rdp` files disable NLA/CredSSP between the client and the RDP proxy. This is required for the proxy to resolve the ticket. NLA remains enabled when the proxy connects to the back-end Windows target. Usually, you do not need to edit the `.rdp` file manually.
:::

## File Transfer and Clipboard

Generated `.rdp` files enable the following by default:

```text
redirectclipboard:i:1
drivestoredirect:s:*
```

This usually allows RDP clients to copy text or files through the clipboard and access redirected local drives in the remote desktop session. Actual behavior still depends on:

- Whether the local RDP client supports clipboard and drive redirection
- Whether the local client allows all drives to be redirected
- Whether the target Windows remote desktop policy allows clipboard or drive redirection
- Whether endpoint security software or group policy blocks file transfer

If the asset has RemoteApp configured, the `.rdp` file also contains fields such as `remoteapplicationmode` and `remoteapplicationprogram`, so opening it starts the specified remote application instead of the full desktop.

## FAQ

### The "Download RDP File" Action Is Not Visible

Check:

1. The asset protocol is `RDP`.
2. The current user is authorized to access the asset.
3. The current page is the asset list or another entry that supports RDP proxy download.

### Downloading the `.rdp` File Fails

Check:

1. The current login session is valid.
2. The account has completed two-factor authentication if required.
3. The asset still exists and its protocol is `RDP`.
4. The user still has access permission to the asset.

### The RDP Client Cannot Connect to the Proxy Address

Check:

1. **Port exposure**: firewall rules, security groups, or cloud security policies allow access to the RDP proxy port.
2. **Port mapping**: for Docker deployments, the container listen port is mapped to the host.
3. **Public address**: the `full address` in the `.rdp` file is reachable from the client.
4. **Service enabled**: RDP Proxy Server is enabled and saved in system settings.
5. **Service started**: Next Terminal logs show that the RDP proxy sidecar started successfully.
6. **Port conflict**: port `3390` or the custom port is not occupied by another process.

Use the following commands to test port connectivity:

```bash
telnet rdp.example.com 3390
# or
nc -zv rdp.example.com 3390
```

### Ticket Expired, Not Found, or Already Used

RDP proxy tickets are short-lived one-time credentials. Common causes:

1. The `.rdp` file was opened after the ticket TTL expired.
2. The same `.rdp` file has already connected successfully once.
3. The RDP client reused an already consumed ticket during automatic reconnect.
4. The `NTICKET` username was damaged by manual editing.

Download a new `.rdp` file from the asset page and connect again.

### Can I Manually Enter a Windows Username and Password to Connect to the Proxy?

No. RDP Proxy Server uses the `NTICKET:<ticketId>:<secret>` ticket in the `.rdp` file to identify the user and asset, then Next Terminal uses the credential saved on the asset to connect to the real Windows host.

If you directly enter a Windows username and password in the RDP client, the proxy cannot know which asset to connect to and cannot perform permission checks or session auditing.

### Difference from Web RDP Access

- **RDP Proxy Server**: uses a local RDP client and provides a more native remote desktop experience. It is suitable for clipboard, drive redirection, RemoteApp, and other local client capabilities.
- **Web RDP Access**: runs in the browser, does not require exposing the RDP proxy port, and does not require a local RDP client. It is better for temporary access or restricted endpoint environments.

### Does It Support Online Monitoring and Manual Disconnect?

RDP proxy sessions record session state and can participate in recording and audit policies. Online monitoring and manual disconnect from the web UI are not supported yet.

### Difference from SSH Proxy Server

- **RDP Proxy Server**: targets Windows Remote Desktop Protocol and uses `.rdp` files with short-lived tickets to access RDP assets.
- **SSH Proxy Server**: targets SSH and uses standard SSH clients to access SSH assets. It supports interactive selection, direct mode, and SSH tunnels.
