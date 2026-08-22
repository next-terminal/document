---
layout: doc
title: "系统属性配置表 — Next Terminal FAQ"
description: "Next Terminal 开源堡垒机的系统属性配置表 — 自托管部署的配置键与说明。"
head:
  - - meta
    - name: keywords
      content: 系统属性, 堡垒机配置, Next Terminal, 开源堡垒机
  - - meta
    - property: og:title
      content: "系统属性配置表 — Next Terminal FAQ"
  - - meta
    - property: og:description
      content: "Next Terminal 开源堡垒机的系统属性配置表 — 自托管部署的配置键与说明。"
---

# 系统属性配置表

本文档列出了 Next Terminal 系统中所有可通过命令行工具管理的配置项，表名称为 `property` 。

> 小提示：如果你把配置改坏了，又不想手动进数据库更改配置，可以把 property 表整个删除，然后重启系统，会重置为安装时的配置。

## 邮件服务配置

| 配置项键名 | 说明 | 类型 |
|-----------|------|------|
| `mail-enabled` | 是否开启邮件服务 | string |
| `mail-use-ssl` | 是否使用SSL | string |
| `mail-host` | 邮件服务器地址 | string |
| `mail-port` | 邮件服务器端口 | string |
| `mail-username` | 邮件服务账号 | string |
| `mail-password` | 邮件服务密码 | string |
| `mail-insecure-skip-verify` | 是否跳过SSL验证 | string |
| `mail-from` | 邮件发送者 | string |

## 登录安全配置

### 登录锁定

| 配置项键名 | 说明 | 类型 |
|-----------|------|------|
| `login-lock-enabled` | 是否开启登录锁定 | string |
| `login-lock-failed-duration` | 登录失败统计时长 | string |
| `login-lock-failed-times` | 登录失败次数阈值 | string |
| `login-lock-account-duration` | 账户锁定时长 | string |
| `login-lock-ip-duration` | IP锁定时长 | string |

### 登录认证

| 配置项键名 | 说明 | 类型 |
|-----------|------|------|
| `login-captcha-enabled` | 是否开启登录验证码 | string |
| `login-force-totp-enabled` | 是否开启强制双因素认证 | string |
| `password-strength-type` | 密码强度类型 | string |
| `password-strength-policy` | 密码强度策略 | string |
| `login-session-duration` | 登录会话有效时长（单位：分钟） | string |
| `login-session-count-custom` | 自定义登录会话有效个数 | string |
| `login-session-count-limit` | 登录会话有效个数 | string |
| `password-expiration-period` | 密码有效期限 | string |
| `disable-password-login` | 禁用密码登录 | string |

### 访问安全

| 配置项键名 | 说明 | 类型 |
|-----------|------|------|
| `access-require-mfa` | 访问资产必须进行多因素认证 | string |
| `access-mfa-expires-at` | 多因素认证过期时间 | string |
| `security-level` | 安全等级 | string |
| `user-client-cert-valid-days` | 用户客户端证书有效期（天） | string |
| `access-max-idle-second` | 访问最大空闲时间，-1 代表无需限制（单位：秒） | string |

## SSH 服务器配置

| 配置项键名 | 说明 | 类型 |
|-----------|------|------|
| `ssh-server-enabled` | 是否开启SSH服务器 | string |
| `ssh-server-addr` | SSH服务器监听地址 | string |
| `ssh-server-private-key` | SSH服务器身份私钥（用于证明服务器身份并建立加密连接） | string |
| `ssh-server-private-key-exists` | SSH服务器身份私钥是否存在 | string |
| `ssh-server-port-forwarding-enabled` | 是否允许通过SSH建立隧道进行端口转发 | string |
| `ssh-server-port-forwarding-host-port` | 允许转发的IP和端口 | string |
| `ssh-server-disable-password-auth` | 是否禁用密码认证 | string |

## 数据库代理配置

| 配置项键名 | 说明 | 类型 |
|-----------|------|------|
| `db-proxy-enabled` | 是否开启数据库代理 | string |
| `db-proxy-addr` | 数据库代理地址 | string |
| `db-proxy-block-dml` | 是否阻止DML操作 | string |

## 录屏和日志配置

| 配置项键名 | 说明 | 类型 |
|-----------|------|------|
| `recording-enabled` | 是否开启录屏 | string |
| `session-saved-limit-days` | 会话保存限制天数 | string |
| `login-log-saved-limit-days` | 登录日志保存限制天数 | string |
| `cron-log-saved-limit-days` | 定时任务日志保存限制天数 | string |
| `access-log-saved-limit-days` | 访问日志保存限制天数 | string |
| `db-sql-log-saved-limit-days` | 数据库SQL日志保存限制天数 | string |

## 系统信息配置

| 配置项键名 | 说明 | 类型 |
|-----------|------|------|
| `system-name` | 系统名称 | string |
| `system-logo` | 系统Logo | string |
| `system-copyright` | 系统版权 | string |
| `system-icp` | 系统备案信息 | string |
| `version` | 系统版本 | string |

## 水印配置

| 配置项键名 | 说明 | 类型 |
|-----------|------|------|
| `watermark-enabled` | 是否开启水印 | string |
| `watermark-content` | 水印内容 | string |
| `watermark-content-asset-username` | 水印使用资产账户 | string |
| `watermark-content-user-account` | 水印使用当前操作者账户 | string |
| `watermark-font-color` | 水印颜色 | string |
| `watermark-font-size` | 水印字体大小 | string |

## LDAP 配置

| 配置项键名 | 说明 | 类型 |
|-----------|------|------|
| `ldap-enabled` | 是否开启LDAP | string |
| `ldap-url` | LDAP服务器地址 | string |
| `ldap-user` | LDAP管理员账号 | string |
| `ldap-password` | LDAP管理员密码 | string |
| `ldap-base-dn` | LDAP基础DN | string |
| `ldap-user-search-size-limit` | LDAP用户搜索大小限制 | string |
| `ldap-user-search-filter` | LDAP用户搜索过滤器 | string |
| `ldap-user-property-mapping` | LDAP用户属性映射 | string |

## 用户配置

| 配置项键名 | 说明 | 类型 |
|-----------|------|------|
| `user-default-storage-size` | 用户默认存储空间大小（单位：Byte） | string |

## 代理网关配置

| 配置项键名 | 说明 | 类型 |
|-----------|------|------|
| `agent-gateway-endpoint` | 代理网关端点 | string |

## 分组配置

| 配置项键名 | 说明 | 类型 |
|-----------|------|------|
| `asset-group-tree` | 资产分组 | string |
| `website-group-tree` | 网站分组 | string |

## IP 配置

| 配置项键名 | 说明 | 类型 |
|-----------|------|------|
| `ip-extractor` | IP提取器 | string |
| `ip-trust-list` | IP信任列表 | string |

## 通行密钥配置

| 配置项键名 | 说明 | 类型 |
|-----------|------|------|
| `passkey-enabled` | 是否启用通行密钥 | string |
| `passkey-domain` | 通行密钥域名 | string |
| `passkey-origins` | 通行密钥来源地址 | string |

## 企业微信配置

| 配置项键名 | 说明 | 类型 |
|-----------|------|------|
| `wechat-work-enabled` | 是否启用企业微信登录 | string |
| `wechat-work-corp-id` | 企业微信企业ID | string |
| `wechat-work-agent-id` | 企业微信应用ID | string |
| `wechat-work-secret` | 企业微信应用Secret | string |
| `wechat-work-redirect-uri` | 企业微信回调地址 | string |
| `wechat-work-department` | 企业微信默认部门 | string |

## OIDC 客户端配置

| 配置项键名 | 说明 | 类型 |
|-----------|------|------|
| `oidc-enabled` | 是否启用OIDC登录 | string |
| `oidc-issuer` | OIDC发行者URL | string |
| `oidc-client-id` | OIDC客户端ID | string |
| `oidc-client-secret` | OIDC客户端密钥 | string |
| `oidc-redirect-uri` | OIDC回调地址 | string |
| `oidc-scopes` | OIDC权限范围 | string |
| `oidc-department` | OIDC用户默认所在部门 | string |

## OIDC Server 配置

| 配置项键名 | 说明 | 类型 |
|-----------|------|------|
| `oidc-server-enabled` | 是否启用OIDC Server | string |
| `oidc-server-issuer` | OIDC Server Issuer URL | string |
| `oidc-server-signing-key` | OIDC Server JWT签名密钥（RS256私钥） | string |
| `oidc-server-hmac-secret` | OIDC Server HMAC签名密钥（32字节） | string |
| `oidc-server-access-token-ttl` | Access Token过期时间（秒） | string |
| `oidc-server-refresh-token-ttl` | Refresh Token过期时间（秒） | string |
| `oidc-server-id-token-ttl` | ID Token过期时间（秒） | string |
| `oidc-server-auth-code-ttl` | Authorization Code过期时间（秒） | string |

## LLM 配置

| 配置项键名 | 说明 | 类型 |
|-----------|------|------|
| `llm-enabled` | 是否启用LLM | string |
| `llm-api-key` | LLM API密钥 | string |
| `llm-base-url` | LLM API基础地址 | string |
| `llm-model` | LLM模型名称 | string |
| `llm-temperature` | LLM温度参数 | string |
| `llm-max-tokens` | LLM最大token数量 | string |
| `llm-proxy-url` | LLM代理URL | string |
| `llm-shell-prompt` | Shell助手提示词 | string |
| `llm-shell-enabled` | 是否启用Shell助手 | string |
| `llm-audit-prompt` | 审计助手提示词 | string |
| `llm-audit-enabled` | 是否启用审计助手 | string |
