---
layout: doc
title: "资产管理 — Next Terminal"
description: "Next Terminal 开源堡垒机的资产管理 — SSH/RDP/VNC/Telnet 资产、分组、凭证与授权，统一访问与运维审计。"
head:
  - - meta
    - name: keywords
      content: 资产管理, 堡垒机, SSH资产, RDP资产, Next Terminal, 开源堡垒机
  - - meta
    - property: og:title
      content: "资产管理 — Next Terminal"
  - - meta
    - property: og:description
      content: "Next Terminal 开源堡垒机的资产管理 — SSH/RDP/VNC/Telnet 资产、分组、凭证与授权，统一访问与运维审计。"
---

# 资产管理

### 支持协议
- RDP (Windows远程桌面)
- SSH (Linux/Unix安全连接)
- VNC (图形界面远程控制)
- Telnet (传统终端协议)

### 添加资产
1. 点击"新增资产"按钮
2. 选择协议类型
3. 填写连接信息：
    - 直接输入账户密码
    - 或选择预先创建的授权凭证
4. 保存配置

![资产列表界面](images/asset-list.png)
![资产添加表单](images/asset-post.png)

### 高级功能

#### RemoteApp配置

1. 使用 [RemoteApp Tool](https://github.com/kimmknight/remoteapptool) 配置服务端
2. 在资产配置中填写：
    - **远程应用**：格式为`||应用程序名`（如`||notepad`）
    - **工作目录**（可选）
    - **启动参数**（可选）

Windows配置示例：
![assets-rdp](images/asset-rdp-remote-app-win.png)

系统参数示例：
![assets-rdp](images/asset-rdp-remote-app-setting.png)

连接成功后：
![assets-rdp](images/asset-rdp-remote-app-view.png)

#### 网络驱动

> **解决**：RDP文件传输限制问题

启用方法：
1. 编辑资产配置
2. 启用"设备映射"选项
3. 配置存储管理作为网络映射盘

![img.png](images/asset-rdp-drive.png)

### 授权凭证

授权凭证是统一管理账号密码的功能，在添加授权凭证之后，新增资产时选择账户类型为：授权凭证，即可在下方的授权凭证处选择已添加好的账号密码，便于复用。

![img.png](images/credential.png)

### 命令片段

命令片段用于记录一些复杂指令，在接入终端时直接使用。

![img.png](images/snippet-list.png)

![img_1.png](images/snippet-use.png)