---
layout: doc
title: "Windows / RDP 资产 — Next Terminal"
description: "在 Next Terminal 中添加和访问 Windows RDP 资产，使用 Web 远程桌面、剪贴板、网络驱动器、RemoteApp 和本地 RDP 客户端。"
---

# Windows / RDP 资产

RDP 资产用于访问 Windows 服务器和桌面。Next Terminal 支持浏览器远程桌面，也可以通过 RDP 代理服务器和 Termark 调用本地远程桌面客户端。

## 添加 RDP 资产

进入「资产管理 > 资产」，点击「新建」，将协议设置为 `RDP`。默认端口是 `3389`。

基础字段需要填写：

- Windows 主机地址和 RDP 端口。
- 目标 Windows 用户名与密码，或者选择授权凭证。
- 域账号使用的 Windows 域；本地账号通常留空。
- 目标无法直连时使用的网关链。

> RDP 不支持 SSH 私钥认证。Windows 主机必须已经启用远程桌面，并允许该账号登录。

## RDP 高级设置

源码中的 RDP 资产提供以下独立设置页：

| 设置 | 使用场景 |
| --- | --- |
| 安全设置 | 协议安全协商和证书校验 |
| 显示设置 | 分辨率、色彩深度、窗口缩放和无损压缩 |
| 音频设置 | 禁用音频或启用麦克风输入 |
| 域 | 使用 Active Directory 域账号登录 |
| PDU | 特定 RDP 网关或虚拟化环境需要预连接 ID/数据时使用 |
| RemoteApp | 只打开指定 Windows 应用，不进入完整桌面 |
| 网络驱动器 | 在浏览器和 Windows 会话之间中转文件 |
| WOL | 连接前唤醒支持 Wake-on-LAN 的 Windows 设备 |

大多数完整桌面连接只需要基础信息和域。遇到兼容问题时再调整安全和显示设置。

<!-- TODO(image): 补充当前版本 RDP 基础、域、安全和显示设置截图。 -->

## 授权与接入方式

保存资产并完成管理员连接测试后，通过[资源授权](/zh/usage/authorization)分配给用户或部门。

| 接入方式 | 适合场景 |
| --- | --- |
| 浏览器远程桌面 | 无需安装客户端，适合临时访问和统一工作区 |
| [RDP 代理服务器](/zh/usage/rdp-server) | 使用 Windows 远程桌面等本地客户端，保留原生交互体验 |
| [Termark](/zh/usage/termark) | 在桌面客户端中统一查看和打开已授权的 SSH/RDP 资产 |

## 浏览器远程桌面工具

进入会话后，点击右下角工具按钮可以使用：

- **文件系统**：管理映射到 Windows 会话的 Next Terminal 存储。
- **会话共享**：邀请其他人员加入当前会话。
- **剪贴板**：将文本发送到 Windows，或接收 Windows 返回的文本。
- **组合键**：发送 `Ctrl+Alt+Delete`、`Windows+E`、`Windows+R` 等浏览器不便直接发送的按键。
- **全屏**：将远程桌面切换为全屏。

剪贴板按钮是否可用取决于资源授权关联的访问策略。浏览器无法读取系统剪贴板时，可以打开剪贴板面板手动粘贴文本。

<!-- TODO(image): 补充 RDP 会话工具菜单、剪贴板和组合键菜单截图。 -->

## Windows 文件管理

Windows 文件管理使用“Next Terminal 存储 + RDP 网络驱动器”中转。它不会让浏览器直接浏览 Windows 的 `C:`、`D:` 等磁盘。

### 管理员配置

1. 进入「资产管理 > 存储」，新建存储并配置名称、是否共享和大小限制。
2. 编辑 RDP 资产，打开「网络驱动器」。
3. 启用网络驱动器。
4. 选择一个共享存储；不选择时，系统使用当前操作者的默认存储空间。
5. 在资源授权中选择允许相应文件操作的访问策略。
6. 保存后重新建立 RDP 会话。

![RDP 网络驱动器设置](images/asset-rdp-drive.png)

### 从本地电脑上传到 Windows

1. 在 RDP 会话右下角打开「文件系统」。
2. 进入需要存放文件的目录。
3. 点击上传文件图标，或将文件拖入文件列表。
4. 在“文件进度”中等待上传和后端传输都完成。
5. 回到 Windows 会话，打开文件资源管理器。
6. 在映射的网络驱动器中找到文件，再复制到 `C:`、`D:` 等目标磁盘。

### 从 Windows 下载到本地电脑

1. 在 Windows 文件资源管理器中，将文件从目标磁盘复制到映射的网络驱动器。
2. 回到浏览器并打开「文件系统」。
3. 刷新文件列表。
4. 右键目标文件并选择下载。
5. 多选批量下载属于高级版本能力；目录需要先进入后下载其中的文件，或使用批量下载能力。

![RDP 会话中的网络驱动器](images/rdp_fs.png)

文件按钮是否显示由访问策略控制。更多操作和权限说明参阅[文件管理](/zh/usage/file-management)。

## RemoteApp

RemoteApp 用于直接打开发布的 Windows 应用，而不显示完整桌面。

1. 在目标 Windows 主机上发布应用，可以使用 [RemoteApp Tool](https://github.com/kimmknight/remoteapptool)。
2. 记录发布别名和程序路径。
3. 编辑 RDP 资产并打开「Remote App」。
4. “远程应用”填写 `||应用别名`，例如 `||notepad`。
5. 按需填写远程应用目录和启动参数。
6. 保存并重新连接。

![在 Windows 中发布 RemoteApp](images/asset-rdp-remote-app-win.png)

![配置 RemoteApp](images/asset-rdp-remote-app-setting.png)

![RemoteApp 会话](images/asset-rdp-remote-app-view.png)

如果仍进入完整桌面，先核对 Windows 端发布别名；如果应用启动失败，再检查路径、参数和账号权限。

## 常见问题

### 文件系统按钮没有显示

确认资产已启用网络驱动器，存储可用，并且重新建立了会话。还要检查当前授权使用的访问策略。

### Windows 中看不到网络驱动器

确认 RDP 资产已启用网络驱动器且存储选择有效，然后完全断开旧会话并重新连接。旧会话不会自动加载修改后的驱动器配置。

### 复制粘贴不可用

检查访问策略中的复制和粘贴权限；再检查浏览器剪贴板权限。无法自动同步时使用会话工具中的剪贴板面板。

### 黑屏、证书或安全协商失败

参阅 [RDP/VNC 错误码](/zh/usage/error-codes)和 [RDP 黑屏排查](/zh/blog/rdp-black-screen-failed)。不要在不理解影响时长期关闭证书或安全校验。
