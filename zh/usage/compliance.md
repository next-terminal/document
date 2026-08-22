---
layout: doc
title: "用 Next Terminal 满足合规与审计要求 — 等保/内审对照"
description: "Next Terminal 开源堡垒机如何支撑合规与审计：会话审计与录像、命令拦截、访问控制、mTLS、离线会话与访问日志分析，满足等保与内审的运维合规要求。"
head:
  - - meta
    - name: keywords
      content: 堡垒机合规, 等保, 运维审计, 会话录像, 命令审计, mTLS, 离线录像, 访问日志分析, Next Terminal
  - - meta
    - property: og:title
      content: "用 Next Terminal 满足合规与审计要求"
  - - meta
    - property: og:description
      content: "将 Next Terminal 能力映射到审计/合规控制项：录像、命令规则、访问策略与日志分析。"
---

# 用 Next Terminal 满足合规与审计要求

Next Terminal 是私有化部署的堡垒机。本页将产品能力映射到常见的审计/合规控制项，承接“等保 堡垒机/运维审计合规”类搜索；不构成法律建议，请按贵方具体框架（等保、ISO 27001、SOC 2、内审）验证。

## 审计常问的 5 类控制项

| 控制项 | 常见问题 |
|--------|----------|
| 访问控制 | 谁在何时从何地能访问哪台资产？ |
| 身份认证 | 访问前如何验证身份？ |
| 操作可追溯 | 每次操作能否追溯到人？ |
| 证据留存 | 录像与日志是否留存且防篡改？ |
| 最小权限 | 高危操作能否事前拦截？ |

## Next Terminal 如何对应

### 1. 访问控制与最小权限

- **资产授权**按人/组/资产（[资产管理](/zh/usage/asset)、[资产访问](/zh/usage/access)），时间/来源由登录策略约束。
- **访问策略**与**命令过滤**（[SSH 代理](/zh/usage/ssh-server)）对高危命令拦截或走审批。
- **安全网关**（[安全网关](/zh/usage/agent-gateway)）统一 VPC/多机房入口，无需直开公网端口。

### 2. 强身份认证

- **Passkey/WebAuthn**（[通行密钥](/zh/usage/passkey)）、**TOTP**（[OTP](/zh/usage/otp)）、**LDAP/OIDC**（[OIDC](/zh/usage/oidc_server)）纳入企业 IdP。
- **mTLS 客户端证书**（[mTLS](/zh/usage/mtls)，`strict/ca_only`）在反向代理层先验资再转发。
- **SSH 网关**（[SSH 网关](/zh/usage/ssh-gateway)）保留 `ssh user@host` 习惯但走堡垒机鉴权。

### 3. 会话审计、录像与回放

- **在线会话** + **离线录像/转码** — 文本与图形会话可回放，见 [RDP 代理](/zh/usage/rdp-server) 与 [定价-审计增强](https://www.next-terminal.com/pricing)。
- **文件操作日志**与 **SQL 审计**（[数据库审计](/zh/usage/database)）— 何人何时做了何事。
- **访问日志分析** — 聚合分析与告警（增强版）。

### 4. 证据留存与分离

- 录像 **本地或 S3**（`App.Recording.Type: s3`）；`data` 共享仅为演示 HA 路径，见 [主备高可用](/zh/install/ha-primary-standby-guide) 与 [生产级 Checklist](/zh/install/ha-production-checklist) 迁移到 S3。
- **系统备份**（[备份](/zh/faq/backup)）— PostgreSQL + `data`（或 S3 版本）每日备份并演练恢复。

## 推荐初始策略（可直接落地）

1. 对外 Web 资产要求 MFA（Passkey/TOTP）+ mTLS。
2. 高危命令（`rm -rf /`、`drop database` 等）走命令规则拦截，仅审批豁免。
3. 录像留存 ≥180 天（或按制度），存 S3 并开对象锁/版本。
4. 每季度 HA 与恢复演练（见 Checklist），留存演练记录作为审计证据。

## 给审计看什么

- 用户/资产授权矩阵导出
- 一条会话回放 + 一条文件/SQL 审计样例
- 访问日志分析报表
- mTLS/IdP 配置与登录策略
- 备份/恢复演练记录与 HA Checklist 签字

> 需对照具体框架？带控制项清单在 [GitHub](https://github.com/dushixiang/next-terminal) 提 issue 或通过 [授权系统](https://license.next-terminal.com) 联系。
