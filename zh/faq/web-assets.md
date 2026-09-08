---
layout: doc
title: "Web 资产问题 — Next Terminal"
description: "排查 Next Terminal Web 资产域名、回源地址、登录跳转、WebSocket、Grafana Origin 和 HTTPS 证书问题。"
---

# Web 资产问题

正常发布流程和字段说明参阅 [Web 资产](/zh/usage/website)。

## Web 资产域名无法访问

按链路逐段检查：

```text
用户浏览器 → DNS → Next Terminal Web 资产监听端口
→ 安全网关（如有）→ 目标网站
```

- Web 资产域名必须解析到 Next Terminal，而不是目标内部网站。
- 域名不能与管理端 `SelfDomain` 或其他 Web 资产重复。
- 反向代理、防火墙和容器端口必须允许 Web 资产 HTTP/HTTPS 流量。
- 目标地址应能从 Next Terminal 或所选安全网关访问。

## 访问后循环跳转登录

- 检查管理端公开地址、`Root` 和 `SelfDomain` 是否与用户实际访问地址一致。
- 确认 HTTPS 终止层正确传递协议和 Host 信息。
- 清除该域名的旧 Cookie 后重新测试。
- 检查 Web 资产域名是否误用了管理端域名。

## Grafana 显示 `origin not allowed` 或 WebSocket 失败

Grafana 会校验请求的 Host 和 Origin。编辑 Web 资产，检查“回源主机名”：

- 需要让 Grafana 感知用户访问域名时，选择跟随访问域名。
- Grafana 只接受内部源站主机名时，选择跟随源站或指定主机名。

同时确认外层反向代理和 Next Terminal 均允许 WebSocket Upgrade，并检查 Grafana 的 `root_url`、`domain` 和 Origin 相关配置。旧版文档中的 “Custom Header > Retain hostname” 已由当前回源主机名设置表达，应以当前界面为准。

## 页面能打开，但静态资源或 API 仍指向内网地址

优先修改目标应用的公开 URL、Base URL 或反向代理配置。只有无法修改源站时，再使用 Web 资产的响应内容修改能力替换内部主机名。内容替换会增加维护成本，源站升级后需要重新验证。

## HTTPS 提示证书不匹配

- 证书必须覆盖用户访问的 Web 资产域名。
- 通配符证书只覆盖对应层级，例如 `*.example.com` 不覆盖 `a.b.example.com`。
- 确认证书已签发成功、未过期，并绑定到正确域名。
- 使用外部反向代理终止 TLS 时，检查它实际返回的证书。

## 用户登录后仍提示无权访问

Web 资产使用独立的 Web 资产授权。确认当前用户或部门已获得该网站授权，并检查有效期。普通服务器资产授权不会自动授权 Web 资产。

## 安全网关在线，但 Web 资产返回 502/504

在线只说明网关与 Next Terminal 保持连接，不代表网关能够访问源站。应从网关所在网络检查目标 IP/域名、端口、DNS、TLS 和回源超时。
