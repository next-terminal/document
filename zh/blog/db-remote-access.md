---
layout: doc
title: "数据库不敢开公网？MySQL/PostgreSQL 安全远程访问 3 种方式"
description: "MySQL远程访问、PostgreSQL远程访问、数据库安全、堡垒机方案 — 不开公网端口也能远程连数据库的 3 种方法：SSH 隧道、堡垒机审计、WireGuard/Tailscale VPN。"
head:
  - - meta
    - name: keywords
      content: MySQL远程访问,PostgreSQL远程,数据库安全,堡垒机,SSH隧道,数据库端口转发,WireGuard数据库,Tailscale
  - - meta
    - property: og:title
      content: 数据库不敢开公网？MySQL/PostgreSQL 安全远程访问 3 种方式
  - - meta
    - property: og:description
      content: MySQL远程访问、PostgreSQL远程、数据库安全、堡垒机审计 — 不开公网端口也能远程连数据库的 3 种方法。
date: 2026-08-31
updated: 2026-08-31
author: Next Terminal Team
---

# 数据库不敢开公网？MySQL/PostgreSQL 安全远程访问 3 种方式

在云服务器上部署 MySQL 或 PostgreSQL 后，第一件事往往是开放 3306 或 5432 端口的公网访问。这在安全扫描中几乎是"送靶"行为——Shodan 和 Censys 上暴露的数据库端口数以百万计，暴力破解、勒索加密的攻击从未停止。本文给出 **3 种不开公网端口的安全远程访问方案**，从最轻量的 SSH 隧道到企业级堡垒机审计，按团队规模和合规需求逐级递进。

## 方式一：SSH 隧道端口转发

SSH 隧道是最轻量的方案，零额外组件，一台有公网 SSH 的服务器即可完成。

### 原理

本地客户端通过 SSH 连接跳板机，将本地端口映射到远程数据库端口，数据库流量加密后通过 SSH 隧道传输。远程数据库只需监听内网或 127.0.0.1，无需暴露任何端口。

### 操作

```bash
# 将本地 3307 端口转发到远程内网 MySQL 3306
ssh -L 3307:127.0.0.1:3306 user@jump-server -N -f
# PostgreSQL 同理：ssh -L 5433:127.0.0.1:5432 user@jump-server -N -f

# 本地连接数据库
mysql -h 127.0.0.1 -P 3307 -u dbuser -p
```

### 优缺点

| 维度 | 说明 |
| --- | --- |
| 部署成本 | 零，只需 SSH |
| 审计能力 | 无，无法记录 SQL 语句 |
| 适用场景 | 个人开发者、临时排查 |
| 局限 | 无操作审计、多用户管理不便 |

## 方式二：堡垒机 / 跳板机（带审计）

当团队多人需要访问数据库时，SSH 隧道缺乏统一管理和操作审计，这正是[数据库审计](/zh/usage/database)的典型场景。

### 原理

堡垒机作为数据库访问的唯一入口，所有连接通过堡垒机代理转发。堡垒机记录每次连接的用户身份、SQL 语句和执行结果，满足等保合规和企业内审要求。

堡垒机侧通常还带 SQL 工单审批与操作录像；以 Next Terminal 为例，v3.8.1 起支持 PostgreSQL 协议级审计，连库操作能回溯到具体账号和 SQL 语句。

### 操作

以 [Next Terminal](https://www.next-terminal.com) 为例，配置数据库代理后，用户通过命令行即可连接：

```bash
# 通过堡垒机数据库代理连接 MySQL
mysql -h bastion-host -P 7001 -u dbuser@mysql-prod -p

# 通过堡垒机数据库代理连接 PostgreSQL
psql -h bastion-host -p 7002 -U dbuser@pg-prod -d mydb
```

数据库本身只监听内网地址，堡垒机开放代理端口对外：

```bash
# 检查 MySQL 仅监听内网
ss -tlnp | grep 3306
# 输出: 10.0.1.50:3306 表示仅内网

# 检查堡垒机代理端口
ss -tlnp | grep 7001
# 输出: 0.0.0.0:7001 表示对外可达
```

### 优缺点

| 维度 | 说明 |
| --- | --- |
| 部署成本 | 中等，需部署堡垒机 |
| 审计能力 | 完整，SQL 语句级审计、会话录像 |
| 适用场景 | 团队协作、合规审计 |
| 局限 | 增加一跳链路，需维护堡垒机 |

> 结合[安全网关](/zh/usage/agent-gateway)可进一步收敛数据库暴露面，仅放行内网白名单访问。

## 方式三：WireGuard / Tailscale VPN

对于需要频繁连接多个数据库的场景，VPN 提供最接近"在内网"的体验。

### 原理

在数据库服务器和开发者机器之间建立加密隧道，两端如同处于同一局域网。WireGuard 是内核级 VPN，性能优于 OpenVPN；Tailscale 基于 WireGuard 封装了组网和 NAT 穿透，零配置即可用。

### 操作

WireGuard 方案：

```bash
# 数据库服务器 wg0.conf
[Interface]
Address = 10.10.0.1/24
ListenPort = 51820
PrivateKey = <server-private-key>

[Peer]
PublicKey = <client-public-key>
AllowedIPs = 10.10.0.2/32

# 客户端 wg0.conf
[Interface]
Address = 10.10.0.2/24
PrivateKey = <client-private-key>

[Peer]
PublicKey = <server-public-key>
Endpoint = db-server-ip:51820
AllowedIPs = 10.10.0.0/24
PersistentKeepalive = 25

# 连接后通过 VPN 内网地址访问数据库
# mysql -h 10.10.0.1 -P 3306 -u dbuser -p
# psql -h 10.10.0.1 -p 5432 -U dbuser -d mydb
```

Tailscale 方案更简单，两端安装后自动组网，无需手动配置端口和密钥：

```bash
# 两端分别安装并登录
tailscale up

# 通过 Tailscale IP 直连数据库
mysql -h 100.x.x.x -P 3306 -u dbuser -p
```

### 优缺点

| 维度 | 说明 |
| --- | --- |
| 部署成本 | WireGuard 较低，Tailscale 零配置 |
| 审计能力 | 无，需额外工具 |
| 适用场景 | 频繁多库访问、开发测试环境 |
| 局限 | 无 SQL 审计、WireGuard 需内核支持 |

## 三种方式对比

| | SSH 隧道 | 堡垒机审计 | VPN (WireGuard/Tailscale) |
| --- | --- | --- | --- |
| 公网暴露 | 仅 SSH | 代理端口 | VPN 端口 |
| SQL 审计 | ❌ | ✅ | ❌ |
| 部署复杂度 | 低 | 中 | 低 |
| 多用户管理 | 差 | 好 | 中 |
| 合规审计 | 不满足 | 满足 | 不满足 |
| 连接延迟 | 略高 | 中 | 最低 |
| 推荐场景 | 个人/临时 | 团队/生产 | 开发测试 |

三种方式对应三种场景：个人与临时排查用 SSH 隧道零成本兜底，团队生产环境只有堡垒机能同时满足审计与合规，开发测试要频繁连多库就用 VPN。无论选哪种，数据库端口都不要直接暴露到公网。
