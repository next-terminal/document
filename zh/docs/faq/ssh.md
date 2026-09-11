---
layout: doc
title: "SSH 连接问题 — Next Terminal"
description: "排查 Next Terminal SSH 密码与私钥认证、PuTTY 密钥、频繁断开、终端乱码和退格键问题。"
---

# SSH 连接问题

正常配置流程参阅 [SSH 资产](/zh/docs/usage/ssh)。本页只处理连接和终端异常。

## 提示 `unable to authenticate` 或 `no supported methods remain`

这表示 SSH 服务已经响应，但 Next Terminal 没有使用目标主机接受的方式完成认证。依次检查：

1. 资产用户名是否正确。
2. 账户类型是否选择了密码、私钥或正确的授权凭证。
3. 密码是否已经轮换。
4. 私钥是否为 OpenSSH 可识别的格式，Passphrase 是否正确。
5. 对应公钥是否已加入目标账号的 `authorized_keys`。
6. 目标 `sshd_config` 是否允许密码或公钥认证。

修改后先在 Next Terminal 服务端或同一网关网络使用等价账号测试，再建立新会话。

## PuTTY 生成的私钥提示 `ssh: no key found`

`.ppk` 不能保证可被当前 SSH 库直接解析。使用 PuTTYgen 打开私钥，导出为 OpenSSH 私钥格式，再粘贴到资产或授权凭证中。不要上传公钥文件代替私钥。

## 连接约 5 秒后断开，或网络设备连接后无法输入

部分 RouterOS、交换机等设备不支持会话存活检测。

编辑 SSH 资产，打开「终端设置」，关闭「存活检查」，保存后重新连接。关闭后系统无法通过该机制及时发现死连接，只对存在兼容问题的资产单独关闭。

## macOS 或其他 Unix 系统中文乱码

先确认目标系统已经安装对应 Locale：

```shell
locale -a
```

然后编辑 SSH 资产，在「终端设置 > 环境变量」中加入目标实际支持的 Locale，例如：

```text
LANG=zh_CN.UTF-8
```

如果目标只提供 `en_US.UTF-8` 或 `C.UTF-8`，应使用已安装的值。修改后重新建立会话。

## Backspace 变成 `^H`、`^?` 或无法删除

编辑 SSH 资产，在「终端设置」中将 Backspace 模式在 `DEL` 和 `BS` 之间切换，然后重新连接。不同设备的终端实现可能要求不同模式。

## SSH 代理服务器直连时找不到资产

- 优先使用资产“别名”，不要依赖可能包含空格或中文的展示名称。
- 别名必须以英文字母开头，只能包含英文、数字、下划线和中划线。
- 确认当前用户已获得该资产授权。
- 确认资产协议为 SSH，SSH 代理服务器已经启用。

直连格式参阅 [SSH 代理服务器](/zh/docs/usage/ssh-server)。

## 连接超时

超时通常发生在认证之前。检查实际连接路径：

```text
Next Terminal → 网关链（如有）→ 目标 SSH 地址和端口
```

从最后一级网关所在网络测试端口；不要只从用户电脑测试。目标确实响应较慢时，再增加资产“连接超时”。
