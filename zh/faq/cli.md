---
layout: doc
title: "命令行工具 — Next Terminal FAQ"
description: "Next Terminal 开源堡垒机的命令行工具 — 通过 CLI 管理资产、用户与堡垒机运维。"
head:
  - - meta
    - name: keywords
      content: 命令行, CLI, 堡垒机CLI, Next Terminal, 开源堡垒机
  - - meta
    - property: og:title
      content: "命令行工具 — Next Terminal FAQ"
  - - meta
    - property: og:description
      content: "Next Terminal 开源堡垒机的命令行工具 — 通过 CLI 管理资产、用户与堡垒机运维。"
---

# 命令行工具

### 查看帮助

```shell
docker compose exec next-terminal nt -h
```

输出

```shell
Usage:
  next-terminal [flags]
  next-terminal [command]

Available Commands:
  cert        User client certificate management commands
  completion  Generate the autocompletion script for the specified shell
  config      System configuration management commands
  geodata     Geolocation data management commands
  help        Help about any command
  sec         Security management commands
  status      Show system status
  user        User management commands
  version     Show version

Flags:
  -c, --config string   -c /path/config.yaml (default "/etc/next-terminal/config.yaml")
  -h, --help            help for next-terminal

Use "next-terminal [command] --help" for more information about a command.
```

### 用户管理

```shell
docker compose exec next-terminal nt user -h
```
输出
```shell
Usage:
  next-terminal user [command]

Available Commands:
  list        查看用户列表
  otpclr      清除用户OTP
  passwd      修改用户密码

Flags:
  -h, --help   help for user

Global Flags:
  -c, --config string   -c /path/config.yaml (default "/etc/next-terminal/config.yaml")

Use "next-terminal user [command] --help" for more information about a command.
```

**查看用户列表**

```shell
docker compose exec next-terminal nt user list
```

输出
```shell
+--------------------------------------+----------+----------------+------+-------------+----------+
|                  ID                  | USERNAME |    NICKNAME    | MAIL |    TYPE     |   OPT    |
+--------------------------------------+----------+----------------+------+-------------+----------+
| 35093131-204a-4db7-b61c-c6f7a7aa5ae4 | manager  | manager        |      | admin       | disabled |
+--------------------------------------+----------+----------------+------+-------------+----------+
```

**清除用户OTP**

```shell
docker compose exec next-terminal nt user otpclr 35093131-204a-4db7-b61c-c6f7a7aa5ae4
```

**修改用户密码**

```shell
docker compose exec next-terminal nt user passwd 35093131-204a-4db7-b61c-c6f7a7aa5ae4 newpassword
```

### 安全相关

```shell
docker compose exec next-terminal nt sec -h
```
输出
```shell
management login locked

Usage:
  next-terminal sec [command]

Available Commands:
  delete      删除登陆锁定
  list        登陆锁定列表

Flags:
  -h, --help   help for sec

Global Flags:
  -c, --config string   -c /path/config.yaml (default "/etc/next-terminal/config.yaml")

Use "next-terminal sec [command] --help" for more information about a command.
```

**登陆锁定列表**

```shell
docker compose exec next-terminal nt sec list
```

输出
```shell
+--------------------------------------+-----------------+----------------------------+---------------------+---------------------+
|                  ID                  |       IP        |          USERNAME          |      LOCKEDAT       |    EXPIRATIONAT     |
+--------------------------------------+-----------------+----------------------------+---------------------+---------------------+
| 026559fc-5c90-4aa2-b77d-43495df769ca | 195.178.110.3   | wanghe                     | 2025-03-27 01:07:34 | 2025-03-27 01:17:34 |
+--------------------------------------+-----------------+----------------------------+---------------------+---------------------+
```

**删除登陆锁定**

```shell
docker compose exec next-terminal nt sec delete 026559fc-5c90-4aa2-b77d-43495df769ca
```

### 用户客户端证书管理

```shell
docker compose exec next-terminal nt cert -h
```

输出
```shell
Commands for managing user client certificates, including generation and revocation

Usage:
  next-terminal cert [command]

Available Commands:
  generate    Generate user client certificate
  revoke      Revoke user client certificate

Flags:
  -h, --help   help for cert

Global Flags:
  -c, --config string   -c /path/config.yaml (default "/etc/next-terminal/config.yaml")

Use "next-terminal cert [command] --help" for more information about a command.
```

**生成用户客户端证书**

为指定用户生成客户端证书（PKCS#12 格式，扩展名 .p12），用于 mTLS 双向认证。

```shell
# 生成证书，使用默认文件名 <username>-client.p12
docker compose exec next-terminal nt cert generate <user-id>

# 指定输出文件路径
docker compose exec next-terminal nt cert generate <user-id> -o /path/to/cert.p12
```

示例输出：
```shell
🔐 Generating user client certificate...
🔐 Generating client certificate for user: admin (管理员)
✅ Client certificate generated successfully for user: admin
   Serial Number: 123456789
   Fingerprint: a1b2c3d4e5f6...
   Valid From: 2024-01-01 00:00:00
   Valid Until: 2025-01-01 00:00:00
   Saved to: admin-client.p12

💡 Note: This certificate file (.p12) can be imported into browsers or clients for authentication.
```

**吊销用户客户端证书**

吊销指定用户的活跃客户端证书，被吊销的证书将无法再用于身份验证。

```shell
docker compose exec next-terminal nt cert revoke <user-id>
```

示例输出：
```shell
📜 Revoking user client certificate...
📜 Revoking client certificate for user: admin (管理员)
✅ Client certificate revoked successfully for user: admin
   Serial Number: 123456789
   Fingerprint: a1b2c3d4e5f6...
```

### 系统配置管理

```shell
docker compose exec next-terminal nt config -h
```

输出
```shell
Commands for managing system configuration settings

Usage:
  next-terminal config [command]

Available Commands:
  get         Get system configuration property
  list        List all system configuration properties
  set         Set system configuration property

Flags:
  -h, --help   help for config

Global Flags:
  -c, --config string   -c /path/config.yaml (default "/etc/next-terminal/config.yaml")

Use "next-terminal config [command] --help" for more information about a command.
```

**查看所有配置项**

```shell
docker compose exec next-terminal nt config list
```

**获取指定配置项**

```shell
docker compose exec next-terminal nt config get <key>
```

**设置配置项**

```shell
docker compose exec next-terminal nt config set <key> <value>
```

> 📋 完整的系统配置项列表请参考：[系统属性配置表](./property)

### GeoIP 数据管理

用于下载和更新 GeoLite2 地理位置数据库，实现 IP 地址地理位置查询功能。

> 注意：GeoIP 下载功能仅在商业版中可用，免费版不支持该命令。

```shell
docker compose exec next-terminal nt geodata -h
```

输出
```shell
Geolocation data management commands

Usage:
  next-terminal geodata [command]

Available Commands:
  download    Download geolocation database

Flags:
  -h, --help   help for geodata

Global Flags:
  -c, --config string   -c /path/config.yaml (default "/etc/next-terminal/config.yaml")

Use "next-terminal geodata [command] --help" for more information about a command.
```

**下载 GeoIP 数据库**

```shell
# 下载或更新 GeoLite2 数据库（如果文件已存在则跳过）
docker compose exec next-terminal nt geodata download

# 强制重新下载（即使文件已存在）
docker compose exec next-terminal nt geodata download -f
```

示例输出：
```shell
📦 Downloading geolocation database...
🌍 GeoLite2 -> /usr/local/next-terminal/data/GeoLite2-City.mmdb
✅ Geolocation database ready
```

### 系统状态查看

```shell
docker compose exec next-terminal nt status
```

输出系统状态信息，包括版本、配置路径、录屏状态、SSH 服务器状态等：

```shell
🎯 Next Terminal System Status
=============================
📦 Version: v2.5.0
📂 Config Path: /etc/next-terminal/config.yaml
🏢 System Name: Next Terminal
©️  Copyright: Copyright © 2024
📹 Recording Enabled: true
🔗 SSH Server Enabled: true
🔗 SSH Server Address: 0.0.0.0:8022

✅ System status check completed
```