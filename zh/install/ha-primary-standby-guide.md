---
layout: doc
title: "主备高可用部署 — Next Terminal"
description: "Next Terminal 开源堡垒机主备高可用部署指南 — PostgreSQL 主从、故障切换与 real-ip 处理，保障堡垒机高可用。"
head:
  - - meta
    - name: keywords
      content: 堡垒机高可用, 主备部署, 高可用, Next Terminal 高可用, 开源堡垒机
  - - meta
    - property: og:title
      content: "主备高可用部署 — Next Terminal"
  - - meta
    - property: og:description
      content: "Next Terminal 开源堡垒机主备高可用部署指南 — PostgreSQL 主从、故障切换与 real-ip 处理，保障堡垒机高可用。"
---

# Next Terminal 主备部署操作文档

## 1. 架构

### 单机架构

```text
用户
  |
  v
Nginx / 域名
  |
  v
next-terminal + guacd + postgresql
```

### 主备架构

```text
                 +-------------------+
用户 -> Nginx -> | 主节点 A            |
                 | next-terminal     |
                 | guacd             |
                 +-------------------+
                          |
                          | 切换
                          v
                 +-------------------+
                 | 备用节点 B         |
                 | next-terminal     |
                 | guacd             |
                 +-------------------+

主节点 A 和备用节点 B 共用：
- PostgreSQL
- data 目录
```

## 2. 环境示例

```text
主节点 A: <PRIMARY_IP>
备用节点 B: <STANDBY_IP>
PostgreSQL: <PG_HOST>:<PG_PORT>
Nginx: <NGINX_IP>
共享存储: <NFS_HOST>:<NFS_PATH>
域名: <DOMAIN>
```

## 3. 准备目录

```bash
mkdir -p /opt/next-terminal
cd /opt/next-terminal
mkdir -p data logs
```

## 4. 挂载共享存储

```bash
mount -t nfs <NFS_HOST>:<NFS_PATH> /opt/next-terminal/data
df -h | grep /opt/next-terminal/data
```

如需开机自动挂载，在 `/etc/fstab` 增加：

```txt
<NFS_HOST>:<NFS_PATH> /opt/next-terminal/data nfs defaults,_netdev 0 0
```

## 5. 下载安装文件

```bash
cd /opt/next-terminal
curl -sSL https://f.next-terminal.com/next-terminal/docker-compose-aliyun.yaml > docker-compose.yaml
curl -sSL https://f.next-terminal.com/next-terminal/config.yaml > config.yaml
```

## 6. 修改 `docker-compose.yaml`

`docker-compose.yaml`：

```yaml
services:
  guacd:
    container_name: guacd
    image: registry.cn-beijing.aliyuncs.com/dushixiang/guacd:latest
    volumes:
      - ./data:/usr/local/next-terminal/data
    restart: always

  next-terminal:
    container_name: next-terminal
    image: registry.cn-beijing.aliyuncs.com/dushixiang/next-terminal:latest
    ports:
      - "8088:8088"
      - "2022:2022"
    volumes:
      - /etc/localtime:/etc/localtime:ro
      - ./data:/usr/local/next-terminal/data
      - ./logs:/usr/local/next-terminal/logs
      - ./config.yaml:/etc/next-terminal/config.yaml
    depends_on:
      - guacd
    restart: always
```

## 7. 修改 `config.yaml`

`config.yaml`：

```yaml
Database:
  Enabled: true
  Type: postgres
  Postgres:
    Hostname: <PG_HOST>
    Port: <PG_PORT>
    Username: next-terminal
    Password: next-terminal
    Database: next-terminal
  ShowSql: false

log:
  Level: debug
  Filename: ./logs/nt.log

Server:
  Addr: "0.0.0.0:8088"

App:
  Website:
    AccessLog: "./logs/access.log"
  Recording:
    Type: "local"
    Path: "/usr/local/next-terminal/data/recordings"
  Guacd:
    Drive: "/usr/local/next-terminal/data/drive"
    Hosts:
      - Hostname: <PRIMARY_IP>
        Port: 4822
        Weight: 1
      - Hostname: <STANDBY_IP>
        Port: 4822
        Weight: 1
  ReverseProxy:
    Enabled: false
    HttpEnabled: true
    HttpAddr: ":80"
    HttpRedirectToHttps: false
    HttpsEnabled: true
    HttpsAddr: ":443"
    SelfProxyEnabled: false
    SelfDomain: "<DOMAIN>"
    Root: "http://<DOMAIN>"
    IpExtractor: "x-forwarded-for"
    IpTrustList:
      - "<NGINX_IP>/32"
```

## 8. 启动

### 主节点 A

```bash
cd /opt/next-terminal
docker compose up -d
docker compose ps
```

### 备用节点 B

```bash
cd /opt/next-terminal
docker compose up -d guacd
docker compose ps
```

## 9. 配置 Nginx

Nginx 配置：

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

upstream next_terminal_backend {
    server <PRIMARY_IP>:8088;
    server <STANDBY_IP>:8088 backup;
}

server {
    listen 80;
    server_name <DOMAIN>;
    client_max_body_size 100m;

    location / {
        proxy_pass http://next_terminal_backend;
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

加载配置：

```bash
nginx -t
systemctl reload nginx
```

## 10. 验证

```bash
curl http://<PRIMARY_IP>:8088
curl http://<DOMAIN>
```

页面验证：

1. 登录正常
2. SSH 正常
3. RDP / VNC 正常
4. 录屏正常
5. drive 正常

## 11. 故障切换

```bash
nc -zv <PG_HOST> <PG_PORT>
df -h | grep /opt/next-terminal/data
cd /opt/next-terminal
docker compose up -d next-terminal
docker compose ps
curl http://<STANDBY_IP>:8088
```

如主节点 A 仍在线，在主节点 A 执行：

```bash
cd /opt/next-terminal
docker compose stop next-terminal
```

## 12. 回切

```bash
cd /opt/next-terminal
docker compose up -d next-terminal
docker compose ps
curl http://<PRIMARY_IP>:8088
```

备用节点 B：

```bash
cd /opt/next-terminal
docker compose stop next-terminal
docker compose ps
```

## 13. 检查项

1. `config.yaml` 的 `Database.Postgres.Hostname` 不能写 `postgresql`
2. `config.yaml` 的 `App.Guacd.Hosts` 不能写 `guacd`
3. A 和 B 的 `./data` 必须是同一个共享目录
4. B 平时不要启动 `next-terminal`

## 14. 自动故障转移（Keepalived + VIP）

手工 `docker compose up -d` 适合演练，生产建议前置 Keepalived 抢占 VIP，避免 Nginx `backup` 30s 探测延迟。

```bash
# 主备均安装
apt install -y keepalived
```

`keepalived.conf`（主 `priority 100`，备 `priority 90`，`virtual_router_id` 同域唯一）：

```nginx
vrrp_instance VI_NT {
    state BACKUP
    interface eth0
    virtual_router_id 51
    priority 100  # 备改 90
    advert_int 1
    authentication { auth_type PASS; auth_pass nt-ha-51 }
    virtual_ipaddress { <VIP>/24 }
    track_script { chk_nt }
}
vrrp_script chk_nt {
    script "curl -sf http://127.0.0.1:8088/api/health || exit 1"
    interval 2
    weight -20
    fall 2
    rise 2
}
```

```nginx
# Nginx upstream 改为 VIP 单点
upstream next_terminal_backend { server <VIP>:8088; }
```

> VIP 漂移 <3s，配合 `track_script` 将应用健康纳入选举，比纯 TCP 探测更准。

## 15. 健康探针与存活检测

| 探针 | 检测对象 | 失败阈值 | 动作 |
|------|----------|----------|------|
| `chk_nt` | `next-terminal:8088` | 2 次 | Keepalived 降权 |
| `pg_isready` | PostgreSQL | 2 次 | 告警，不自动切（由 Patroni 管 PG） |
| NFS `stat` | `/opt/next-terminal/data` | 3 次 | 告警，切 S3 只读降级 |
| `guacd:4822` | guacd | 2 次 | 重启 guacd 容器 |

```bash
# crontab 每分钟自检（示例）
* * * * * /usr/local/bin/nt-ha-check.sh || logger "nt ha check failed"
```

## 16. 脑裂防护与 STONITH

共享 `data` + 共用 PG 时脑裂会导致录像/审计双写。约束：

1. **同刻只跑一个 `next-terminal` 容器**：Keepalived `nopreempt` + `weight -20` 确保旧主失联才让位；回归时手工 `docker compose stop` 旧主再 `up`。
2. **PG 侧**：若 PG 自建，走 Patroni + etcd 选主，NT 仅连 `pgbouncer -vip`；若托管 RDS，依赖云厂商主备。
3. **NFS 侧**：启用 `hard,intr,_netdev`，配 `soft` 超时告警；条件允许改 S3 录像（见下）。

## 17. 录像与 data 目录：NFS 的局限与 S3 替代

NFS 共享 `data` 简单但存在单点与锁竞争。规模化建议：

- `App.Recording.Type: s3` + `App.Guacd.Drive` 指向对象存储，`data` 仅留 `config.yaml` 与小文件。
- 好处：录像可水平扩展、免 NFS 锁、便于生命周期与归档；`config.yaml` 改为 ConfigMap/Secret 注入。

## 18. PostgreSQL 高可用选型

| 方案 | 适用 | 说明 |
|------|------|------|
| 云 RDS 主备 | 上云团队 | 最省心，NT 仅改 `Hostname` 为读写端点 |
| Patroni + etcd | 自建私有化 | 自动选主，需 3 节点 etcd，NT 侧用 pgbouncer VIP |
| 共享 PG（当前文档） | 2 节点演示 | 不抗 PG 单点，仅作入门 |

> 结论：NT 高可用≠ PG 高可用，需分层设计；`data` 与 `PG` 各自高可用后，NT 无状态可任意横向。

## 19. 演练手册（必做，每季度 1 次）

```bash
# 1. 主节点宕机
ssh <PRIMARY_IP> "docker compose stop next-terminal"
curl -i http://<VIP>:8088 --max-time 5  # 应 200，3s 内恢复

# 2. 网络分区（备侧拔网 30s 再恢复）
# 观察 Keepalived 日志 /var/log/messages，无双主

# 3. PG 主切（Patroni）
patronictl -c /etc/patroni.yml switchover --master <old> --candidate <new>

# 4. 录像回放验证
# 登录 -> 审计 -> 回放 1 条 RDP/SSH 录像
```

记录 RTO/RPO，未达标（RTO > 60s）则调 `advert_int / fall / rise`。

## 20. 监控告警

- **必告警**：VIP 漂移、`next-terminal` 健康失败、PG 复制延迟 >5s、NFS/S3 不可用、Keepalived `VRRP` 状态变 `FAULT`。
- **建议**：Prometheus `blackbox_exporter` 探 `https://<DOMAIN>` + `node_exporter` + Loki 收集 `nt.log/access.log`，Grafana 看板关联 `wednesday` 授权与会话审计。

> 完整生产 Checklist 见 [生产级高可用 Checklist](/zh/install/ha-production-checklist)。

