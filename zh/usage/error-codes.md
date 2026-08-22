---
layout: doc
title: "RDP/VNC 错误码说明 — Next Terminal"
description: "Next Terminal 堡垒机的 RDP/VNC 错误码对照 — 远程桌面与虚拟网络计算排障参考。"
head:
  - - meta
    - name: keywords
      content: RDP错误, VNC错误, 排障, 堡垒机, Next Terminal
  - - meta
    - property: og:title
      content: "RDP/VNC 错误码说明 — Next Terminal"
  - - meta
    - property: og:description
      content: "Next Terminal 堡垒机的 RDP/VNC 错误码对照 — 远程桌面与虚拟网络计算排障参考。"
---

# RDP/VNC 错误码说明

在使用 RDP 和 VNC 协议连接远程桌面时，可能会遇到各种错误。本文档列出了常见的错误状态码及其含义，帮助您快速诊断和解决连接问题。

## 状态码说明

Next Terminal 使用一套通用的数字状态码来表示操作的成功或失败状态。这些状态码可以帮助用户界面以人性化的方式显示错误信息。

### 成功状态

#### 0 (SUCCESS)
操作成功完成，没有错误。

### 不支持的操作

#### 256 (UNSUPPORTED)
请求的操作不被支持。

### 服务器错误

#### 512 (SERVER_ERROR)
发生内部错误，操作无法执行。

#### 513 (SERVER_BUSY)
由于服务器繁忙，操作无法执行。

#### 514 (UPSTREAM_TIMEOUT)
上游服务器没有响应。

#### 515 (UPSTREAM_ERROR)
上游服务器遇到错误。

### 资源相关错误

#### 516 (RESOURCE_NOT_FOUND)
找不到相关资源（如文件或数据流），因此操作失败。

#### 517 (RESOURCE_CONFLICT)
资源已被使用或锁定，阻止了请求的操作。

#### 518 (RESOURCE_CLOSED)
由于相关资源已关闭，请求的操作无法继续。

### 上游服务器连接错误

#### 519 (UPSTREAM_NOT_FOUND)
上游服务器似乎不存在，或无法通过网络访问。

#### 520 (UPSTREAM_UNAVAILABLE)
上游服务器拒绝服务连接。

### 会话相关错误

#### 521 (SESSION_CONFLICT)
上游服务器中的会话已结束，因为它与另一个会话冲突。

#### 522 (SESSION_TIMEOUT)
上游服务器中的会话已结束，因为它看起来处于非活动状态。

#### 523 (SESSION_CLOSED)
上游服务器中的会话已被强制关闭。

### 客户端错误

#### 768 (CLIENT_BAD_REQUEST)
请求的参数是非法的或无效的。

#### 769 (CLIENT_UNAUTHORIZED)
权限被拒绝，因为用户未登录。请注意，用户可能已登录到 Next Terminal，但仍未登录到远程桌面服务器。

#### 771 (CLIENT_FORBIDDEN)
权限被拒绝，登录也无法解决问题。

#### 776 (CLIENT_TIMEOUT)
客户端（通常是 Next Terminal 用户或其浏览器）响应时间过长。

#### 781 (CLIENT_OVERRUN)
客户端发送的数据超过了协议允许的范围。

#### 783 (CLIENT_BAD_TYPE)
客户端发送了意外或非法类型的数据。

#### 797 (CLIENT_TOO_MANY)
客户端已经使用了太多资源。在允许进一步请求之前，必须释放现有资源。

## 常见问题排查

### 连接超时问题
- **错误码 514, 522**: 检查网络连接，确认远程桌面服务器是否正常运行
- **错误码 776**: 检查客户端网络状况，尝试刷新页面重新连接

### 认证问题
- **错误码 769**: 确认用户名和密码是否正确
- **错误码 771**: 检查用户权限设置，确认是否有远程桌面访问权限

### 服务器问题
- **错误码 519, 520**: 检查远程桌面服务器地址和端口是否正确
- **错误码 513**: 等待服务器负载降低后重试

### 会话冲突
- **错误码 521**: 检查是否有其他用户正在使用同一账户连接
- **错误码 523**: 联系管理员检查服务器端会话管理设置

如果遇到其他未列出的错误码，请联系系统管理员或查看服务器日志获取更详细的错误信息。