---
layout: doc
title: "获取真实客户端 IP — Next Terminal"
description: "Next Terminal 开源堡垒机在反向代理与 Docker 环境下获取真实客户端 IP — X-Forwarded-For 与审计准确性。"
head:
  - - meta
    - name: keywords
      content: 真实IP, 反向代理, X-Forwarded-For, 堡垒机审计, Next Terminal
  - - meta
    - property: og:title
      content: "获取真实客户端 IP — Next Terminal"
  - - meta
    - property: og:description
      content: "Next Terminal 开源堡垒机在反向代理与 Docker 环境下获取真实客户端 IP — X-Forwarded-For 与审计准确性。"
---

# 获取真实客户端 IP

当 NextTerminal 前面有 Nginx、CDN、WAF、负载均衡等代理时，NextTerminal 直接看到的是"上一跳代理"的 IP，不是真实用户 IP。本文说明应该在哪里、怎么配置才能正确识别真实客户端 IP。

## ⚠ 重要：NextTerminal 有两处 IP 提取配置

很多用户搞不定真实 IP 是因为没意识到这一点：**NextTerminal 把"管理后台"和"Web 资产反向代理"当作两个独立的服务，它们各自有一份独立的 IP 提取配置**。

| # | 配置入口 | 影响功能 |
| --- | --- | --- |
| **A** | `config.yaml` 的 `App.ReverseProxy.IpExtractor` / `IpTrustList` | Web 资产访问日志、临时白名单、公开访问 IP 策略、地理位置限制等 **Web 资产**相关功能 |
| **B** | 后台 → **系统设置 → 网络设置** → "IP地址获取方式" / "信任的IP地址" | 管理后台**登录日志**、登录 IP 锁定、登录策略 IP 校验、Access Token 跟踪等 **管理后台**相关功能 |

::: tip 怎么判断该改哪一处
- **如果 Web 资产访问日志里 IP 不对** → 改 A（config.yaml）。
- **如果管理后台登录日志、安全审计里 IP 不对** → 改 B（系统设置）。
- **如果两边都不对** → 两处都要改，通常填的值一致。
:::

::: warning SelfProxyEnabled = true 部署
当 `SelfProxyEnabled: true` 时，访问管理后台的请求会先经过 Web 资产内置反向代理（A），再 dispatch 给管理后台逻辑（B）。这种部署下，管理后台看到的"上一跳"是内置反代，所以 B 里通常需要把 `127.0.0.1/32` 加入信任列表，并使用 `x-forwarded-for`。
:::

## 三种 IP 提取模式

两处配置的"IP 提取方式"取值都是同一组：

| 模式 | 说明 | 何时选用 |
| --- | --- | --- |
| `direct` | 直接使用网络连接的对端 IP | NextTerminal 前面没有任何代理（默认值） |
| `x-forwarded-for` | 从 `X-Forwarded-For` 请求头识别真实 IP | 前面有任意代理时的**首选** |
| `x-real-ip` | 读取 `X-Real-IP` 请求头 | 仅当外层代理只设了 `X-Real-IP`，且没有多级代理时使用 |

::: tip 选 `x-forwarded-for` 还是 `x-real-ip`
只要链路中可能有多级代理，永远选 `x-forwarded-for`。它能记录完整代理链，遇到 CDN+Nginx、WAF+负载均衡等组合时仍然能正确还原真实 IP，而 `x-real-ip` 只会记录最后一跳设置的值。
:::

::: warning Docker userland-proxy 可能导致拿不到真实 IP
如果 NextTerminal 通过 Docker 端口映射对外暴露，且所有访问者都显示为 Docker 网关或宿主机侧地址，例如 `172.17.0.1`、`172.18.0.1`，优先检查 Docker 的 `userland-proxy`。一旦 `userland-proxy` 隐藏了原始网络对端地址，且请求里没有标准的 `X-Forwarded-For` / `X-Real-IP` 请求头，NextTerminal 无法仅靠自身配置还原真实客户端 IP。

解决方法见：[禁用 Docker userland-proxy](./disable-docker-userland-proxy)。
:::

## 按访问链路选择配置

先确认访问链路，再对照下表填写两处配置。

| 访问链路 | A：config.yaml（Web 资产） | B：系统设置（管理后台） |
| --- | --- | --- |
| 用户 → NextTerminal | `direct`，信任列表留空 | `direct`，信任列表留空 |
| 用户 → NextTerminal（`SelfProxyEnabled: true`） | `direct`，信任列表留空 | `x-forwarded-for`，信任 `127.0.0.1/32` |
| 用户 → Nginx → NextTerminal | `x-forwarded-for`，信任 Nginx 出站 IP | `x-forwarded-for`，信任 Nginx 出站 IP |
| 用户 → 负载均衡 → NextTerminal | `x-forwarded-for`，信任负载均衡回源 IP | `x-forwarded-for`，信任负载均衡回源 IP |
| 用户 → CDN/WAF → NextTerminal | `x-forwarded-for`，信任 CDN/WAF 全部回源段 | `x-forwarded-for`，信任 CDN/WAF 全部回源段 |
| 用户 → CDN → Nginx → NextTerminal | `x-forwarded-for`，信任 CDN 回源段 + Nginx IP | `x-forwarded-for`，信任 CDN 回源段 + Nginx IP |

下面分场景给出可复制的具体配置。

## 场景一：用户直接访问 NextTerminal

链路：

```text
用户 → NextTerminal
```

**A. config.yaml**

```yaml
App:
  ReverseProxy:
    IpExtractor: "direct"
    IpTrustList: []
```

**B. 系统设置 → 网络设置**

| 字段 | 填写 |
| --- | --- |
| IP 地址获取方式 | `直接获取（direct）` |
| 信任的 IP 地址 | 留空 |

::: warning
如果 NextTerminal 前面其实存在代理而你选了 `direct`，将得到代理服务器 IP，不是真实用户 IP。
:::

## 场景二：仅启用 SelfProxyEnabled（无外部代理）

链路：

```text
用户 → NextTerminal 内置反代（:80/:443）→ 管理后台 / Web 资产
```

这是最容易踩坑的部署：用户没有装 Nginx、没用 CDN，但因为 `SelfProxyEnabled: true`，访问管理后台的请求会先经过内置反代再 dispatch 给后台逻辑——对管理后台而言，"上一跳"就是内置反代（loopback）。

**A. config.yaml**（Web 资产部分）

```yaml
App:
  ReverseProxy:
    SelfProxyEnabled: true
    SelfDomain: "nt.example.com"
    IpExtractor: "direct"
    IpTrustList: []
```

Web 资产由内置反代直接处理，对它而言用户是直连过来的，用 `direct` 即可。

**B. 系统设置 → 网络设置**（管理后台部分）

| 字段 | 填写 |
| --- | --- |
| IP 地址获取方式 | `从 X-Forwarded-For 获取（x-forwarded-for）` |
| 信任的 IP 地址 | `127.0.0.1/32` |

如果你用 Docker 部署，发现管理后台日志里看到的不是 `127.0.0.1` 而是容器网关地址（如 `172.18.0.1`），就把那个地址或对应网段填进去：

| 字段 | 填写 |
| --- | --- |
| IP 地址获取方式 | `x-forwarded-for` |
| 信任的 IP 地址 | `172.18.0.0/16` |

## 场景三：用户通过 Nginx 访问 NextTerminal

链路：

```text
用户 → Nginx → NextTerminal
```

Nginx 配置示例：

```nginx
location / {
    proxy_pass http://127.0.0.1:8088;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $http_connection;
}
```

**A. config.yaml**

```yaml
App:
  ReverseProxy:
    IpExtractor: "x-forwarded-for"
    IpTrustList:
      - "127.0.0.1/32"   # Nginx 与 NextTerminal 同机，回源用 loopback
```

**B. 系统设置 → 网络设置**

| 字段 | 填写 |
| --- | --- |
| IP 地址获取方式 | `x-forwarded-for` |
| 信任的 IP 地址 | `127.0.0.1/32` |

如果 Nginx 用内网 IP 回源到 NextTerminal（例如 `10.0.0.5 → 10.0.0.10`），把 `127.0.0.1/32` 改成 `10.0.0.5/32`。

## 场景四：用户通过 CDN、WAF 或负载均衡访问

链路：

```text
用户 → CDN/WAF/负载均衡 → NextTerminal
```

或：

```text
用户 → CDN/WAF/负载均衡 → Nginx → NextTerminal
```

**A. config.yaml**

```yaml
App:
  ReverseProxy:
    IpExtractor: "x-forwarded-for"
    IpTrustList:
      - "10.0.0.5/32"        # Nginx 或负载均衡回源 IP（如有）
      - "203.0.113.0/24"     # CDN/WAF 回源 IP 段（示例，需替换为厂商提供的真实段）
```

**B. 系统设置 → 网络设置**

填写与 A 相同的"IP 地址获取方式"和"信任的 IP 地址"。

::: warning 必须填厂商官方回源 IP 段
请到 CDN/WAF 控制台获取**官方回源 IP 段列表**，把全部网段都加入信任列表。主流厂商（Cloudflare、阿里云 CDN、腾讯云 CDN、AWS CloudFront 等）都会提供这份列表。**不要**直接用上面示例里的 `203.0.113.0/24`。
:::

如果你的厂商把真实 IP 放在自定义请求头中（例如 Cloudflare 的 `CF-Connecting-IP`），NextTerminal 当前不直接读取这类自定义头。建议在外层 Nginx 或负载均衡里把厂商头转换为标准 `X-Forwarded-For` 后再转发给 NextTerminal。

## 场景五：使用 X-Real-IP

链路：

```text
用户 → Nginx（仅设置 X-Real-IP）→ NextTerminal
```

Nginx 配置：

```nginx
location / {
    proxy_pass http://127.0.0.1:8088;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**A. config.yaml**

```yaml
App:
  ReverseProxy:
    IpExtractor: "x-real-ip"
    IpTrustList:
      - "127.0.0.1/32"
```

**B. 系统设置 → 网络设置**

| 字段 | 填写 |
| --- | --- |
| IP 地址获取方式 | `从 X-Real-IP 获取（x-real-ip）` |
| 信任的 IP 地址 | `127.0.0.1/32` |

::: warning
`X-Real-IP` 也可以被客户端伪造，只有当请求来自信任列表中的代理时才会被采纳。如果链路中有 CDN、WAF 等多级代理，请改用 `x-forwarded-for`。
:::

## IpTrustList 怎么填

**信任列表填的是"可信代理服务器"的 IP 或网段，不是普通用户的 IP。**

举例：

```text
用户真实 IP：8.8.8.8
Nginx IP：10.0.0.5
NextTerminal IP：10.0.0.10

访问链路：
8.8.8.8 → 10.0.0.5 → 10.0.0.10
```

✅ 正确：

```yaml
IpTrustList:
  - "10.0.0.5/32"
```

❌ 错误：

```yaml
IpTrustList:
  - "8.8.8.8/32"
```

`8.8.8.8` 是普通用户 IP，把它加进信任列表毫无意义且有安全风险。

### 多级代理示例

```text
用户真实 IP：8.8.8.8
CDN 回源 IP：203.0.113.10
Nginx IP：10.0.0.5
NextTerminal IP：10.0.0.10

访问链路：
8.8.8.8 → 203.0.113.10 → 10.0.0.5 → 10.0.0.10
```

✅ 正确：

```yaml
IpTrustList:
  - "203.0.113.10/32"
  - "10.0.0.5/32"
```

CDN 通常有几十到上百段回源 IP，用厂商官方提供的回源段列表全部加入。

## X-Forwarded-For 是怎么被解析的

`X-Forwarded-For` 通常长这样：

```text
X-Forwarded-For: 8.8.8.8, 203.0.113.10, 10.0.0.5
```

它表示请求大致经过：

```text
8.8.8.8 → 203.0.113.10 → 10.0.0.5 → NextTerminal
```

NextTerminal 使用 `x-forwarded-for` 时，**从右到左**逐个检查：

1. 如果 IP 在信任列表里，说明它是可信代理，继续向左。
2. 遇到第一个**不在**信任列表里的 IP，把它作为真实客户端 IP。

例如：

```yaml
IpTrustList:
  - "203.0.113.10/32"
  - "10.0.0.5/32"
```

对于 `X-Forwarded-For: 8.8.8.8, 203.0.113.10, 10.0.0.5`，最终识别的真实客户端 IP 就是 `8.8.8.8`。

## 默认信任的网段

为了简化常见内网部署，即使你不填 `IpTrustList`，NextTerminal 也会**自动信任**以下网段：

- IPv4：`10.0.0.0/8`、`172.16.0.0/12`、`192.168.0.0/16`、`127.0.0.0/8`（loopback）、`169.254.0.0/16`（link-local）
- IPv6：`fc00::/7`、`::1/128`、`fe80::/10`

::: warning 这是固定行为，不可关闭
即便你显式填了 `IpTrustList`，上述默认网段仍然会被追加信任。如果你的代理位于这些网段，可以不写信任列表；如果不在（例如公网 CDN 回源段），必须显式填写。
:::

::: tip 生产环境仍建议显式填写
默认信任私有地址只是给"懒人"留的兜底。如果你的部署涉及多云、容器网络、或公网代理混合，仍然推荐把实际代理 IP 或网段明确写进信任列表，便于审计和排查。
:::

## 排查方法

### 1. 确认访问链路

先把链路写下来：

```text
用户 → ? → ? → NextTerminal
```

链路不清楚时不要随意配置信任列表。

### 2. 检查代理是否传递了请求头

如果使用 Nginx，临时增加调试日志：

```nginx
log_format realip_debug '$remote_addr | $http_x_forwarded_for | $http_x_real_ip | $host | $request';
access_log /var/log/nginx/realip_debug.log realip_debug;
```

访问一次 NextTerminal 或 Web 资产后查看：

| 字段 | 含义 |
| --- | --- |
| `$remote_addr` | Nginx 看到的上一跳 IP |
| `$http_x_forwarded_for` | 客户端或上游传来的 `X-Forwarded-For` |
| `$http_x_real_ip` | 客户端或上游传来的 `X-Real-IP` |

判断：

- 如果 `X-Forwarded-For` 为空，说明上游代理没有传递该头，需要先在上游补上。
- 如果有值但 NextTerminal 显示的仍是代理 IP，通常是 IP 提取方式或信任列表填错了。
- 如果所有用户都显示为同一个 IP，通常显示的就是最后一跳代理的 IP。

### 3. 看对应日志页面确认效果

| 现象出现位置 | 改哪一处配置 |
| --- | --- |
| Web 资产 → 访问日志 | A：config.yaml |
| 登录日志 / 安全审计 / 登录失败锁定 | B：系统设置 → 网络设置 |

### 4. 配置生效时机

| 配置 | 生效时机 |
| --- | --- |
| A：config.yaml 改动 | **必须重启** NextTerminal |
| B：系统设置 → 网络设置 | **保存即生效**，无需重启 |

### 5. 检查是否信任了错误的 IP

❌ 不要这样配：

```yaml
IpTrustList:
  - "0.0.0.0/0"
  - "::/0"
```

这等于"信任所有来源"，会让客户端伪造 `X-Forwarded-For` / `X-Real-IP` 后绕过基于 IP 的访问控制。

## 安全注意事项

1. 不要盲目信任 HTTP 请求头，`X-Forwarded-For` 和 `X-Real-IP` 都可被客户端伪造。
2. 只有当请求来自可信代理时，才使用代理传来的 IP 头。
3. `IpTrustList` 只填可信代理服务器的 IP 或网段。
4. 外层代理应**覆盖**或正确**追加**客户端传来的 IP 相关请求头，防止用户伪造。
5. 不在生产环境中配置 `0.0.0.0/0` 或 `::/0`。

## 相关文档

- [Web 资产使用指南](../usage/website) — Web 资产的反向代理功能配置
- [配置文件详解](./config-desc) — `config.yaml` 完整字段说明
- [反向代理 NextTerminal](./reverse-proxy) — 用 Nginx / Caddy 在 NextTerminal 前面架反向代理的示例
