---
layout: doc
title: "主备（单活）部署 — Next Terminal"
description: "基于共享 PostgreSQL、共享文件存储和双节点 guacd 部署 Next Terminal 主备系统，并安全执行故障切换、回切和升级。"
head:
  - - meta
    - name: keywords
      content: Next Terminal 主备, 堡垒机高可用, 单活部署, PostgreSQL 高可用, guacd, 故障切换
  - - meta
    - property: og:title
      content: "主备（单活）部署 — Next Terminal"
  - - meta
    - property: og:description
      content: "Next Terminal 双节点单活部署指南：共享依赖、节点配置、流量切换、故障恢复和升级。"
---

# Next Terminal 主备（单活）部署

本文介绍两个 Next Terminal 应用节点的单活部署：正常情况下只运行一个 `next-terminal` 实例，备用节点预先准备相同的镜像、配置和共享依赖；主节点故障后，先隔离原节点，再启动备用节点并切换入口流量。

::: danger 这不是应用内置的自动集群
Next Terminal 当前没有节点选主、分布式锁或自动故障转移配置。定时任务、凭据轮换、备份和部分会话状态由应用实例执行，因此不要直接让两个 `next-terminal` 实例长期同时运行，也不要把两个实例作为普通负载均衡后端轮询。

自动切换必须由外部高可用平台实现，并且必须具备可靠的节点隔离（fencing）。仅移动 VIP 不能阻止原节点继续写数据库或执行任务。
:::

## 1. 先确认适用范围

本方案适用于：

- 希望降低单个 Next Terminal 应用节点故障造成的停机时间。
- 可以提供独立于两个应用节点的 PostgreSQL 和共享文件存储。
- 可以接受故障时已有 SSH、RDP、VNC 和 Telnet 会话中断，用户重新连接。
- 由运维人员手工切换，或者已有能够执行隔离、启动和流量切换的外部平台。

本方案本身不能解决以下单点：

- 单实例 PostgreSQL。
- 单实例 NFS、NAS、S3 或 WebDAV。
- 单台反向代理或负载均衡器。
- 单一交换机、电源、机房或 DNS 服务。

如果只部署两台应用服务器但数据库和存储仍是单实例，得到的是“应用节点主备”，不是端到端高可用。

## 2. 架构与职责

```text
                          ┌──────────────────────────┐
用户 ── HTTPS / TCP ─────▶│ 统一入口 / 负载均衡 / VIP │
                          └─────────────┬────────────┘
                                        │ 只指向当前活动节点
                         ┌──────────────┴──────────────┐
                         │                             │
              ┌──────────▼──────────┐      ┌───────────▼─────────┐
              │ 节点 A（活动）       │      │ 节点 B（备用）        │
              │ next-terminal：运行 │      │ next-terminal：停止  │
              │ guacd：运行         │      │ guacd：运行          │
              └──────────┬──────────┘      └───────────┬─────────┘
                         │                             │
                         └──────────────┬──────────────┘
                                        │
                  ┌─────────────────────┼─────────────────────┐
                  │                     │                     │
          ┌───────▼────────┐   ┌────────▼────────┐   ┌────────▼────────┐
          │ PostgreSQL      │   │ 共享文件系统     │   │ S3 / WebDAV     │
          │ 读写端点         │   │ drive/本地录像   │   │ 可选录像存储     │
          └────────────────┘   └─────────────────┘   └─────────────────┘
```

各层职责如下：

| 层级 | 作用 | 主备部署要求 |
| --- | --- | --- |
| Next Terminal | Web 管理、SSH 接入、会话与任务 | 同一时刻只运行一个应用实例 |
| guacd | RDP/VNC 图形协议代理 | 两个节点均可常驻运行；活动应用使用本机 guacd |
| PostgreSQL | 用户、资产、授权、日志和系统配置 | 两节点连接同一个可写端点；数据库高可用由数据库平台负责 |
| 共享文件系统 | Windows 映射盘和本地录像 | 两节点挂载到相同容器路径；必须先挂载再启动应用和 guacd |
| S3/WebDAV | 可选的外部录像存储 | 服务本身需要独立的可用性和备份设计 |
| 统一入口 | Web、SSH 代理及其他公开端口 | 仅转发到活动节点；切换时同步更新所有入口 |

## 3. 源码支持边界

部署设计应遵循当前配置模型：

- `App.Guacd.Hosts` 支持配置多个 guacd 地址和权重，但当前选择方式是按权重选择，不是健康检查或自动摘除。本文让每个应用节点通过 Compose 服务名 `guacd` 使用本机实例，避免把失效节点继续选入。
- `App.Recording.Type` 支持 `local` 和 `s3`；WebDAV 可在系统页面中配置。
- `App.Guacd.Drive` 是文件系统目录，不是对象存储地址。Windows 映射盘不能通过把该字段改成 S3 来共享。
- 应用没有主备角色、节点 ID、选主或分布式任务锁配置。主备状态由部署平台控制。
- 发布镜像同时提供 AMD64/ARM64，并提供 PostgreSQL 16 与 PostgreSQL 18 client 变体。应用镜像中 PostgreSQL client 的主版本必须与服务端匹配。

## 4. 准备环境

以下占位符需要替换为实际值：

```text
节点 A：<NODE_A_IP>
节点 B：<NODE_B_IP>
PostgreSQL 读写端点：<PG_HOST>:<PG_PORT>
共享文件系统：<NFS_HOST>:<NFS_PATH>
统一访问域名：<DOMAIN>
Next Terminal 版本：<VERSION>，例如 v3.x.y
```

两台节点应满足：

1. CPU 架构受所选镜像支持，并安装相同版本的 Docker Engine 和 Compose。
2. 系统时间同步，时区一致。
3. 能访问 PostgreSQL 读写端点、目标资产和对象存储。
4. 使用相同的 `config.yaml`，数据库密码等秘密通过权限受限的文件或秘密管理系统分发。
5. 共享目录在两台节点上使用相同的宿主机路径和容器路径。
6. 防火墙只开放实际使用的入口，并限制 PostgreSQL、NFS 和 `4822` 等内部端口的来源。

::: warning 固定版本，不要让两个节点漂移
生产环境建议使用明确版本标签，例如 `dushixiang/next-terminal:<VERSION>`。不要让主备节点分别运行不同版本，也不要在未验证时仅依赖 `latest`。
:::

## 5. 准备 PostgreSQL

两个应用节点必须连接同一个 PostgreSQL 读写端点。可以使用云数据库的主备端点，或自行维护的 PostgreSQL 高可用集群；Next Terminal 不负责数据库复制、选主和故障恢复。

按数据库主版本选择应用镜像：

| PostgreSQL 服务端 | Next Terminal 镜像标签 |
| --- | --- |
| PostgreSQL 16 | `dushixiang/next-terminal:<VERSION>` |
| PostgreSQL 18 | `dushixiang/next-terminal:<VERSION>-pg18` |

迁移数据库主版本不能只替换镜像。需要迁移时参阅 [PostgreSQL 16 迁移到 18](/zh/docs/install/postgresql-16-to-18)。

从两个应用节点分别验证连接：

```shell
nc -vz <PG_HOST> <PG_PORT>
```

不要在本文的两个节点上各自运行一套独立 PostgreSQL，否则切换后会看到不同的数据。

## 6. 准备共享文件存储

即使录像使用 S3 或 WebDAV，Windows 网络驱动器仍需要共享文件系统。本文示例将 NFS 挂载到两台节点相同的 `/opt/next-terminal/data`：

```shell
mkdir -p /opt/next-terminal/data /opt/next-terminal/logs
mount -t nfs <NFS_HOST>:<NFS_PATH> /opt/next-terminal/data
mountpoint /opt/next-terminal/data
```

按照存储服务要求配置 `/etc/fstab`，并包含 `_netdev` 等适合当前环境的参数。不要直接复制未经存储厂商验证的 NFS 超时参数。

启动服务前必须确认挂载存在：

```shell
mountpoint -q /opt/next-terminal/data
test -w /opt/next-terminal/data
```

::: danger 防止写入宿主机空目录
如果 NFS 挂载失败但 Compose 仍启动，容器可能把录像或映射盘文件写入本地空目录。应由 systemd、部署脚本或外部平台把“共享目录已挂载且可写”设置为启动前置条件。
:::

目录用途：

```text
/opt/next-terminal/data/drive       Windows 映射盘文件
/opt/next-terminal/data/recordings  Type=local 时的会话录像
/opt/next-terminal/logs             当前节点自己的运行日志，不需要共享
```

使用 S3 录像可以减少共享文件系统上的录像容量和吞吐压力，但不会替代 `drive` 目录。

## 7. 两个节点使用同一份配置

在两台节点创建 `/opt/next-terminal/config.yaml`。以下只列出主备部署相关字段：

```yaml
Database:
  Enabled: true
  Type: postgres
  Postgres:
    Hostname: <PG_HOST>
    Port: <PG_PORT>
    Username: next-terminal
    Password: <PG_PASSWORD>
    Database: next-terminal
  ShowSql: false

log:
  Level: info
  Filename: /usr/local/next-terminal/logs/nt.log

Server:
  Addr: "0.0.0.0:8088"

App:
  Website:
    AccessLog: /usr/local/next-terminal/logs/access.log
  Guacd:
    Drive: /usr/local/next-terminal/data/drive
    Hosts:
      - Hostname: guacd
        Port: 4822
        Weight: 1
  Recording:
    Type: local
    Path: /usr/local/next-terminal/data/recordings
  ReverseProxy:
    SelfProxyEnabled: false
    Root: "https://<DOMAIN>"
```

如果使用 S3 录像，将 `Recording` 改成与当前版本配置示例一致的 S3 参数：

```yaml
  Recording:
    Type: s3
    Path: /usr/local/next-terminal/data/recordings
    S3:
      Endpoint: <S3_ENDPOINT>
      Region: <S3_REGION>
      AccessKeyId: <S3_ACCESS_KEY_ID>
      SecretAccessKey: <S3_SECRET_ACCESS_KEY>
      Bucket: <S3_BUCKET>
      UseSSL: true
      PathStyle: false
```

`Path` 仍是录像生成、转换或上传过程可能使用的本地/共享路径，不应因为启用 S3 就移除共享目录。

完整字段说明参阅 [`config.yaml` 配置参考](/zh/docs/install/config-desc)。在两个节点检查文件内容一致：

```shell
sha256sum /opt/next-terminal/config.yaml
```

## 8. 两个节点使用同一份 Compose

在两台节点创建 `/opt/next-terminal/docker-compose.yaml`：

```yaml
services:
  guacd:
    image: dushixiang/guacd:1.6.0
    restart: unless-stopped
    volumes:
      - ./data:/usr/local/next-terminal/data

  next-terminal:
    image: dushixiang/next-terminal:<VERSION>
    restart: unless-stopped
    ports:
      - "8088:8088"
      - "2022:2022"
    volumes:
      - /etc/localtime:/etc/localtime:ro
      - ./data:/usr/local/next-terminal/data
      - ./logs:/usr/local/next-terminal/logs
      - ./config.yaml:/etc/next-terminal/config.yaml:ro
    depends_on:
      - guacd
```

PostgreSQL 18 环境将应用镜像改成 `dushixiang/next-terminal:<VERSION>-pg18`。中国大陆镜像可以保留相同标签并使用项目提供的阿里云仓库地址。

这里不在每个节点部署 PostgreSQL 或 MinIO。把开发用 Compose 中的单实例 PostgreSQL/MinIO 复制到两台机器，不会形成共享数据库或高可用对象存储。

## 9. 首次启动

先在两个节点只启动 guacd：

```shell
cd /opt/next-terminal
mountpoint -q ./data
docker compose pull
docker compose up -d guacd
docker compose ps
```

选择节点 A 作为初始活动节点，只在节点 A 启动应用：

```shell
cd /opt/next-terminal
docker compose up -d next-terminal
docker compose ps
docker compose exec next-terminal nt status
curl -fsS -o /dev/null http://127.0.0.1:8088/login
```

节点 B 不执行 `docker compose up -d next-terminal`。通过下面的命令确认没有备用应用容器在运行：

```shell
docker compose ps next-terminal
```

## 10. 配置统一入口

Web 管理和浏览器会话需要支持长连接与 WebSocket。下面的 Nginx 示例只指向当前活动节点：

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

upstream next_terminal_active {
    server <NODE_A_IP>:8088;
}

server {
    listen 443 ssl;
    server_name <DOMAIN>;

    # ssl_certificate 和 ssl_certificate_key 按实际证书配置
    client_max_body_size 100m;

    location / {
        proxy_pass http://next_terminal_active;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}
```

真实客户端 IP 的信任范围参阅[获取真实 IP](/zh/docs/install/real-ip)。不要把 `IpTrustList` 无条件设置成 `0.0.0.0/0`。

如果启用了 SSH 代理服务器的 `2022` 端口、RDP 代理或其他 TCP 入口，需要在四层负载均衡、VIP 或 DNS 中同步指向活动节点。Nginx 的 HTTP `upstream` 不会自动代理这些 TCP 服务。

::: warning 不要依赖 `backup` 参数制造应用集群
把节点 B 写成 Nginx `backup` 后端只能改变 HTTP 流量方向，不能启动备用应用、隔离原节点、检查共享存储或避免双活。本文不使用这种配置作为故障转移方案。
:::

## 11. 上线前验证

先绕过统一入口访问节点 A，再通过正式域名访问。至少验证：

1. 管理员和普通用户均可登录，授权结果一致。
2. SSH 终端和 SSH 文件系统正常。
3. RDP/VNC 可以建立会话，剪贴板和分辨率正常。
4. Windows 中能看到映射盘，并能从浏览器侧查看同一文件。
5. 会话结束后可以查询和回放录像。
6. Web 资产、数据库代理、SSH 代理等已启用入口均正常。
7. 备份任务可以生成备份，并已保存到应用节点之外。
8. 节点 B 的 guacd 正常，但 `next-terminal` 未运行。

<!-- TODO(image): 补充系统监控页面和一次完整会话回放的验证截图。 -->

## 12. 故障切换：A 切换到 B

切换顺序必须是“隔离旧节点 → 检查共享依赖 → 启动新节点 → 切换流量”。

### 12.1 隔离节点 A

如果节点 A 仍可登录，停止应用：

```shell
cd /opt/next-terminal
docker compose stop next-terminal
docker compose ps next-terminal
```

如果节点 A 失联，先通过虚拟化平台、云平台、安全组、交换机或电源管理确认它不能继续对外服务和访问共享依赖。无法确认隔离状态时，不应直接启动节点 B，否则可能形成双活。

### 12.2 在节点 B 检查前置条件

```shell
cd /opt/next-terminal
mountpoint -q ./data
test -w ./data
nc -vz <PG_HOST> <PG_PORT>
sha256sum config.yaml
docker compose images
docker compose ps guacd
```

确认配置校验值、镜像版本和节点 A 上线前的记录一致。

### 12.3 启动节点 B

```shell
docker compose up -d next-terminal
docker compose exec next-terminal nt status
curl -fsS -o /dev/null http://127.0.0.1:8088/login
docker compose logs --tail=100 next-terminal guacd
```

### 12.4 切换全部入口

将 HTTPS 后端从 `<NODE_A_IP>:8088` 改成 `<NODE_B_IP>:8088`，校验并重载代理配置。然后同步切换 `2022` 和其他已启用的 TCP 入口。

### 12.5 验证业务

重新执行上线前验证中的登录、授权、SSH、RDP/VNC、文件和录像检查。原节点上的存量会话不会迁移到新节点，用户需要重新连接。

记录故障时间、隔离时间、恢复时间、数据丢失范围和实际 RTO/RPO。

## 13. 回切：B 切换到 A

回切不是简单地重新启动节点 A。先修复节点 A，并同步配置和镜像；然后按照相同顺序操作：

1. 确认节点 A 能访问共享存储和 PostgreSQL。
2. 停止并确认节点 B 的 `next-terminal` 不再运行。
3. 启动节点 A 的 `next-terminal` 并在本机验证。
4. 把 Web 和所有 TCP 入口切回节点 A。
5. 执行业务验证并记录结果。

不要为了减少切换时间而短暂保留两个应用实例同时运行。

## 14. 自动故障转移的最低要求

可以使用 Pacemaker、云主机高可用编排、虚拟化平台或其他外部系统自动执行本文流程，但自动化至少需要具备：

1. **隔离能力**：确认原活动节点已关机、断网，或已失去数据库/共享存储写权限。
2. **依赖检查**：PostgreSQL 读写端点、共享目录和本机 guacd 全部可用。
3. **单活约束**：任何情况下最多允许一个 `next-terminal` 实例运行。
4. **入口切换**：同时更新 Web、SSH、RDP 代理及实际启用的其他端口。
5. **失败回退**：新节点启动或验证失败时停止继续切流，并发出告警。
6. **审计记录**：保存触发原因、隔离结果、命令输出和切换时间。

Keepalived 只负责 VIP 选举，不等于完成以上流程。如果使用 Keepalived，仍需要经过验证的通知脚本或资源管理器负责应用启停与 fencing；不要使用未经演练的脚本直接接管生产系统。

## 15. 升级主备节点

发布流水线会为同一版本构建 AMD64/ARM64 镜像，并分别发布 PostgreSQL 16 和 PostgreSQL 18 client 标签。升级时必须保持节点和数据库版本组合一致。

推荐流程：

1. 按[系统备份与恢复](/zh/docs/usage/backup)创建并下载备份，同时备份 `drive`、本地录像和 `config.yaml`。
2. 阅读目标版本发布说明，确认数据库迁移和回滚限制。
3. 在备用节点拉取明确的目标版本，但不启动应用。
4. 安排维护窗口，隔离活动节点后按照故障切换流程启动备用节点。
5. 完成全量业务验证，再更新原节点镜像和配置。
6. 保留上一版本信息和备份，直到观察期结束。

::: danger 数据库迁移可能阻止直接回滚
新版本首次启动可能修改数据库结构。即使旧镜像仍在，也不代表可以直接切回旧版本。回滚前必须确认目标版本的迁移兼容性，并准备经过验证的数据库恢复方案。
:::

## 16. 监控与演练

建议至少监控：

- 统一入口和当前活动节点的 HTTP 可用性。
- PostgreSQL 连接、复制状态和可写端点。
- 共享目录的挂载状态、可写性、容量和延迟。
- guacd 端口、RDP/VNC 建连成功率。
- S3/WebDAV 可用性、上传失败和积压。
- `next-terminal`、guacd、代理和系统日志。
- 主备状态以及是否意外出现两个应用实例。

每次版本升级或基础设施变更后至少进行一次切换演练。演练应覆盖：

1. 正常停止活动节点后的计划切换。
2. 活动节点不可登录时的 fencing。
3. PostgreSQL 或共享存储不可用时禁止提升备用节点。
4. Web 和 TCP 入口同步切换。
5. 用户重新连接、文件访问和录像回放。
6. 回切和失败回退。

## 17. 最终检查清单

- [ ] 两个节点使用相同的明确版本标签和 `config.yaml`。
- [ ] PostgreSQL client 主版本与服务端一致。
- [ ] 两个节点连接同一个 PostgreSQL 读写端点。
- [ ] `data` 在两个节点挂载到相同路径，且启动前检查挂载状态。
- [ ] `drive` 使用共享文件系统；没有误配置为 S3 地址。
- [ ] S3/WebDAV 或共享文件系统自身具备备份和可用性方案。
- [ ] 正常情况下只有一个 `next-terminal` 实例运行。
- [ ] 两个节点的 guacd 均可用，活动应用通过本机 `guacd` 访问。
- [ ] Web、SSH 和其他 TCP 入口都能切换到同一活动节点。
- [ ] 已建立可靠的旧节点隔离流程。
- [ ] 已完成一次切换、业务验证和回切演练。
- [ ] 已记录 RTO、RPO、负责人和回滚条件。
