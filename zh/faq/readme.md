---
layout: doc
title: "常见问题 — Next Terminal"
description: "Next Terminal 开源堡垒机的常见问题 — 部署、资产访问、审计与排障，私有化堡垒机 FAQ。"
head:
  - - meta
    - name: keywords
      content: 常见问题, 堡垒机FAQ, Next Terminal, 开源堡垒机, 跳板机
  - - meta
    - property: og:title
      content: "常见问题 — Next Terminal"
  - - meta
    - property: og:description
      content: "Next Terminal 开源堡垒机的常见问题 — 部署、资产访问、审计与排障，私有化堡垒机 FAQ。"
---

# 常见问题

## 查看密码/密钥需要进行二次认证？

为了安全考虑，查看密码/密钥需要进行二次认证，绑定OTP或Passkey之后即可查看。

## 访问realvnc提示验证失败？

1. 把密码类型修改为VNC
2. 把加密类型修改为 Prefer On
3. 勾选 「Allow connegtions from legacy VNC Viewerusers」

参考 
1. https://help.realvnc.com/hc/en-us/community/posts/7565341003805-Can-t-connect-to-VNC-server-using-Guacamole-client
2. https://help.realvnc.com/hc/en-us/articles/6661259023389-VNC-Password-storage-in-RealVNC-Server


## 连接rdp协议的windows7或者windows server 2008直接断开？

因为freerdp的一个问题导致的，把 设置>RDP 下面的禁用字形缓存打开即可。
详情可参考 https://issues.apache.org/jira/browse/GUACAMOLE-1191

## 使用 SSH RSA 证书无法登录，提示 ssh: no key found

PuTTY 生成的密钥无法直接使用，需要导出后再使用。

## 原生安装如何升级？

下载打包后的压缩文件，替换其中的 next-terminal 文件即可。

## web资产接入grafana不可用

web资产接入grafana后，wss报错且ui显示错误: *origin not allowed*
解决办法:
编辑grafana web资产： Custom Header --> 选中Retain hostname  --> 保存

## 资产状态检测原理是什么？

tcp连接到目标IP和端口进行测试的，默认超时时间是3秒，在计划任务中每隔一个小时检测一次。如果资产状态检测为不在线，可以自行登录next-terminal所在服务器使用telnet进行测试。

## SSH 协议文件管理内容是空的？

SSH 协议会自动使用 SFTP 协议进行文件管理，需要确保 SFTP 服务已经开启。

SFTP 通常作为 SSH 的一个子系统自动启用。你可以通过以下命令确认：

```shell
grep Subsystem /etc/ssh/sshd_config
```
输出中应包含类似以下内容：
```shell
Subsystem sftp /usr/lib/openssh/sftp-server
```
或：
```shell
Subsystem sftp internal-sftp
```
如果该行被注释（以 # 开头）或缺失，说明可能未启用 SFTP 功能。

## 连接 MacOS 中文乱码？

点击编辑资产，打开 `高级设置 > 连接设置`， 在环境变量中添加以下内容：

```shell
LANG=zh_CN.UTF-8
```

## SSH 连接后大概5秒钟就自动断开？网络设备连接后无法输入？

可能是由于SSH连接的存活检测导致，点击编辑资产，打开 `高级设置 > 连接设置`，选中 `连接时禁用存活检查` 即可。

已知必现该问题的系统有：RouterOS，XX 交换机。

## 如何从 Sqlite 迁移到 PostgreSQL？

执行以下命令：
```shell
docker run --rm -it \
  -v ./data/nt.db:/db/nt.db \
  ghcr.io/dimitri/pgloader:latest \
  pgloader "sqlite:///db/nt.db" \
           "pgsql://PG用户名:PG密码@PG主机/PG数据库名"
```

## 如何从 MySQL 迁移到 PostgreSQL？
执行以下命令：
```shell
docker run --rm -it \
  ghcr.io/dimitri/pgloader:latest \
  pgloader "mysql://MYSQL用户名:MYSQL密码@MYSQL主机/MYSQL数据库名" \
           "pgsql://PG用户名:PG密码@PG主机/PG数据库名"

```

## SSH 连接失败？

如果提示信息如下，就代表你的密码或者密钥有问题，请仔细检查。

```shell
ssh:hindshake failed: ssh: unable to authenticate, attempted methds [none],no supported methods remain
```

## Docker 配置 IPv6 太复杂了不会搞怎么办？**

使用双栈 IP 的 Linux 设备作为 SSH 网关或者在该设备上部署安全网关，资产中使用网关作为跳板进行访问。

## WOL 无法唤醒局域网设备？

这是因为容器部署的 NT 和你的资产不在同一个广播域，有下面几种解决方案

1. 更改 NT 的部署方式为原生安装。
2. 更改 docker-compose 的网络模式为 host 模式。
3. 在外部安装一个「安全网关」，资产中使用网关作为跳板进行访问。