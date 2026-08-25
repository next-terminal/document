---
layout: doc
title: "Web 资产安全发布：用 Next Terminal 替代 VPN 暴露内网系统"
description: "用 Next Terminal 开源堡垒机的 Web 资产安全网关替代 VPN 与 frp 发布内网系统：浏览器即用、身份先行、按资产授权，支持多网络统一入口与审计，适合中小团队的 JumpServer/Teleport 轻量替代方案。"
head:
  - - meta
    - name: keywords
      content: Web资产, 安全网关, VPN替代, 内网穿透, frp替代, 堡垒机, 开源堡垒机, 零信任, Next Terminal, JumpServer替代, Teleport替代
  - - meta
    - property: og:title
      content: Web 资产安全发布：用 Next Terminal 替代 VPN 暴露内网系统
  - - meta
    - property: og:description
      content: 通过 Next Terminal Web 资产与内置反向代理安全发布内网 GitLab、Jenkins 等系统，浏览器即用、身份与授权先行，多网络可叠加安全网关统一入口。
---

# Web 资产安全发布：用 Next Terminal 替代 VPN 暴露内网系统

对于需要对外提供内部系统的团队而言，**堡垒机**早已不只是 SSH 跳板。随着 GitLab、Jenkins、Wiki、后台管理面板等 Web 系统越来越多，如何在不铺设 VPN 的前提下安全地把内网 Web 服务发布出去，成为**开源堡垒机**选型的关键能力。Next Terminal 的 **Web 资产**与内置反向代理正是为此设计：以**零信任**思路替代传统 VPN 与 frp，让用户在浏览器中完成身份校验与授权后再访问目标系统，同时保留完整的访问审计。

本文以最小可运行示例演示如何发布一个内网 Web 资产，并说明多网络场景下如何通过安全网关实现统一入口。操作基于当前 v3.7.2 文档，涉及的配置项与路径均以官方文档为准。

## 为什么内网 Web 系统不该直接暴露

直接把 `192.168.1.10:80` 映射到公网端口，或用 frp 把内网服务推到公网，短期看最省事，长期却会带来三类风险：

- **攻击面放大**：端口扫描器可在几分钟内发现非标端口，暴力破解与漏洞探测随之而来，日志里很快会出现大量异常请求。
- **缺乏身份与授权**：frp 解决的是连通性，不解决“谁可以访问哪一个资产”。一旦端口可达，任何人都能尝试访问目标系统。
- **审计缺失**：谁在何时访问了哪个页面、是否越权尝试，均无法在统一位置追溯，难以满足运维审计与合规要求。

相比之下，基于堡垒机的 Web 资产发布把“先鉴权、再转发”作为默认路径，天然具备收敛攻击面与统一审计的能力。

## VPN 与 frp 各自的局限

| 方案 | 优势 | 局限 | 适合场景 |
| --- | --- | --- | --- |
| VPN（WireGuard 等） | 网络层加密、接入后访问自然 | 需分发客户端、处理路由与重连；账号一旦泄露往往获得过大网络权限 | 固定办公网、网络管理员可控环境 |
| frp / 内网穿透 | 部署轻、连通性好 | 无身份与授权、审计弱；把内网服务直接推向公网，安全策略需额外补齐 | 临时调试、个人项目 |
| **Next Terminal Web 资产** | **浏览器即用、身份与授权先行、按资产细粒度授权、统一审计** | 需正确配置域名与证书、反向代理端口 | **中小团队私有化部署、需替代 JumpServer/Teleport 的 Web 发布场景** |

如果你正在评估 **JumpServer 替代**或 **Teleport 替代**，Web 资产的易用性与审计完整度是值得重点对比的维度。

## Next Terminal Web 资产网关如何工作

典型链路如下：

```text
用户浏览器
  → 访问 https://gitlab.example.com
  → DNS 指向 Next Terminal 服务器
  → Next Terminal 校验登录态与 Web 资产授权
  → 按配置转发到内部地址 http://192.168.1.10:80
```

需要区分两个地址：

- **Web 资产域名**（如 `gitlab.example.com`）：用户在浏览器输入的域名，必须解析到 Next Terminal 服务器。
- **资产地址**（如 `192.168.1.10:80`）：Next Terminal 后端实际转发的内部 Web 服务地址。

该转发由 Next Terminal 内置反向代理完成，与部署在 Next Terminal 之前的 Nginx/CDN 等外部反向代理不是同一层。仅有“用户 → Next Terminal → 内网服务”时，按本文配置即可；若链路为“用户 → Nginx/CDN → Next Terminal → 内网服务”，需额外处理真实客户端 IP，详见[获取真实 IP](/zh/install/real-ip)与[反向代理](/zh/install/reverse-proxy)。

> Web 资产、资产管理与授权模型的完整说明见 [Web 资产](/zh/usage/website) 与[资产管理](/zh/usage/asset)。

## 5 分钟发布第一个 Web 资产

以下以 `gitlab.example.com → http://192.168.1.10:80` 为例，演示从配置到授权的最小闭环。

### 前置条件

- Next Terminal 已通过[容器安装](/zh/install/container-install)完成部署且可访问后台。
- 拥有可修改 DNS 的域名，已准备好 `nt.example.com`（管理后台）与 `gitlab.example.com`（Web 资产）的解析。
- Next Terminal 服务器（或目标安全网关）可访问 `192.168.1.10:80`。
- 服务器的 `80`/`443` 端口可被用户访问。

### 1. 配置 DNS

在 DNS 服务商添加两条 A 记录指向同一公网 IP（示例 `1.2.3.4`）：

| 主机记录 | 类型 | 值 |
| --- | --- | --- |
| `nt` | A | `1.2.3.4` |
| `gitlab` | A | `1.2.3.4` |

Web 资产较多时建议配置泛域名 `*.example.com → 1.2.3.4`，后续新增 `wiki.example.com` 等无需再改 DNS。

### 2. 启用内置反向代理

编辑 `config.yaml`，在 `App` 下启用 `ReverseProxy`：

```yaml
App:
  ReverseProxy:
    Enabled: true
    HttpEnabled: true
    HttpAddr: ":80"
    HttpRedirectToHttps: true
    HttpsEnabled: true
    HttpsAddr: ":443"
    SelfProxyEnabled: true
    SelfDomain: "nt.example.com"
    Root: ""
    IpExtractor: "direct"
    IpTrustList: []
```

字段要点：`SelfDomain` 为管理后台域名；`HttpRedirectToHttps` 建议开启；若前方有外部代理，`IpExtractor` 不应保持 `direct`，需按[获取真实 IP](/zh/install/real-ip)调整。

### 3. 映射端口并重启

容器部署时需放开反向代理端口：

```yaml
services:
  next-terminal:
    ports:
      - "8088:8088" # 管理后台
      - "80:80"     # Web 资产 HTTP
      - "443:443"   # Web 资产 HTTPS
```

执行：

```shell
docker compose down
docker compose up -d
```

### 4. 配置证书

进入后台 **证书管理**新增证书，支持自签名、导入已有 PEM、以及 ACME 自动申请。证书需覆盖 `nt.example.com` 与 `gitlab.example.com`，或直接使用 `*.example.com` 泛域名证书。

### 5. 添加 Web 资产并授权

在后台 **资源管理 → Web 资产**新增资产，填写域名 `gitlab.example.com` 与资产地址 `http://192.168.1.10:80`，保存后按用户或用户组授权。详细字段说明见 [Web 资产](/zh/usage/website)。

验证方式：

- 未登录时访问 `https://gitlab.example.com`，应跳转到 Next Terminal 登录页；
- 登录且有权限的用户可直接进入 GitLab；
- 无权限用户应被拒绝，相关访问记录可在审计日志中追溯。

## 多网络统一入口：叠加安全网关

当 Web 服务分散在多个云、多个机房或隔离网络时，无需为每个网络单独暴露入口。在各内网部署轻量[安全网关](/zh/usage/agent-gateway)，网关以反向隧道方式注册到 Next Terminal；创建 Web 资产时选择对应网关即可通过统一域名入口访问。

网关配置与网络筛选见[安全网关](/zh/usage/agent-gateway)与[安全网关配置文件](/zh/usage/agent-gateway-config)，其中 `network_include` 等字段可控制网关可达的网段。

## 常见问题

**Web 资产域名填什么？** 填用户在浏览器访问的域名（如 `gitlab.example.com`），且该域名必须解析到 Next Terminal，而非内网服务的真实地址。填错是新用户最常见的故障原因。

**必须用 443 吗？** 生产环境建议启用 HTTPS 并配置有效证书；内网测试可用自签名证书，但浏览器会提示不安全。

**已在 Next Terminal 前部署 Nginx/CDN 怎么办？** 属于“外部反向代理在前、内置反向代理在后”的两层结构，需正确透传与解析真实 IP，否则审计与限流会记录为上一跳代理的 IP。

**Web 资产与 mTLS 能否叠加？** 可以。Web 资产解决“谁能访问哪一个 Web 系统”，[HTTPS 证书双向认证](/zh/usage/mtls)在此基础上叠加客户端证书校验，适合对终端身份要求更高的场景。

## 小结

相比“VPN 全网放行”或“frp 直接暴露端口”，Next Terminal 的 Web 资产提供了一条更符合零信任原则的路径：用户在浏览器中先完成身份与授权校验，再由堡垒机网关转发到内网目标，兼顾易用性与可审计性。对于追求轻量、可私有化部署且需覆盖 SSH 与 Web 统一接入的团队，这是一条务实的 **VPN 替代**路径。

想快速验证，可按[容器安装](/zh/install/container-install)拉起服务，参照 [Web 资产](/zh/usage/website)与[安全网关](/zh/usage/agent-gateway)完成首个发布；在线体验与定价见 [https://demo.next-terminal.com](https://demo.next-terminal.com) 与 [https://www.next-terminal.com/pricing](https://www.next-terminal.com/pricing)。
