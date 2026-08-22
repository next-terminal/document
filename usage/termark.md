---
layout: doc
title: "Termark Client — Next Terminal"
description: "Use Termark native SSH client to access Next Terminal authorized assets — unified inventory, local terminal with bastion audit."
head:
  - - meta
    - name: keywords
      content: Termark, SSH client, bastion host, Next Terminal, native SSH
  - - meta
    - property: og:title
      content: "Termark Client — Next Terminal"
  - - meta
    - property: og:description
      content: "Use Termark native SSH client to access Next Terminal authorized assets — unified inventory, local terminal with bastion audit."
---

# Use Termark to Access Next Terminal Assets

**Termark** is a local access client for Next Terminal. It can sync SSH and RDP assets authorized to your Next Terminal account and let you open bastion-hosted assets from your desktop, similar to tools such as XShell, MobaXterm, or Remote Desktop Connection.

::: tip Version Requirements
- WebSocket tunnel mode for SSH assets requires Next Terminal later than `v3.2.2`.
- RDP Proxy access for RDP assets requires Next Terminal `v3.3.6` or later.
:::

## Before You Start

Before configuring Termark, make sure:

- Termark is installed. Download: [https://www.termark.app](https://www.termark.app).
- SSH or RDP assets have been added in Next Terminal, and your account has access permission.
- Termark can reach the Next Terminal web service URL.
- If you need to access SSH assets, enable the Next Terminal SSH Proxy Server first.
- If you need to access RDP assets, enable the Next Terminal RDP Proxy Server first.
- If you use WebSocket tunnel mode, Termark only needs to reach the Next Terminal web service URL.
- If you use direct proxy service mode, Termark must also be able to reach the corresponding proxy address: the SSH Proxy Server listen address or the RDP Proxy Server public address.

## 1. Enable the Required Proxy Server

Termark accesses assets through Next Terminal proxy servers. Enable the required service based on the asset type:

- **SSH assets**: see [SSH Proxy Server](/usage/ssh-server).
- **RDP assets**: see [RDP Proxy Server](/usage/rdp-server).

If you need to access both SSH and RDP assets, enable both the SSH Proxy Server and the RDP Proxy Server.

## 2. Add a Next Terminal Instance in Termark

Open Termark, go to **Settings** > **NextTerminal**, and click **Add Instance**.

Fill in the basic instance information:

- **Environment Name**: a local name used to distinguish environments, for example `Production` or `Staging`.
- **Service URL**: the web URL of Next Terminal, for example `https://nt.example.com`.
- **Access Credential**: the default auto-generated credential is recommended. When connecting for the first time or switching credentials, follow Termark's authorization prompt.

Then choose the proxy connection mode based on your network environment. WebSocket tunnel mode is suitable when you want to reduce exposed ports; direct proxy service mode is suitable when the Termark client network can directly reach proxy ports.

## 3. Choose the Proxy Connection Mode

This option controls how Termark connects to Next Terminal proxy services. SSH assets use the SSH Proxy Server, and RDP assets use the RDP Proxy Server.

### Option 1: WebSocket Tunnel

WebSocket tunnel mode is recommended for most deployments. It connects through the Next Terminal web service URL and tunnels traffic to proxy services, so you usually do not need to expose the SSH proxy port `2022` or the RDP proxy port `3390` separately. It is also suitable when Next Terminal is behind a reverse proxy, HTTPS gateway, or tunneling service.

In the connection mode setting, select **WebSocket Tunnel**, then click **Connect NextTerminal**.

![Termark WebSocket tunnel settings](images/termark-config-nt.png)

Use WebSocket tunnel mode when:

- Termark can access only the Next Terminal web URL, not the SSH/RDP proxy ports directly.
- Next Terminal is deployed behind a reverse proxy.
- You want to reduce exposed public ports.

### Option 2: Direct Proxy Service

If the Termark client network can directly reach the Next Terminal proxy servers, you can choose **Direct Proxy Service**. This mode has one fewer forwarding hop than WebSocket tunnel mode, so latency is lower and terminal interaction may feel smoother.

Before using direct proxy service mode, make sure the corresponding proxy address is reachable from the Termark client:

- Next Terminal is usually deployed on a server or inside a container, while Termark runs on the user's desktop. You cannot use `127.0.0.1:2022` or `127.0.0.1:3390` from Termark to directly reach proxy services running on the server.
- For SSH assets, change the SSH Proxy Server listen address to an address reachable by the client, such as `0.0.0.0:2022` or the server's private IP.
- For RDP assets, configure the RDP Proxy Server **Public Address** correctly and make sure it is reachable from the Termark client machine.
- If Next Terminal is deployed in a container, make sure the corresponding proxy port is mapped from the container to the host, for example `2022` or `3390`.
- If the server has a firewall or cloud security group, allow access to the corresponding port.

In Termark, select **Direct Proxy Service** and fill in:

- **SSH Host**: the host where the Next Terminal SSH Proxy Server is reachable. The hostname from the service URL can be used by default if it points to the same server.
- **SSH Port**: the SSH Proxy Server port, for example `2022`.

Click **Connect NextTerminal** after completing the settings.

![Termark direct proxy service settings](images/termark-direct-ssh.png)

::: warning Security Recommendation
If you change the SSH Proxy Server listen address to `0.0.0.0:2022` or expose the RDP proxy port `3390` directly to external networks, use firewall rules, cloud security groups, or access control policies to allow only trusted sources. For stricter security requirements, prefer WebSocket tunnel mode.
:::

## 4. View and Connect to Assets

After the connection succeeds, return to the Termark home page and switch to the corresponding Next Terminal instance tab. You will see the SSH and RDP assets authorized to the current account.

![Termark asset list](images/termark-nt-dash.png)

Asset access behavior:

- **SSH assets**: Termark uses the configured proxy connection mode to connect to the Next Terminal SSH Proxy Server, then connects to the target SSH asset.
- **RDP assets**: Termark creates a short-lived ticket through the Next Terminal RDP Proxy Server and opens the target RDP asset with the local RDP client. When WebSocket tunnel mode is used, you do not need to expose the RDP proxy port separately.

If no assets are displayed, check:

- Whether the current account has access permission to the assets.
- Whether the assets in Next Terminal are SSH or RDP assets and their connection settings are correct.
- Whether the service URL and access credential in Termark belong to the expected account.
- For SSH assets, whether the SSH Proxy Server is enabled and the settings have been saved.
- For RDP assets, whether the RDP Proxy Server is enabled and the settings have been saved.

## FAQ

### WebSocket Tunnel Connection Fails

Check the following in order:

1. The service URL configured in Termark can be opened in a browser.
2. Next Terminal is later than `v3.2.2`.
3. The reverse proxy supports WebSocket forwarding.
4. The Next Terminal SSH/RDP Proxy Server is enabled based on the asset type.

### Direct Proxy Service Connection Fails

Check the following in order:

1. The corresponding proxy address is reachable from the Termark client.
2. The proxy port matches the port configured in Next Terminal.
3. For container deployments, the corresponding proxy port is mapped to the host.
4. The firewall or cloud security group allows access to the port.
5. If the listen address is still `127.0.0.1:2022` or the proxy address is reachable only inside the container, the Termark desktop client cannot directly reach that port from the user's computer. Use WebSocket tunnel mode or change the proxy address.

### RDP Asset Connection Fails

Check the following in order:

1. The RDP Proxy Server is enabled.
2. If direct proxy service mode is used, the RDP proxy port is mapped in `docker-compose.yaml`.
3. If direct proxy service mode is used, the RDP Proxy Server **Public Address** is reachable from the Termark client machine.
4. If WebSocket tunnel mode is used, the Next Terminal web service URL configured in Termark is reachable and the reverse proxy supports WebSocket.
5. If direct proxy service mode is used, the firewall or cloud security group allows access to the RDP proxy port, for example the default `3390`.
6. The target asset protocol is `RDP`, and the asset username, password, domain, and port are configured correctly.
7. The current account has access permission to the RDP asset.

For more RDP Proxy Server troubleshooting, see [RDP Proxy Server](/usage/rdp-server).

### Assets Are Not Displayed

Termark displays SSH and RDP assets authorized to the current Next Terminal account. Confirm that the assets exist in Next Terminal, the authorization is valid, and the access credential used in Termark belongs to the correct account.
