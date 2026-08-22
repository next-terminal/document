---
layout: doc
title: "Primary/Standby HA Deployment — Next Terminal"
description: "Primary/standby high-availability deployment guide for Next Terminal open source bastion host — PostgreSQL replication, failover and real-ip handling."
head:
  - - meta
    - name: keywords
      content: bastion host HA, high availability, primary standby, Next Terminal HA, open source bastion
  - - meta
    - property: og:title
      content: "Primary/Standby HA Deployment — Next Terminal"
  - - meta
    - property: og:description
      content: "Primary/standby high-availability deployment guide for Next Terminal open source bastion host — PostgreSQL replication, failover and real-ip handling."
---

# Next Terminal Primary/Standby Deployment Guide

## 1. Architecture

### Single-Node Architecture

```text
User
  |
  v
Nginx / Domain
  |
  v
next-terminal + guacd + postgresql
```

### Primary/Standby Architecture

```text
                 +-------------------+
User -> Nginx -> | Primary Node A    |
                 | next-terminal     |
                 | guacd             |
                 +-------------------+
                          |
                          | failover
                          v
                 +-------------------+
                 | Standby Node B    |
                 | next-terminal     |
                 | guacd             |
                 +-------------------+

Primary node A and standby node B share:
- PostgreSQL
- data directory
```

## 2. Example Environment

```text
Primary Node A: <PRIMARY_IP>
Standby Node B: <STANDBY_IP>
PostgreSQL: <PG_HOST>:<PG_PORT>
Nginx: <NGINX_IP>
Shared Storage: <NFS_HOST>:<NFS_PATH>
Domain: <DOMAIN>
```

## 3. Prepare Directories

```bash
mkdir -p /opt/next-terminal
cd /opt/next-terminal
mkdir -p data logs
```

## 4. Mount Shared Storage

```bash
mount -t nfs <NFS_HOST>:<NFS_PATH> /opt/next-terminal/data
df -h | grep /opt/next-terminal/data
```

To mount it automatically on boot, add the following line to `/etc/fstab`:

```txt
<NFS_HOST>:<NFS_PATH> /opt/next-terminal/data nfs defaults,_netdev 0 0
```

## 5. Download Installation Files

```bash
cd /opt/next-terminal
curl -sSL https://f.next-terminal.com/next-terminal/docker-compose.yaml > docker-compose.yaml
curl -sSL https://f.next-terminal.com/next-terminal/config.yaml > config.yaml
```

## 6. Update `docker-compose.yaml`

`docker-compose.yaml`:

```yaml
services:
  guacd:
    container_name: guacd
    image: dushixiang/guacd:latest
    volumes:
      - ./data:/usr/local/next-terminal/data
    restart: always

  next-terminal:
    container_name: next-terminal
    image: dushixiang/next-terminal:latest
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

## 7. Update `config.yaml`

`config.yaml`:

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

## 8. Start the Services

### Primary Node A

```bash
cd /opt/next-terminal
docker compose up -d
docker compose ps
```

### Standby Node B

```bash
cd /opt/next-terminal
docker compose up -d guacd
docker compose ps
```

## 9. Configure Nginx

Nginx configuration:

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

Load the configuration:

```bash
nginx -t
systemctl reload nginx
```

## 10. Verification

```bash
curl http://<PRIMARY_IP>:8088
curl http://<DOMAIN>
```

Verify the following in the UI:

1. Login works normally
2. SSH works normally
3. RDP / VNC works normally
4. Session recording works normally
5. Drive works normally

## 11. Failover

```bash
nc -zv <PG_HOST> <PG_PORT>
df -h | grep /opt/next-terminal/data
cd /opt/next-terminal
docker compose up -d next-terminal
docker compose ps
curl http://<STANDBY_IP>:8088
```

If primary node A is still online, run the following command on primary node A:

```bash
cd /opt/next-terminal
docker compose stop next-terminal
```

## 12. Failback

```bash
cd /opt/next-terminal
docker compose up -d next-terminal
docker compose ps
curl http://<PRIMARY_IP>:8088
```
