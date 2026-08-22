---
layout: doc
title: "通行密钥 — Next Terminal"
description: "Next Terminal 开源堡垒机的通行密钥 Passkey — 基于 WebAuthn 的无密码认证，堡垒机访问更安全。"
head:
  - - meta
    - name: keywords
      content: Passkey, 通行密钥, WebAuthn, 无密码, 堡垒机, Next Terminal
  - - meta
    - property: og:title
      content: "通行密钥 — Next Terminal"
  - - meta
    - property: og:description
      content: "Next Terminal 开源堡垒机的通行密钥 Passkey — 基于 WebAuthn 的无密码认证，堡垒机访问更安全。"
---

# 通行密钥

> Passkey 通过公私钥加密提供了比传统密码更安全、更便捷的身份认证方式，有效防止密码泄露、钓鱼和中间人攻击，同时提升用户体验，是未来身份认证的发展趋势。

::: tip 注意
**必须开启 HTTPS 才能使用此功能。**

域名不包含协议和端口，例如：`next.example.com`

来源不包含地址后面的 `/`，例如：`https://next.example.com`
:::

首先在设置页面开启通行密钥功能

![img.png](images/passkey-setting.png)

在个人中心添加一个密钥

![img.png](images/passkey-add.png)

之后在登陆时就会自动选择通行密钥登陆。