---
layout: doc
title: "浏览器访问工作区 — Next Terminal"
description: "在 Next Terminal 浏览器工作区中查找和打开 SSH、RDP、VNC、Telnet 资产，并使用会话工具。"
---

# 浏览器访问工作区

访问工作区是普通用户在浏览器中使用已授权资产的统一入口。本页介绍共通操作；每种协议的具体功能请进入对应文档。

## 使用前提

- 管理员已经创建资产并测试成功。
- 当前账号已通过[资源授权](/zh/usage/authorization)获得访问权限。
- Next Terminal 服务端或网关能够访问目标资产。

## 查找资产

进入资产访问页面后，可以通过左侧分组树和搜索框查找资产。列表只展示当前账号已授权且适合浏览器接入的资源。

点击资产即可在工作区中打开会话。多个资产会以不同标签页并存，关闭标签页会结束或离开对应会话。

<!-- TODO(image): 补充当前版本访问工作区全景、资产搜索和多标签页截图。 -->

## 按协议使用

- [SSH 资产](/zh/usage/ssh)：终端、SFTP 文件系统、命令片段、状态监控和 AI 助手。
- [Windows / RDP 资产](/zh/usage/rdp)：远程桌面、剪贴板、组合键、网络驱动器和 RemoteApp。
- [VNC 与 Telnet 资产](/zh/usage/vnc-telnet)：VNC 图形桌面或 Telnet 字符终端。
- [Web 资产](/zh/usage/website)：在通过认证和授权后访问内部网站。
- [数据库审计](/zh/usage/database)：使用数据库客户端通过代理接入，不在此工作区内建立 SQL 会话。

## 会话共享

SSH、RDP 和 VNC 会话可以提供共享入口。共享者应确认接收者身份，并在协作结束后关闭共享。共享操作仍应遵循组织的审计和数据访问要求。

## 文件和剪贴板

- SSH 文件管理直接操作目标主机的 SFTP 文件系统。
- RDP 文件管理通过 Next Terminal 存储和 Windows 网络驱动器中转。
- RDP/VNC 剪贴板是否可用取决于访问策略和浏览器权限。

具体步骤参阅[文件管理](/zh/usage/file-management)。

## 连接失败时的检查顺序

1. 资产是否仍出现在当前用户列表。
2. 授权是否过期，访问策略是否允许所需功能。
3. 管理员是否也无法连接；如果是，检查资产地址、凭证和网关。
4. 仅 RDP/VNC 失败时，查看 [RDP/VNC 错误码](/zh/usage/error-codes)。
5. 查看访问日志、在线会话和离线会话记录。

## 使用本地客户端

如果浏览器不是合适的入口，可以选择：

- [SSH 代理服务器](/zh/usage/ssh-server)
- [RDP 代理服务器](/zh/usage/rdp-server)
- [Termark 本地客户端](/zh/usage/termark)
