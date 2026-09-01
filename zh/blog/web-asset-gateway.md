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

## 内置反向代理的关键配置

Web 资产的对外发布由 Next Terminal 内置反向代理承接。配置项集中在 `config.yaml` 的 `App.ReverseProxy` 下：

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

几个要留意的点：`SelfDomain` 填管理后台域名，让内置代理把后台与 Web 资产统一挂在同一对端口上；`HttpRedirectToHttps` 建议开着，把 HTTP 流量转到 HTTPS。若前方还有外部代理（Nginx/CDN），`IpExtractor` 不能保持 `direct`，否则审计与限流记录的是上一跳代理的 IP，需按[获取真实 IP](/zh/install/real-ip)配置。

**两个地址别搞混：** Web 资产域名（浏览器输入的那个，如 `gitlab.example.com`）必须解析到 Next Terminal，而不是内网服务的真实地址——这是新用户最常见的故障；资产地址（如 `http://192.168.1.10:80`）才是后端真正转发的内部位置。DNS 配两条 A 记录指向同一公网 IP 即可：

| 主机记录 | 类型 | 值 |
| --- | --- | --- |
| `nt` | A | `1.2.3.4` |
| `gitlab` | A | `1.2.3.4` |

Web 资产多时建议用泛域名 `*.example.com → 1.2.3.4`，后续新增 `wiki.example.com` 无需再改 DNS。

证书在后台"证书管理"维护，支持自签名（仅测试，浏览器会报不安全）、导入 PEM、以及 ACME 自动申请。生产建议用有效证书覆盖 `nt.example.com` 与 `gitlab.example.com`，或直接配 `*.example.com` 泛域名证书。若对终端身份要求更高，可在 Web 资产之上叠加 [HTTPS 证书双向认证](/zh/usage/mtls)：Web 资产解决"谁能访问哪个系统"，mTLS 再补一层客户端证书校验。

后端按域名把请求转发到内部服务，例如 `gitlab.example.com → http://192.168.1.10:80`。所有经由该入口的访问都落到统一审计日志：未登录访问跳转登录页，有权限的直接进入，无权限的被拒绝并留痕。

## 多网络统一入口：叠加安全网关

当 Web 服务分散在多个云、多个机房或隔离网络时，无需为每个网络单独暴露入口。在各内网部署轻量[安全网关](/zh/usage/agent-gateway)，网关以反向隧道方式注册到 Next Terminal；创建 Web 资产时选择对应网关即可通过统一域名入口访问。

网关配置与网络筛选见[安全网关](/zh/usage/agent-gateway)与[安全网关配置文件](/zh/usage/agent-gateway-config)，其中 `network_include` 等字段可控制网关可达的网段。
