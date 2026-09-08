---
layout: doc
title: "登录与认证问题 — Next Terminal"
description: "排查 Next Terminal 登录锁定、凭证二次认证、OTP 和 Passkey 等账号认证问题。"
---

# 登录与认证问题

## 查看密码或私钥时为什么要求二次认证？

目标资产凭证属于高敏感信息。即使管理员已经登录，查看已保存的密码、私钥或 Passphrase 时仍需要再次验证身份。

请先绑定 [TOTP](/zh/usage/otp) 或 [Passkey](/zh/usage/passkey)，再重新执行查看操作。二次认证只允许本次受保护操作，不会把秘密信息公开给普通用户。

## 登录多次失败后账号或 IP 被锁定怎么办？

等待锁定到期，或者由管理员在「身份认证 > 登录锁定」中解除。无法进入管理端时，可以使用 CLI：

```shell
docker compose exec next-terminal nt sec list
docker compose exec next-terminal nt sec delete <锁定记录ID>
```

完整命令参阅[命令行工具参考](/zh/usage/cli)。解除前先确认失败登录确实来自合法用户，避免放开正在发生的暴力尝试。

## 用户登录成功，但看不到任何资产

这通常不是登录问题。请检查：

1. 用户或所属部门是否获得资产授权。
2. 授权选择的资产或资产分组是否正确。
3. 授权是否已经到期。
4. 用户是否进入了支持该协议的入口。

参阅[资源授权与访问策略](/zh/usage/authorization)。

## 丢失 TOTP 设备后如何恢复？

由管理员确认用户身份后，在用户管理界面清除 TOTP，或执行：

```shell
docker compose exec next-terminal nt user otpclr <用户ID>
```

用户重新登录后应尽快绑定新的 MFA。不要仅凭聊天消息或未验证的邮件请求清除 MFA。

## Passkey 无法使用

- 确认当前访问域名和系统配置的 Passkey 域名一致。
- 确认使用 HTTPS；除本地开发地址外，WebAuthn 通常要求安全上下文。
- 确认凭证保存在当前设备、密码管理器或安全密钥中。
- 更换域名后需要按新域名重新配置和绑定。

详细配置参阅 [Passkey](/zh/usage/passkey)。

如果用户已经丢失所有注册 Passkey 的设备，应先核验用户身份，再通过命令行清除该用户的全部 Passkey：

```shell
docker compose exec next-terminal nt user passkeyclr <用户ID>
```

该操作会删除用户注册的所有 Passkey。恢复后应要求用户尽快重新绑定，并复核相关管理日志和登录日志。命令说明参阅[命令行工具参考](/zh/usage/cli)。
