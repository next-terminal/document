---
layout: doc
title: "RDP 与 VNC 连接问题 — Next Terminal"
description: "排查 Next Terminal 的 Windows RDP 黑屏、域认证、剪贴板、网络驱动器、旧版 Windows 和 RealVNC 问题。"
---

# RDP 与 VNC 连接问题

正常配置参阅 [Windows / RDP 资产](/zh/docs/usage/rdp)和 [VNC 与 Telnet 资产](/zh/docs/usage/vnc-telnet)。错误码含义参阅 [RDP/VNC 错误码](/zh/docs/usage/error-codes)。

## RDP 连接后黑屏或立即断开

先区分目标 Windows 本身的问题和浏览器代理问题：

1. 从 Next Terminal 或最后一级网关所在网络确认 `3389` 或自定义端口可达。
2. 使用同一账号从受控环境直连 Windows，确认远程桌面服务和账号正常。
3. 检查资产用户名、密码和域。
4. 将 RDP 安全模式先保留为“自动协商”；只有明确知道服务端要求时才指定 NLA、TLS 或 RDP。
5. 检查系统和资产的显示设置，重新建立会话。
6. 查看错误码、Next Terminal 日志和 Windows 事件查看器。

完整步骤参阅 [RDP 黑屏或连接失败排查](/zh/docs/blog/rdp-black-screen-failed)。

## Windows 7 或 Windows Server 2008 连接后断开

这类系统的 RDP、TLS、NLA 和图形能力较旧，当前客户端组件不保证完整兼容。旧版 FAQ 中“启用禁用字形缓存”的设置已不在当前资产表单中，不应继续按旧路径操作。

建议：

- 将目标系统补丁升级到可用的最高版本。
- 检查目标是否启用 NLA，以及所选安全模式是否兼容。
- 使用较低色彩深度和固定分辨率测试。
- 根据错误码和服务端日志定位；仍失败时优先升级 Windows，而不是长期降低安全校验。

## 域账号认证失败

- 在用户名中只填写实际账号，在资产“域”设置中填写 Windows 域。
- 确认目标主机能够联系域控制器。
- 检查账号是否有“允许通过远程桌面服务登录”的权限。
- 本地账号通常不填域；必要时可按 Windows 环境使用主机名作为域进行测试。

## 剪贴板按钮存在，但不能复制或粘贴

检查资源授权关联的访问策略是否允许复制和粘贴，再检查浏览器剪贴板权限。浏览器无法自动读取系统剪贴板时，使用会话右下角工具菜单中的“剪贴板”面板手动发送文本。

修改策略后重新建立会话。密码等敏感数据不建议通过共享剪贴板传输。

## Windows 中看不到网络驱动器

1. 确认 RDP 资产已启用网络驱动器。
2. 确认选择的共享存储仍然存在；未选择时确认用户有默认存储。
3. 确认访问策略允许需要的文件操作。
4. 完全断开旧会话后重新连接。

文件传输流程参阅 [Windows 文件管理](/zh/docs/usage/rdp#windows-文件管理)。

## RemoteApp 仍打开完整桌面或无法启动

- “远程应用”必须使用 Windows 端发布的别名，并按 `||别名` 填写。
- 检查发布路径、参数和工作目录。
- 确认当前 Windows 账号有权运行该应用。
- 本地 RDP 客户端接入时，重新下载新的 `.rdp` 文件。

## RealVNC 提示认证失败

RealVNC Server 的系统账号密码和 VNC Password 不是同一种认证。请在 **RealVNC Server 端**检查：

1. Authentication 允许使用 VNC Password。
2. 已设置独立的 VNC Password，并将其配置到 Next Terminal 资产。
3. Encryption 选择与代理客户端兼容的模式；`Prefer On` 可用于兼容性测试。
4. 仅在隔离、可信网络中，才考虑启用 “Allow connections from legacy VNC Viewer users”。该选项会降低兼容接入的安全门槛。

不要把 Windows/macOS 系统登录密码直接当作 VNC Password。目标支持更安全的加密认证时，应优先使用安全配置。

## VNC 黑屏或画面尺寸异常

- 确认目标 VNC Server 已经共享正确的桌面或显示会话。
- 检查目标是否处于锁屏、无显示器或没有活动图形会话的状态。
- 在资产显示设置中降低色彩深度、设置固定宽高后测试。
- 检查 VNC Server 日志和 [RDP/VNC 错误码](/zh/docs/usage/error-codes)。
