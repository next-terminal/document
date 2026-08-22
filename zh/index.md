---
layout: doc
title: Next Terminal 官方文档
description: Next Terminal 开源堡垒机与运维审计文档 — 支持 SSH/RDP/VNC/Telnet 统一接入、资产授权、会话审计与录像，JumpServer/Teleport 的轻量替代，适合中小团队私有化部署。
head:
  - - meta
    - name: keywords
      content: 开源堡垒机, 堡垒机, 跳板机, JumpServer替代, Teleport替代, 堡垒机部署, 运维审计, 会话审计, PAM, Next Terminal, SSH堡垒机, RDP审计
---

# Next Terminal 官方文档

通过这套文档完成 Next Terminal 部署、第一台资产接入、安全访问配置与日常维护。Next Terminal 将 SSH、RDP、VNC、SFTP、Telnet、Web 资产、权限控制与运维审计收敛到一套私有化部署的统一入口。

## 安装与运维

- 部署前先检查[系统需求](/zh/install/system-requirements)。
- 使用 [Docker Compose 容器部署](/zh/install/container-install)，并初始化管理员。
- 配置[反向代理](/zh/install/reverse-proxy)，同时正确获取[客户端真实 IP](/zh/install/real-ip)。
- 有可用性要求时，参考[主备高可用部署](/zh/install/ha-primary-standby-guide)。

## 快速开始使用

- 根据[快速开始](/zh/usage/readme)登录系统并了解控制面板。
- 添加并整理[资产与凭证](/zh/usage/asset)。
- 通过[资产访问工作区](/zh/usage/access)、[SSH 代理服务器](/zh/usage/ssh-server)或 [RDP 代理服务器](/zh/usage/rdp-server)建立连接。
- 通过 [Web 资产](/zh/usage/website)发布内部应用，或使用[安全网关](/zh/usage/agent-gateway)连接内网资产。

## 身份与访问安全

- 启用 [Passkey](/zh/usage/passkey) 或 [TOTP 双因素认证](/zh/usage/otp)。
- 使用 [OIDC 身份服务器](/zh/usage/oidc_server)对接应用登录。
- 需要客户端证书认证时，配置 [HTTPS 双向认证](/zh/usage/mtls)。

## 维护与故障排查

- 从[常见问题与排障入口](/zh/faq/readme)开始定位问题。
- 检查[配置文件说明](/zh/install/config-desc)和[系统配置表](/zh/faq/property)。
- 升级前先备份；只有决定迁移数据库大版本时，才执行 [PostgreSQL 16 迁移到 18](/zh/faq/postgresql-16-to-18) 指南。

产品定位和能力概览请访问 [Next Terminal 官网](https://www.next-terminal.com/)。具体功能与操作方式以你当前运行版本对应的文档为准。
