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
