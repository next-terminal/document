---
layout: doc
title: "CLI Tool — Next Terminal FAQ"
description: "CLI tool for Next Terminal open source bastion host — command-line operations for assets, users and bastion administration."
head:
  - - meta
    - name: keywords
      content: CLI, command line, bastion host CLI, Next Terminal, open source bastion
  - - meta
    - property: og:title
      content: "CLI Tool — Next Terminal FAQ"
  - - meta
    - property: og:description
      content: "CLI tool for Next Terminal open source bastion host — command-line operations for assets, users and bastion administration."
---

# CLI Tool

## Show Help

```shell
docker compose exec next-terminal nt -h
```

Output:

```shell
Usage:
  next-terminal [flags]
  next-terminal [command]

Available Commands:
  cert        User client certificate management commands
  completion  Generate autocompletion script for the specified shell
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

## User Management

```shell
docker compose exec next-terminal nt user -h
```

Output:

```shell
Usage:
  next-terminal user [command]

Available Commands:
  list        List users
  otpclr      Clear user OTP
  passwd      Change user password

Flags:
  -h, --help   help for user

Global Flags:
  -c, --config string   -c /path/config.yaml (default "/etc/next-terminal/config.yaml")

Use "next-terminal user [command] --help" for more information about a command.
```

### List users

```shell
docker compose exec next-terminal nt user list
```

Example output:

```shell
+--------------------------------------+----------+----------------+------+-------------+----------+
|                  ID                  | USERNAME |    NICKNAME    | MAIL |    TYPE     |   OPT    |
+--------------------------------------+----------+----------------+------+-------------+----------+
| 35093131-204a-4db7-b61c-c6f7a7aa5ae4 | manager  | manager        |      | admin       | disabled |
+--------------------------------------+----------+----------------+------+-------------+----------+
```

### Clear user OTP

```shell
docker compose exec next-terminal nt user otpclr 35093131-204a-4db7-b61c-c6f7a7aa5ae4
```

### Change user password

```shell
docker compose exec next-terminal nt user passwd 35093131-204a-4db7-b61c-c6f7a7aa5ae4 newpassword
```

## Security Management

```shell
docker compose exec next-terminal nt sec -h
```

Output:

```shell
management login locked

Usage:
  next-terminal sec [command]

Available Commands:
  delete      Delete a login lock record
  list        List login lock records

Flags:
  -h, --help   help for sec

Global Flags:
  -c, --config string   -c /path/config.yaml (default "/etc/next-terminal/config.yaml")

Use "next-terminal sec [command] --help" for more information about a command.
```

### List login locks

```shell
docker compose exec next-terminal nt sec list
```

Example output:

```shell
+--------------------------------------+-----------------+----------------------------+---------------------+---------------------+
|                  ID                  |       IP        |          USERNAME          |      LOCKEDAT       |    EXPIRATIONAT     |
+--------------------------------------+-----------------+----------------------------+---------------------+---------------------+
| 026559fc-5c90-4aa2-b77d-43495df769ca | 195.178.110.3   | wanghe                     | 2025-03-27 01:07:34 | 2025-03-27 01:17:34 |
+--------------------------------------+-----------------+----------------------------+---------------------+---------------------+
```

### Delete login lock

```shell
docker compose exec next-terminal nt sec delete 026559fc-5c90-4aa2-b77d-43495df769ca
```

## User Client Certificate Management

```shell
docker compose exec next-terminal nt cert -h
```

Output:

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

### Generate user client certificate

Generate PKCS#12 certificate (`.p12`) for a specific user (for mTLS).

```shell
# Generate certificate with default filename <username>-client.p12
docker compose exec next-terminal nt cert generate <user-id>

# Specify output file
docker compose exec next-terminal nt cert generate <user-id> -o /path/to/cert.p12
```

Example output:

```shell
🔐 Generating user client certificate...
🔐 Generating client certificate for user: admin (Administrator)
✅ Client certificate generated successfully for user: admin
   Serial Number: 123456789
   Fingerprint: a1b2c3d4e5f6...
   Valid From: 2024-01-01 00:00:00
   Valid Until: 2025-01-01 00:00:00
   Saved to: admin-client.p12

💡 Note: This certificate file (.p12) can be imported into browsers or clients for authentication.
```

### Revoke user client certificate

```shell
docker compose exec next-terminal nt cert revoke <user-id>
```

Example output:

```shell
📜 Revoking user client certificate...
📜 Revoking client certificate for user: admin (Administrator)
✅ Client certificate revoked successfully for user: admin
   Serial Number: 123456789
   Fingerprint: a1b2c3d4e5f6...
```

## System Configuration Management

```shell
docker compose exec next-terminal nt config -h
```

Output:

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

### List all properties

```shell
docker compose exec next-terminal nt config list
```

### Get one property

```shell
docker compose exec next-terminal nt config get <key>
```

### Set one property

```shell
docker compose exec next-terminal nt config set <key> <value>
```

> Full property list: [System Property Table](./property)

## GeoIP Data Management

Used to download/update GeoLite2 database for IP geolocation.

> Note: `geodata download` is available in Commercial Edition only.

```shell
docker compose exec next-terminal nt geodata -h
```

Output:

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

### Download GeoIP database

```shell
# Download/update GeoLite2 database (skip if exists)
docker compose exec next-terminal nt geodata download

# Force re-download even if file exists
docker compose exec next-terminal nt geodata download -f
```

Example output:

```shell
📦 Downloading geolocation database...
🌍 GeoLite2 -> /usr/local/next-terminal/data/GeoLite2-City.mmdb
✅ Geolocation database ready
```

## System Status

```shell
docker compose exec next-terminal nt status
```

Example output includes version/config path/recording/ssh status:

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
