---
layout: doc
title: "故障排查 — Next Terminal"
description: "按登录、SSH、RDP/VNC、文件管理、Web 资产和网关症状查找 Next Terminal 常见问题与解决办法。"
---

# 故障排查

本区域按照用户看到的故障现象组织内容。正常配置和使用流程请优先查阅[使用文档](/zh/usage/readme)；备份、升级和迁移位于安装或系统维护文档。

## 按症状查找

| 问题类型 | 常见现象 | 排障文档 |
| --- | --- | --- |
| 登录与账号 | 账号被锁、无法查看密码、OTP/Passkey 问题 | [登录与认证](./authentication) |
| SSH | 认证失败、私钥不兼容、频繁断开、乱码 | [SSH 连接](./ssh) |
| Windows / RDP / VNC | 黑屏、断开、域认证、剪贴板、RealVNC 失败 | [RDP 与 VNC](./rdp-vnc) |
| 文件管理 | SFTP 为空、没有文件按钮、Windows 找不到上传文件 | [文件管理](./file-management) |
| Web 资产 | 域名错误、WebSocket 失败、Grafana Origin 报错 | [Web 资产](./web-assets) |
| 网络与网关 | 资产离线、网关在线但资产不通、IPv6、WOL | [网络与网关](./network-gateway) |

## 通用排查顺序

1. 记录完整错误信息、发生时间、当前用户和资产名称。
2. 确认问题影响单个用户、单个资产，还是所有用户和资产。
3. 使用管理员账号测试同一资产，区分连接配置与用户授权问题。
4. 检查[资源授权和访问策略](/zh/usage/authorization)是否有效。
5. 检查 Next Terminal 或所选网关到目标地址和端口的连通性。
6. 在[日志审计](/zh/usage/audit)中查询访问、会话、命令或文件记录。
7. 修改配置后建立新会话；已有会话不一定加载最新设置。

## 提交问题时应提供

- Next Terminal 版本与部署方式。
- 浏览器或本地客户端名称和版本。
- 资产协议、目标系统版本和接入方式。
- 是否使用安全网关、SSH 网关或网关链。
- 完整错误信息和发生时间。
- 可复现步骤，以及管理员账号是否同样失败。
- 相关日志；提供前请移除密码、令牌、私钥、Cookie 和内部敏感地址。

## 系统维护与参考

- [系统备份与恢复](/zh/usage/backup)
- [命令行工具参考](/zh/usage/cli)
- [系统属性配置参考](/zh/usage/system-properties)
- [原生安装升级](/zh/install/native-upgrade)
- [PostgreSQL 16 迁移到 18](/zh/install/postgresql-16-to-18)
- [从 1.x 升级到 2.x（历史）](/zh/install/v1-to-v2)
