# 配置文件详解 (`config.yaml`)

本文档详细说明了 Next Terminal 的 `config.yaml` 配置文件中的各项参数，以帮助您更好地完成自定义配置。

::: tip 相关文档
- [Web 资产（反向代理）使用指南](../usage/website)
:::

---

## `Database` - 数据库配置

此部分用于配置 Next Terminal 的数据存储。

```yaml
Database:
  Enabled: true
  Type: postgres
  URL: ""
  Postgres:
    Hostname: localhost
    Port: 5432
    Username: next-terminal
    Password: next-terminal
    Database: next-terminal
  ShowSql: false
```

-   **`Enabled`**: 是否启用数据库，默认为 `true`。
-   **`Type`**: 数据库类型，目前仅支持 `postgres`。
-   **`URL`**: 数据库连接 URL。配置后会优先使用该参数连接数据库；为空时使用下方 `Postgres` 分项配置。例如：`postgres://next-terminal:next-terminal@localhost:5432/next-terminal?sslmode=disable`。
-   **`Postgres`**: PostgreSQL 数据库的连接参数。
    -   **`Hostname`**: 主机地址。
    -   **`Port`**: 端口。
    -   **`Username`**: 用户名。
    -   **`Password`**: 密码。
    -   **`Database`**: 数据库名称。
-   **`ShowSql`**: 是否在日志中打印执行的 SQL 语句，用于调试，默认为 `false`。

---

## `Log` - 日志配置

管理系统的日志输出。

```yaml
Log:
  Level: debug # 日志等级  debug,info,waring,error
  Filename: ./logs/nt.log
```

-   **`Level`**: 日志记录的级别，可选值：`debug`, `info`, `warning`, `error`。
-   **`Filename`**: 日志文件的存储路径。

---

## `Server` - 服务配置

Next Terminal Web 服务本身的核心配置。

```yaml
Server:
  Addr: "0.0.0.0:8088"
```

-   **`Addr`**: Web 管理界面的监听地址和端口。

---

## `App` - 核心应用配置

包含多项核心功能的详细配置。

### `Website`

-   **`AccessLog`**: Web 资产的访问日志路径。
    ```yaml
    Website:
      AccessLog: "./logs/access.log"
    ```

### `Recording` - 会话录像

配置 SSH、RDP 等会话录像的存储方式。

```yaml
Recording:
  Type: "local" # 录屏文件存储位置，可选 local, s3
  Path: "/usr/local/next-terminal/data/recordings"
#    S3:
#      Endpoint: "127.0.0.1:9000"
#      AccessKeyId: minioadmin
#      SecretAccessKey: miniopassword
#      Bucket: recording
#      UseSSL: false
```

-   **`Type`**: 录像存储类型。
    -   `local`: 存储在本地文件系统。
    -   `s3`: 存储在兼容 S3 协议的对象存储服务中（如 MinIO、阿里云 OSS 等）。
-   **`Path`**: 当 `Type` 为 `local` 时，指定录像文件的存储目录，此配置不能删除，`Type` 为 `s3` 时需要在此目录先临时存储，会话结束后上传至 S3。
-   **`S3`**: 当 `Type` 为 `s3` 时，配置 S3 服务的连接参数。

### `Guacd` - Guacamole 服务

配置 Guacamole Server 的连接信息，它是 RDP、VNC 等图形化协议的核心组件。

```yaml
Guacd:
  Drive: "/usr/local/next-terminal/data/drive"
  Hosts:
    - Hostname: guacd
      Port: 4822
      Weight: 1
```

-   **`Drive`**: Guacd 的虚拟云盘路径，用于 RDP 文件传输等功能。
-   **`Hosts`**: Guacd 服务实例列表，支持配置多个实例以实现负载均衡。
    -   **`Hostname`**: Guacd 服务的主机名或 IP。
    -   **`Port`**: Guacd 服务的端口，默认为 `4822`。
    -   **`Weight`**: 负载均衡权重。

### `ReverseProxy` - 反向代理

用于启用和配置 Web 资产反向代理功能。

```yaml
ReverseProxy:
  Enabled: true
  HttpEnabled: true
  HttpAddr: ":80"
  HttpRedirectToHttps: true
  HttpsEnabled: true
  HttpsAddr: ":443"
  SelfProxyEnabled: true
  SelfDomain: "nt.example.com"
  Root: ""
  IpExtractor: "direct"
  IpTrustList: []
  MTLSClientCertAuthMode: "strict"
```

-   **`Enabled`**: 是否启用反向代理功能。
-   **`HttpEnabled`**: 是否启用 HTTP 监听。
-   **`HttpAddr`**: HTTP 监听地址和端口。
-   **`HttpRedirectToHttps`**: 是否将所有 HTTP 请求强制重定向到 HTTPS。
-   **`HttpsEnabled`**: 是否启用 HTTPS 监听。
-   **`HttpsAddr`**: HTTPS 监听地址和端口。
-   **`SelfProxyEnabled`**, **`SelfDomain`**, **`Root`**: 这三个参数共同决定了用户访问受保护网站时的认证跳转逻辑。详细用法请参考 [Web 资产使用指南](../usage/website#selfproxyenabled、selfdomain-和-root-详解)。
-   **`IpExtractor`** / **`IpTrustList`**: 用于识别访问 Web 资产的真实客户端 IP。`IpExtractor` 可选 `direct`、`x-forwarded-for`、`x-real-ip`；`IpTrustList` 是可信代理 IP 或网段列表（CIDR），留空使用默认信任的内网网段。完整使用方法请参考 [获取真实客户端 IP](./real-ip)。

    ::: warning ⚠ 这两个字段只影响 Web 资产
    `IpExtractor` 和 `IpTrustList` **只影响 Web 资产内置反向代理**的真实 IP 识别（访问日志、临时白名单、公开访问 IP 策略等）。

    NextTerminal **管理后台**（登录日志、登录 IP 锁定、安全审计等）的真实 IP 不在 `config.yaml` 中配置，需要在 **后台 → 系统设置 → 网络设置** 单独设置。
    :::

-   **`MTLSClientCertAuthMode`** 客户端证书认证模式：strict / ca_only v3.2.0 版本默认支持
    - `strict` 校验客户端的指纹和证书有效期
    - `ca_only` 只校验是否为同一个 CA 签发
