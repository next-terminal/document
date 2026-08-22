---
layout: doc
title: "RDP 代理服务器 — Next Terminal"
description: "Next Terminal 的 RDP 代理服务器 — 用本地远程桌面客户端访问 RDP 资产，保留统一权限、审计与录像的轻量堡垒机。"
head:
  - - meta
    - name: keywords
      content: RDP代理, 远程桌面, 堡垒机, 会话审计, Next Terminal, 开源堡垒机
  - - meta
    - property: og:title
      content: "RDP 代理服务器 — Next Terminal"
  - - meta
    - property: og:description
      content: "Next Terminal 的 RDP 代理服务器 — 用本地远程桌面客户端访问 RDP 资产，保留统一权限、审计与录像的轻量堡垒机。"
---

# RDP 代理服务器

RDP 代理服务器是 Next Terminal 提供的原生 RDP 入口。开启后，用户可以在 Web 端为已授权的 RDP 资产下载 `.rdp` 文件，并使用 Windows 远程桌面、Microsoft Remote Desktop 等标准 RDP 客户端连接到 Next Terminal，再由 Next Terminal 代理访问真实的 Windows 远程桌面资产。

和 Web 页面内的远程桌面访问不同，RDP 代理服务器面向本地 RDP 客户端，适合需要原生客户端体验、剪贴板、磁盘重定向、RemoteApp 等能力的场景。

## 主要特性

- **标准 RDP 客户端访问**: 用户无需安装专用客户端，直接使用系统自带或常见 RDP 客户端打开 `.rdp` 文件
- **统一 RDP 入口**: 对外只暴露一个固定 RDP 代理地址，通过 Next Terminal 解析到不同目标资产
- **短期一次性票据**: `.rdp` 文件内使用 `NTICKET` 票据登录代理，票据默认 300 秒有效，解析成功后立即失效
- **权限控制**: 只能为当前用户已授权的 RDP 资产生成票据和下载 `.rdp` 文件
- **会话审计**: 通过代理建立的 RDP 会话会创建 Next Terminal 会话记录，可参与审计和录像策略
- **剪贴板和磁盘重定向**: 生成的 `.rdp` 文件默认启用剪贴板，并重定向客户端全部磁盘
- **RemoteApp 支持**: 如果 RDP 资产配置了 RemoteApp，生成的 `.rdp` 文件会自动携带 RemoteApp 参数

## 使用方式

### 步骤 1: 按访问方式决定是否开放 RDP 代理端口

RDP 代理服务器监听独立端口。是否需要在 `docker-compose.yaml` 中映射该端口，取决于实际访问方式:

- **直接使用本地 RDP 客户端连接代理地址**：需要映射 RDP 代理端口。
- **在 Web 页面下载 `.rdp` 文件后打开连接**：需要映射 RDP 代理端口，因为本地 RDP 客户端会连接 `.rdp` 文件中的代理地址。
- **通过 Termark WebSocket 隧道访问**：通常不需要对外暴露 RDP 代理端口，Termark 会通过 Next Terminal Web 服务建立隧道并转发到本地访问。

默认 RDP 代理监听端口为 `3390`。如果需要直连代理地址，可以按下面方式为 `next-terminal` 服务增加端口映射:

```yaml
services:
  next-terminal:
    ports:
      - "8088:8088"
      - "2022:2022"
      - "3390:3390"
```

如果你在系统设置中使用了其他监听端口，需要同步修改端口映射。例如监听地址为 `0.0.0.0:3391` 时，应映射:

```yaml
ports:
  - "3391:3391"
```

修改完成后，重建 `next-terminal` 容器使端口映射生效:

```bash
docker compose up -d --force-recreate next-terminal
```

::: tip Termark WebSocket 隧道
如果只通过 Termark WebSocket 隧道访问 RDP 资产，可以不映射 `3390` 到宿主机，也不需要在防火墙或安全组中放行该端口。此时需要确保 Termark 能访问 Next Terminal 的 Web 服务地址，并且反向代理支持 WebSocket。
:::

### 步骤 2: 在系统设置开启 RDP 代理服务器

登录 Next Terminal，进入「系统设置」>「RDP 代理服务器」，按下面的方式配置:

- **RDP 代理服务**: 开启后，Next Terminal 会启动 RDP 代理监听服务
- **监听地址**: RDP 代理服务器监听的 IP 地址和端口，默认 `0.0.0.0:3390`
- **对外访问地址**: 写入 `.rdp` 文件的连接地址，例如 `rdp.example.com:3390`。如果为空，系统会根据监听地址和当前 Web 请求地址自动推导
- **票据有效期（秒）**: `.rdp` 文件内票据的有效时间，默认 `300` 秒，支持设置为 `60` 到 `3600` 秒

::: tip 对外访问地址怎么填
如果 Next Terminal 部署在反向代理、NAT、容器端口映射或负载均衡后面，建议显式填写客户端真正能访问到的 RDP 地址，例如 `rdp.example.com:3390` 或 `10.0.0.10:3390`。如果留空，而监听地址是 `0.0.0.0:3390`，系统会使用当前 Web 请求的主机名加 RDP 端口推导地址，这在复杂网络环境中可能不准确。
:::

::: warning 安全建议
如果监听地址配置为 `0.0.0.0:3390`，表示 RDP 代理端口可能被外部网络访问。请在防火墙、安全组或访问控制策略中只允许可信来源访问该端口。
:::

RDP 代理服务器启动时会自动生成用于 RDP 安全层的证书和私钥，默认保存到:

```text
data/rdp-proxy/server.crt
data/rdp-proxy/server.key
```

使用自签名证书时，RDP 客户端首次连接可能会提示证书或服务器身份警告，确认地址无误后继续连接即可。

### 步骤 3: 创建并授权 RDP 资产

RDP 代理服务器只支持协议为 `RDP` 的资产。使用前需要确认:

1. 资产协议选择为 `RDP`
2. 资产地址、端口、账号、密码、域等连接信息配置正确
3. 当前用户已被授权访问该资产
4. 如果目标资产需要通过网关访问，相关网关配置可正常连通

用户下载 `.rdp` 文件时，Next Terminal 会先校验资产授权；RDP 客户端连接代理后，代理再根据票据解析真实目标资产和连接凭据。用户不需要知道目标 Windows 主机的账号密码。

### 步骤 4: 下载 `.rdp` 文件

进入「资产」页面，找到 RDP 资产，在操作菜单中点击「下载RDP文件」。

Next Terminal 会生成一个短期票据，并下载类似下面名称的文件:

```text
next-terminal-RTxxxx.rdp
```

`.rdp` 文件中的关键内容类似:

```text
full address:s:rdp.example.com:3390
username:s:NTICKET:<ticketId>:<secret>
prompt for credentials:i:0
authentication level:i:2
enablecredsspsupport:i:0
redirectclipboard:i:1
drivestoredirect:s:*
```

字段含义:

- `full address`: RDP 代理服务器地址，对应系统设置中的「对外访问地址」或自动推导地址
- `username`: Next Terminal 生成的一次性票据，格式为 `NTICKET:<ticketId>:<secret>`
- `prompt for credentials:i:0`: 不弹出额外凭据输入框
- `enablecredsspsupport:i:0`: 关闭前端客户端到代理这一段的 CredSSP/NLA
- `redirectclipboard:i:1`: 启用剪贴板重定向
- `drivestoredirect:s:*`: 重定向客户端全部磁盘

::: warning 票据只能短时间使用
`.rdp` 文件中的票据默认 300 秒过期，并且成功解析一次后就会失效。请在下载后尽快打开连接，不要长期保存或重复使用旧 `.rdp` 文件。如果连接失败后提示票据过期、票据不存在或票据已使用，重新下载 `.rdp` 文件即可。
:::

### 步骤 5: 使用 RDP 客户端连接

下载 `.rdp` 文件后，使用本地 RDP 客户端打开:

- Windows: 双击 `.rdp` 文件，或使用「远程桌面连接」
- macOS: 使用 Microsoft Remote Desktop 导入或打开 `.rdp` 文件
- Linux: 使用支持 `.rdp` 文件的 RDP 客户端，或根据文件内容手动填写代理地址和用户名

连接流程如下:

1. RDP 客户端连接到 Next Terminal 的 RDP 代理地址
2. 代理读取 `.rdp` 文件中的 `NTICKET` 票据
3. Next Terminal 校验票据、用户权限和资产信息
4. 代理连接真实 RDP 资产，并使用资产中配置的账号密码登录目标 Windows 主机
5. 会话结束后，Next Terminal 记录会话断开状态

::: tip 关于 NLA
生成的 `.rdp` 文件会关闭客户端到 RDP 代理这一段的 NLA/CredSSP，这是代理解析票据所需的行为。代理连接后端 Windows 目标资产时仍会启用 NLA。通常不需要手动修改 `.rdp` 文件。
:::

## 文件传输与剪贴板

当前版本生成的 `.rdp` 文件默认开启:

```text
redirectclipboard:i:1
drivestoredirect:s:*
```

这意味着 RDP 客户端通常可以使用剪贴板复制文本或文件，也可以在远程桌面会话中访问本机重定向磁盘。实际效果仍取决于以下因素:

- 本地 RDP 客户端是否支持剪贴板和磁盘重定向
- 本地客户端是否允许重定向全部磁盘
- 目标 Windows 主机的远程桌面策略是否允许剪贴板或磁盘重定向
- 企业终端安全软件或组策略是否拦截文件传输

如果资产配置了 RemoteApp，`.rdp` 文件还会包含 `remoteapplicationmode`、`remoteapplicationprogram` 等字段，打开后会直接启动指定远程应用，而不是完整桌面。

## 常见问题

### 页面上看不到「下载RDP文件」

请检查:

1. 资产协议是否为 `RDP`
2. 当前用户是否已被授权访问该资产
3. 当前页面是否为资产列表或支持 RDP 代理下载的入口

### 下载 `.rdp` 文件失败

请检查:

1. 当前登录状态是否有效
2. 账号是否需要先完成双因素认证
3. 资产是否仍然存在且协议为 `RDP`
4. 用户是否仍有资产访问权限

### RDP 客户端无法连接代理地址

请检查:

1. **端口是否开放**: 防火墙、安全组或云厂商安全策略是否允许访问 RDP 代理端口
2. **端口是否映射**: Docker 部署时是否将容器内监听端口映射到宿主机
3. **对外访问地址是否正确**: `.rdp` 文件中的 `full address` 是否是客户端可达地址
4. **服务是否开启**: 系统设置中的 RDP 代理服务器是否已开启并保存
5. **服务是否启动**: Next Terminal 日志中是否显示 RDP proxy sidecar 启动成功
6. **监听地址是否冲突**: `3390` 或自定义端口是否已被其他进程占用

可以使用下面的命令测试端口连通性:

```bash
telnet rdp.example.com 3390
# 或
nc -zv rdp.example.com 3390
```

### 提示票据过期、票据不存在或票据已使用

RDP 代理票据是短期一次性凭据，常见原因包括:

1. 下载 `.rdp` 文件后等待太久才打开，超过票据有效期
2. 同一个 `.rdp` 文件已经成功连接过一次
3. RDP 客户端自动重连时复用了已消费的旧票据
4. 手动编辑 `.rdp` 文件导致 `NTICKET` 用户名不完整

处理方式是重新在资产页面点击「下载RDP文件」，使用新下载的文件连接。

### 可以手动输入 Windows 账号密码连接代理吗

不建议，也不是 RDP 代理服务器的设计用法。RDP 代理服务器使用 `.rdp` 文件中的 `NTICKET:<ticketId>:<secret>` 票据识别用户和资产，再由 Next Terminal 使用资产中保存的凭据连接真实 Windows 主机。

如果直接在 RDP 客户端里输入 Windows 账号密码，代理无法知道要连接哪一台资产，也无法完成权限校验和会话审计。

### 与 Web RDP 访问有什么区别

- **RDP 代理服务器**: 使用本地 RDP 客户端连接，体验更接近原生远程桌面，适合需要本地剪贴板、磁盘重定向、RemoteApp 或原生客户端能力的场景
- **Web RDP 访问**: 通过浏览器访问，无需暴露 RDP 代理端口，也无需本地 RDP 客户端，更适合临时访问或受限终端环境

### 是否支持在线监控和手动断开

当前 RDP 代理会话会记录会话状态，并可按策略参与录像和审计；但 RDP 代理会话暂不支持在线监控和从 Web 端主动断开。

### 与 SSH 代理服务器有什么区别

- **RDP 代理服务器**: 面向 Windows 远程桌面协议，通过 `.rdp` 文件和短期票据访问 RDP 资产
- **SSH 代理服务器**: 面向 SSH 协议，通过标准 SSH 客户端访问 SSH 资产，支持交互选择、直连模式和 SSH 隧道
