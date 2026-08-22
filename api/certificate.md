---
layout: doc
title: "Certificate Management API — Next Terminal"
description: "Certificate Management API for Next Terminal open source bastion host — mTLS and HTTPS certificate lifecycle for Web assets behind reverse proxy."
head:
  - - meta
    - name: keywords
      content: certificate API, mTLS, bastion host API, Next Terminal, open source bastion
  - - meta
    - property: og:title
      content: "Certificate Management API — Next Terminal"
  - - meta
    - property: og:description
      content: "Certificate Management API for Next Terminal open source bastion host — mTLS and HTTPS certificate lifecycle for Web assets behind reverse proxy."
---

# Certificate Management API

## Update Certificate

Update or create SSL/TLS certificate configuration.

### Request

- **Method**: `PUT`
- **Path**: `/api/admin/certificates/upsert`
- **Content-Type**: `application/json`

### Parameters

| Name | Type | Required | Description |
|--------|------|------|-----------|
| commonName | string | Yes | Certificate common name (CN) |
| type | string | Yes | Certificate type: `self-signed`, `issued`, `imported` |
| certificate | string | Yes | Certificate content (PEM) |
| privateKey | string | Yes | Private key content (PEM) |
| renewBefore | number | Yes | Renew in advance (days). Effective only when `type` is `issued` |

### Certificate Types

- **self-signed**: self-signed certificate
- **issued**: CA-issued certificate (supports auto renewal)
- **imported**: imported certificate (certificate content or local file path)

### Request Example

```json
{
  "commonName": "example.com",
  "type": "imported",
  "certificate": "-----BEGIN CERTIFICATE-----\nMIID...\n-----END CERTIFICATE-----",
  "privateKey": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----",
  "renewBefore": 2592000
}
```

### Response

#### Success

- **HTTP status**: `200`
- **Body**: empty or success message

#### Failure

- **HTTP status**: non-`200` (for example `400`, `500`)
- **Body**:

```json
{
  "message": "error message"
}
```
