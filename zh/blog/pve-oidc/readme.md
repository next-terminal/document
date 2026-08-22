---
layout: doc
title: "使用 Next Terminal OIDC 登录 Proxmox VE — 开源堡垒机单点登录"
description: "用 Next Terminal 开源堡垒机的 OIDC 身份服务为 Proxmox VE 提供单点登录 — 以堡垒机为 IdP 的 SSO 实战。"
head:
  - - meta
    - name: keywords
      content: OIDC, 单点登录, Proxmox VE, 堡垒机, Next Terminal, 开源堡垒机, SSO
  - - meta
    - property: og:title
      content: "使用 Next Terminal OIDC 登录 Proxmox VE — 开源堡垒机单点登录"
  - - meta
    - property: og:description
      content: "用 Next Terminal 开源堡垒机的 OIDC 身份服务为 Proxmox VE 提供单点登录 — 以堡垒机为 IdP 的 SSO 实战。"
---

# 使用 Next Terminal OIDC 登录 Proxmox VE

本文演示如何配置 Proxmox VE 使用 Next Terminal 的 OIDC 服务进行身份认证。

> 前置条件：已在 Next Terminal 中启用 OIDC 服务器并创建客户端，参考 [OIDC 身份服务器使用文档](/usage/oidc_server)。

## 配置步骤

### 1. 添加 OpenID 认证

在 PVE 管理界面，进入「数据中心」→「权限」→「领域」→「添加」→「OpenID Connect 服务器」，填写配置：

- **Issuer URL**：`https://{next-terminal-host}/api`
- **领域**：`next-terminal`
- **Client ID**：从 Next Terminal 获取
- **Client Key**：从 Next Terminal 获取的 Client Secret
- **用户名声明**：`username`

![pve-add-openid.png](pve-add-openid.png)

### 2. 创建用户

在「数据中心」→「权限」→「用户」中添加用户：

- **用户名**：与 Next Terminal 用户名一致
- **领域**：选择 `next-terminal`

![pve-add-user.png](pve-add-user.png)

### 3. 配置权限

在「数据中心」→「权限」中为用户分配权限：

- **路径**：`/`
- **用户**：选择创建的 OIDC 用户
- **角色**：`Administrator`
- **传播**：勾选

![pve-permission.png](pve-permission.png)

### 4. 登录测试

访问 PVE 登录页面，在"领域"下拉框中选择 `next-terminal`，点击登录后会跳转到 Next Terminal 登录页面，使用 Next Terminal 账号登录即可。

![pve-login.png](pve-login.png)