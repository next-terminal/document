---
layout: doc
title: "Passkey — Next Terminal"
description: "Passkey support in Next Terminal open source bastion host — passwordless authentication with WebAuthn for bastion access."
head:
  - - meta
    - name: keywords
      content: passkey, WebAuthn, passwordless, bastion host, Next Terminal
  - - meta
    - property: og:title
      content: "Passkey — Next Terminal"
  - - meta
    - property: og:description
      content: "Passkey support in Next Terminal open source bastion host — passwordless authentication with WebAuthn for bastion access."
---

# Passkey

> Passkey provides stronger and more convenient authentication than traditional passwords through public/private-key cryptography. It helps prevent credential leaks, phishing, and man-in-the-middle attacks.

::: tip Note
**HTTPS is required for this feature.**

Domain should not include protocol or port, for example: `next.example.com`

Origins should not include trailing path slash, for example: `https://next.example.com`
:::

First, enable passkey in Settings:

![img.png](images/passkey-setting.png)

Then add a passkey in Personal Center:

![img.png](images/passkey-add.png)

After that, login can use passkey automatically.
