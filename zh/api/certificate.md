---
layout: doc
title: "证书管理 API — Next Terminal"
description: "Next Terminal 开源堡垒机的证书管理 API — 反向代理后 Web 资产的 mTLS 与 HTTPS 证书生命周期管理。"
head:
  - - meta
    - name: keywords
      content: 证书管理, mTLS, 堡垒机API, Next Terminal, 开源堡垒机
  - - meta
    - property: og:title
      content: "证书管理 API — Next Terminal"
  - - meta
    - property: og:description
      content: "Next Terminal 开源堡垒机的证书管理 API — 反向代理后 Web 资产的 mTLS 与 HTTPS 证书生命周期管理。"
---

# 证书管理 API

## 更新证书

更新或创建 SSL/TLS 证书配置。

### 请求信息

- **请求方法**: `PUT`
- **请求路径**: `/api/admin/certificates/upsert`
- **Content-Type**: `application/json`

### 请求参数

| 参数名 | 类型 | 必填 | 说明                                                        |
|--------|------|------|-----------------------------------------------------------|
| commonName | string | 是 | 证书通用名称（CN）                                                |
| type | string | 是 | 证书类型，可选值：`self-signed`（自签名）、`issued`（自动申请）、`imported`（导入） |
| certificate | string | 是 | 证书内容（PEM 格式）                                              |
| privateKey | string | 是 | 私钥内容（PEM 格式）                                              |
| renewBefore | number | 是 | 续签证书提前时间（天），仅在 `type` 为 `issued` 时生效                      |

### 证书类型说明

- **self-signed**: 自签名证书
- **issued**: 已颁发的证书（由 CA 机构颁发，支持自动续签）
- **imported**: 导入的证书（支持导入证书内容或本地文件路径）

### 请求示例

```json
{
  "commonName": "example.com",
  "type": "imported",
  "certificate": "-----BEGIN CERTIFICATE-----\nMIID...\n-----END CERTIFICATE-----",
  "privateKey": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----",
  "renewBefore": 2592000
}
```

### 响应说明

#### 成功响应

- **HTTP 状态码**: `200`
- **响应体**: 无或成功信息

#### 失败响应

- **HTTP 状态码**: 非 `200`（如 `400`、`500` 等）
- **响应体**:

```json
{
  "message": "错误信息描述"
}
```
