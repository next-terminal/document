---
layout: doc
title: "System Property Table — Next Terminal FAQ"
description: "System property reference for Next Terminal open source bastion host — configuration keys and descriptions for self-hosted deployment."
head:
  - - meta
    - name: keywords
      content: system property, bastion host config, Next Terminal, open source bastion
  - - meta
    - property: og:title
      content: "System Property Table — Next Terminal FAQ"
  - - meta
    - property: og:description
      content: "System property reference for Next Terminal open source bastion host — configuration keys and descriptions for self-hosted deployment."
---

# System Property Table

This document lists all configurable properties in Next Terminal that can be managed via CLI (`property` table).

> Tip: If settings are broken and you do not want to edit database manually, you can delete the entire `property` table and restart the system. It will reset to install-time defaults.

## Mail Service

| Property Key | Description | Type |
|-----------|------|------|
| `mail-enabled` | Enable mail service | string |
| `mail-use-ssl` | Use SSL | string |
| `mail-host` | Mail server host | string |
| `mail-port` | Mail server port | string |
| `mail-username` | Mail service username | string |
| `mail-password` | Mail service password | string |
| `mail-insecure-skip-verify` | Skip SSL verification | string |
| `mail-from` | Sender address | string |

## Login Security

### Login Lock

| Property Key | Description | Type |
|-----------|------|------|
| `login-lock-enabled` | Enable login lock | string |
| `login-lock-failed-duration` | Failed login counting window | string |
| `login-lock-failed-times` | Failed login threshold | string |
| `login-lock-account-duration` | Account lock duration | string |
| `login-lock-ip-duration` | IP lock duration | string |

### Login Authentication

| Property Key | Description | Type |
|-----------|------|------|
| `login-captcha-enabled` | Enable login captcha | string |
| `login-force-totp-enabled` | Enforce two-factor authentication | string |
| `password-strength-type` | Password strength type | string |
| `password-strength-policy` | Password strength policy | string |
| `login-session-duration` | Login session TTL (minutes) | string |
| `login-session-count-custom` | Custom session count limit | string |
| `login-session-count-limit` | Active session count limit | string |
| `password-expiration-period` | Password expiration period | string |
| `disable-password-login` | Disable password login | string |

### Access Security

| Property Key | Description | Type |
|-----------|------|------|
| `access-require-mfa` | Require MFA before asset access | string |
| `access-mfa-expires-at` | MFA expiration time | string |
| `security-level` | Security level | string |
| `user-client-cert-valid-days` | User client certificate validity (days) | string |
| `access-max-idle-second` | Max idle time for access (`-1` means unlimited, seconds) | string |

## SSH Server

| Property Key | Description | Type |
|-----------|------|------|
| `ssh-server-enabled` | Enable SSH server | string |
| `ssh-server-addr` | SSH server listen address | string |
| `ssh-server-private-key` | SSH server identity private key, used to prove server identity and establish encrypted connections | string |
| `ssh-server-private-key-exists` | Whether the SSH server identity private key exists | string |
| `ssh-server-port-forwarding-enabled` | Allow SSH tunneling for port forwarding | string |
| `ssh-server-port-forwarding-host-port` | Allowed forwarding IP:port | string |
| `ssh-server-disable-password-auth` | Disable password authentication | string |

## Database Proxy

| Property Key | Description | Type |
|-----------|------|------|
| `db-proxy-enabled` | Enable Database Proxy | string |
| `db-proxy-addr` | Database Proxy address | string |
| `db-proxy-block-dml` | Block DML operations | string |

## Recording and Logs

| Property Key | Description | Type |
|-----------|------|------|
| `recording-enabled` | Enable recording | string |
| `session-saved-limit-days` | Session log retention days | string |
| `login-log-saved-limit-days` | Login log retention days | string |
| `cron-log-saved-limit-days` | Scheduled task log retention days | string |
| `access-log-saved-limit-days` | Access log retention days | string |
| `db-sql-log-saved-limit-days` | DB SQL log retention days | string |

## System Information

| Property Key | Description | Type |
|-----------|------|------|
| `system-name` | System name | string |
| `system-logo` | System logo | string |
| `system-copyright` | System copyright | string |
| `system-icp` | ICP registration info | string |
| `version` | System version | string |

## Watermark

| Property Key | Description | Type |
|-----------|------|------|
| `watermark-enabled` | Enable watermark | string |
| `watermark-content` | Watermark content | string |
| `watermark-content-asset-username` | Include asset username in watermark | string |
| `watermark-content-user-account` | Include operator account in watermark | string |
| `watermark-font-color` | Watermark color | string |
| `watermark-font-size` | Watermark font size | string |

## LDAP

| Property Key | Description | Type |
|-----------|------|------|
| `ldap-enabled` | Enable LDAP | string |
| `ldap-url` | LDAP server URL | string |
| `ldap-user` | LDAP admin user | string |
| `ldap-password` | LDAP admin password | string |
| `ldap-base-dn` | LDAP base DN | string |
| `ldap-user-search-size-limit` | LDAP user search size limit | string |
| `ldap-user-search-filter` | LDAP user search filter | string |
| `ldap-user-property-mapping` | LDAP user attribute mapping | string |

## User Defaults

| Property Key | Description | Type |
|-----------|------|------|
| `user-default-storage-size` | Default user storage size (bytes) | string |

## Agent Gateway

| Property Key | Description | Type |
|-----------|------|------|
| `agent-gateway-endpoint` | Agent gateway endpoint | string |

## Grouping

| Property Key | Description | Type |
|-----------|------|------|
| `asset-group-tree` | Asset group tree | string |
| `website-group-tree` | Website group tree | string |

## IP

| Property Key | Description | Type |
|-----------|------|------|
| `ip-extractor` | IP extractor strategy | string |
| `ip-trust-list` | Trusted IP list | string |

## Passkey

| Property Key | Description | Type |
|-----------|------|------|
| `passkey-enabled` | Enable passkey | string |
| `passkey-domain` | Passkey domain | string |
| `passkey-origins` | Passkey origin URLs | string |

## WeCom (Enterprise WeChat)

| Property Key | Description | Type |
|-----------|------|------|
| `wechat-work-enabled` | Enable WeCom login | string |
| `wechat-work-corp-id` | WeCom corp ID | string |
| `wechat-work-agent-id` | WeCom app ID | string |
| `wechat-work-secret` | WeCom app secret | string |
| `wechat-work-redirect-uri` | WeCom redirect URI | string |
| `wechat-work-department` | Default WeCom department | string |

## OIDC Client

| Property Key | Description | Type |
|-----------|------|------|
| `oidc-enabled` | Enable OIDC login | string |
| `oidc-issuer` | OIDC issuer URL | string |
| `oidc-client-id` | OIDC client ID | string |
| `oidc-client-secret` | OIDC client secret | string |
| `oidc-redirect-uri` | OIDC redirect URI | string |
| `oidc-scopes` | OIDC scopes | string |
| `oidc-department` | Default department for OIDC users | string |

## OIDC Server

| Property Key | Description | Type |
|-----------|------|------|
| `oidc-server-enabled` | Enable OIDC Server | string |
| `oidc-server-issuer` | OIDC Server issuer URL | string |
| `oidc-server-signing-key` | OIDC Server JWT signing key (RS256 private key) | string |
| `oidc-server-hmac-secret` | OIDC Server HMAC signing key (32 bytes) | string |
| `oidc-server-access-token-ttl` | Access Token TTL (seconds) | string |
| `oidc-server-refresh-token-ttl` | Refresh Token TTL (seconds) | string |
| `oidc-server-id-token-ttl` | ID Token TTL (seconds) | string |
| `oidc-server-auth-code-ttl` | Authorization Code TTL (seconds) | string |

## LLM

| Property Key | Description | Type |
|-----------|------|------|
| `llm-enabled` | Enable LLM | string |
| `llm-api-key` | LLM API key | string |
| `llm-base-url` | LLM API base URL | string |
| `llm-model` | LLM model name | string |
| `llm-temperature` | LLM temperature | string |
| `llm-max-tokens` | LLM max tokens | string |
| `llm-proxy-url` | LLM proxy URL | string |
| `llm-shell-prompt` | Shell assistant prompt | string |
| `llm-shell-enabled` | Enable shell assistant | string |
| `llm-audit-prompt` | Audit assistant prompt | string |
| `llm-audit-enabled` | Enable audit assistant | string |
