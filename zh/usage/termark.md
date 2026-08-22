---
layout: doc
title: "使用 Termark 接入 NextTerminal 资产 — Next Terminal"
description: "使用 Termark 本地 SSH 客户端直连 Next Terminal 已授权资产 — 统一资产清单、本地终端体验与堡垒机审计。"
head:
  - - meta
    - name: keywords
      content: Termark, SSH客户端, 堡垒机, Next Terminal, 本地SSH
  - - meta
    - property: og:title
      content: "使用 Termark 接入 NextTerminal 资产 — Next Terminal"
  - - meta
    - property: og:description
      content: "使用 Termark 本地 SSH 客户端直连 Next Terminal 已授权资产 — 统一资产清单、本地终端体验与堡垒机审计。"
---

# 使用 Termark 接入 NextTerminal 资产

**Termark** 是 NextTerminal 配套的本地访问客户端，可以把 NextTerminal 中已授权的 SSH、RDP 资产同步到本地使用。配置完成后，可以像使用 XShell、MobaXterm、远程桌面连接等本地客户端一样，从本地直接打开堡垒机资产。

::: tip 版本要求
- 使用 WebSocket 隧道接入 SSH 资产时，NextTerminal 版本需要大于 `v3.2.2`。
- 使用 RDP 代理访问 RDP 资产时，NextTerminal 版本需要大于等于 `v3.3.6`。
:::

## 使用前准备

开始配置前，请先确认以下条件：

- 已安装 Termark。中文下载地址：[https://www.termark.app/zh-cn/](https://www.termark.app/zh-cn/)。
- NextTerminal 中已经添加 SSH 或 RDP 资产，并且当前账号已获得访问授权。
- Termark 能访问 NextTerminal 的 Web 服务地址。
- 如果需要访问 SSH 资产，请先开启 NextTerminal SSH 代理服务器。
- 如果需要访问 RDP 资产，请先开启 NextTerminal RDP 代理服务器。
- 如果使用 WebSocket 隧道，Termark 只需要能访问 NextTerminal 的 Web 服务地址。
- 如果使用直连代理服务，Termark 还需要能访问对应代理服务器地址：SSH 代理服务器监听地址，或 RDP 代理服务器对外访问地址。

## 1. 开启对应的代理服务器

Termark 通过 NextTerminal 的代理服务器访问资产。根据需要访问的资产类型，开启对应服务即可：

- **访问 SSH 资产**：参考 [SSH 代理服务器](/zh/usage/ssh-server)。
- **访问 RDP 资产**：参考 [RDP 代理服务器](/zh/usage/rdp-server)。

如果需要同时访问 SSH 和 RDP 资产，需要同时开启 SSH 代理服务器和 RDP 代理服务器。

## 2. 在 Termark 添加 NextTerminal 实例

打开 Termark，进入「设置」>「NextTerminal」，点击「添加实例」。

需要填写的基础信息：

- **环境名称**：用于在 Termark 中区分不同 NextTerminal 环境，例如 `生产环境`、`测试环境`。
- **服务地址**：填写 NextTerminal 的 Web 访问地址，例如 `https://nt.example.com`。
- **访问凭证**：默认使用自动生成的凭证。首次连接或切换凭证时，Termark 会按提示完成授权。

接下来根据网络环境选择代理连接方式。WebSocket 隧道适合减少对外开放端口；直连代理服务适合 Termark 所在网络可以直接访问代理端口的场景。

## 3. 选择代理连接方式

这一项用于决定 Termark 如何连接 NextTerminal 的代理服务。SSH 资产会连接 SSH 代理服务器，RDP 资产会连接 RDP 代理服务器。

### 方案一：WebSocket 隧道

推荐优先使用 WebSocket 隧道。该方式通过 NextTerminal 的 Web 服务地址建立隧道访问代理服务器，通常不需要单独开放 SSH 代理端口 `2022` 或 RDP 代理端口 `3390`，也更适合部署在反向代理、HTTPS 网关或内网穿透之后的场景。

在连接方式中选择「WebSocket 隧道」，然后点击「连接 NextTerminal」。

![Termark WebSocket 隧道配置](images/termark-config-nt.png)

适合使用 WebSocket 隧道的场景：

- 只能访问 NextTerminal 的 Web 地址，无法直接访问 SSH/RDP 代理服务器端口。
- NextTerminal 部署在反向代理后面。
- 希望减少对外开放端口。

### 方案二：直连代理服务

如果 Termark 所在网络可以直接访问 NextTerminal 的代理服务器，可以选择「直连代理服务」。直连方式比 WebSocket 隧道少一次转发，延迟更低，交互会更顺畅。

使用直连代理服务前，需要确认对应代理服务器地址对 Termark 可达：

- NextTerminal 通常部署在服务器或容器中，Termark 是用户电脑上的客户端程序，不能使用 `127.0.0.1:2022` 或 `127.0.0.1:3390` 直连服务器上的代理服务。
- 访问 SSH 资产时，需要将 SSH 代理服务器监听地址改为客户端可访问的地址，例如 `0.0.0.0:2022` 或服务器内网 IP。
- 访问 RDP 资产时，需要正确配置 RDP 代理服务器「对外访问地址」，并确保 Termark 所在机器可访问。
- 如果 NextTerminal 使用容器部署，需要确认容器已将对应代理端口映射到宿主机，例如 `2022` 或 `3390`。
- 如果服务器启用了防火墙或云服务器安全组，需要放行对应端口。

在 Termark 中选择「直连代理服务」，填写：

- **SSH 主机**：NextTerminal SSH 代理服务器所在主机。默认可使用服务地址中的主机名。
- **SSH 端口**：SSH 代理服务器端口，例如 `2022`。

填写完成后点击「连接 NextTerminal」。

![Termark 直连 SSH 配置](images/termark-direct-ssh.png)

::: warning 安全建议
如果把 SSH 代理服务器监听地址改为 `0.0.0.0:2022`，或将 RDP 代理端口 `3390` 直接暴露到外部网络，请同时配置防火墙、安全组或访问控制策略，只允许可信来源访问对应端口。安全要求更高时，建议优先使用 WebSocket 隧道。
:::

## 4. 查看并连接资产

连接成功后，返回 Termark 主页面，切换到对应的 NextTerminal 实例 Tab，即可看到当前账号已授权的 SSH 和 RDP 资产。

![Termark 资产列表](images/termark-nt-dash.png)

资产访问方式：

- **SSH 资产**：点击资产后，Termark 通过配置的代理连接方式接入 NextTerminal SSH 代理服务器，再连接目标 SSH 资产。
- **RDP 资产**：点击资产后，Termark 通过 NextTerminal RDP 代理服务器生成短期票据，并调用本地 RDP 客户端连接目标 RDP 资产；使用 WebSocket 隧道时无需额外暴露 RDP 代理端口。

如果资产没有显示，请检查：

- 当前账号是否拥有该资产的访问权限。
- NextTerminal 中资产类型是否为 SSH 或 RDP，且连接信息配置正确。
- Termark 添加实例时使用的服务地址和访问凭证是否对应当前账号。
- 访问 SSH 资产时，SSH 代理服务器是否已开启并保存配置。
- 访问 RDP 资产时，RDP 代理服务器是否已开启并保存配置。

## 常见问题

### WebSocket 隧道连接失败

请按顺序检查：

1. Termark 中填写的服务地址是否可以在浏览器正常打开。
2. NextTerminal 版本是否大于 `v3.2.2`。
3. 反向代理是否支持 WebSocket 转发。
4. NextTerminal 的 SSH/RDP 代理服务器是否已按资产类型开启。

### 直连代理服务连接失败

请按顺序检查：

1. 对应代理服务器地址是否对 Termark 所在机器可达。
2. 代理端口是否与 NextTerminal 中配置的端口一致。
3. 容器部署时，对应代理服务器端口是否已映射到宿主机。
4. 防火墙或云服务器安全组是否放行该端口。
5. 如果监听地址仍是 `127.0.0.1:2022` 或代理地址只在容器内部可达，Termark 客户端无法从用户电脑直连该端口，请改用 WebSocket 隧道或调整代理地址。

### RDP 资产连接失败

请按顺序检查：

1. RDP 代理服务器是否已开启。
2. 如果使用直连代理服务，`docker-compose.yaml` 中是否已映射 RDP 代理端口。
3. 如果使用直连代理服务，RDP 代理服务器「对外访问地址」是否填写为 Termark 所在机器可访问的地址。
4. 如果使用 WebSocket 隧道，Termark 中填写的 NextTerminal Web 服务地址是否可访问，反向代理是否支持 WebSocket。
5. 如果使用直连代理服务，防火墙或云服务器安全组是否放行 RDP 代理端口，例如默认的 `3390`。
6. 目标资产协议是否为 `RDP`，资产账号、密码、域和端口是否配置正确。
7. 当前账号是否拥有该 RDP 资产的访问权限。

更多 RDP 代理服务器排查方式请参考 [RDP 代理服务器](/zh/usage/rdp-server)。

### 看不到资产

Termark 会展示当前 NextTerminal 账号已授权的 SSH 和 RDP 资产。请先在 NextTerminal 中确认资产存在、授权有效，并确认当前登录 Termark 的访问凭证属于正确账号。
