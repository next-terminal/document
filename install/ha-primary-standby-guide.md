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

## 14. Automatic Failover with Keepalived + VIP

Manual `docker compose up -d` is for drills. In production put Keepalived in front to avoid Nginx `backup` 30s detection lag.

```bash
apt install -y keepalived
```

`keepalived.conf` (`priority 100` primary, `90` standby, same `virtual_router_id`):

```nginx
vrrp_instance VI_NT {
    state BACKUP
    interface eth0
    virtual_router_id 51
    priority 100  # standby: 90
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
upstream next_terminal_backend { server <VIP>:8088; }
```

> VIP failover <3s; `track_script` ties app health into election, more accurate than TCP alone.

## 15. Health Probes

| Probe | Target | Fail threshold | Action |
|-------|--------|----------------|--------|
| `chk_nt` | `next-terminal:8088` | 2 | Keepalived weight drop |
| `pg_isready` | PostgreSQL | 2 | Alert only (Patroni owns PG) |
| NFS `stat` | `/opt/next-terminal/data` | 3 | Alert, degrade to S3 read-only |
| `guacd:4822` | guacd | 2 | Restart guacd container |

## 16. Split-Brain Protection and STONITH

Shared `data` + shared PG risks dual writes.

1. **Only one `next-terminal` at a time**: Keepalived `nopreempt` + `weight -20` ensures promotion only when old primary is gone; on return stop old primary before `up`.
2. **PostgreSQL**: self-host via Patroni+etcd with pgbouncer VIP; managed RDS relies on cloud failover.
3. **NFS**: `hard,intr,_netdev` with soft timeout alerts; prefer S3 recordings where possible (next section).

## 17. Recordings and Data Directory: NFS Limits and S3 Alternative

NFS is simple but single-point and lock-prone.

- Switch `App.Recording.Type: s3` and `App.Guacd.Drive` to object storage; keep `data` for `config.yaml` only.
- Benefits: horizontal scale, no NFS locks, lifecycle/archival; inject `config.yaml` via ConfigMap/Secret.

## 18. PostgreSQL HA Choices

| Option | Fit | Notes |
|--------|-----|-------|
| Managed RDS primary/standby | Cloud teams | Easiest, NT points to read-write endpoint |
| Patroni + etcd | Self-hosted private | Auto election, needs 3 etcd nodes, NT via pgbouncer VIP |
| Shared PG (this guide) | 2-node demo | Does not survive PG single-point; starter only |

> NT HA != PG HA — design each layer separately. Once `data` and `PG` are HA, NT is stateless and horizontally scalable.

## 19. Drill Playbook (quarterly)

```bash
# 1. Primary down
ssh <PRIMARY_IP> "docker compose stop next-terminal"
curl -i http://<VIP>:8088 --max-time 5  # expect 200 within 3s

# 2. Network partition (unplug standby 30s, check no dual-primary in /var/log/messages)

# 3. PG switchover (Patroni)
patronictl -c /etc/patroni.yml switchover --master <old> --candidate <new>

# 4. Replay verification
# Login -> Audit -> replay one RDP/SSH recording
```

Record RTO/RPO; if RTO >60s tune `advert_int / fall / rise`.

## 20. Monitoring and Alerting

- **Must alert**: VIP move, `next-terminal` health fail, PG replication lag >5s, NFS/S3 unavailable, Keepalived `VRRP FAULT`.
- **Recommended**: Prometheus `blackbox_exporter` on `https://<DOMAIN>` + `node_exporter` + Loki for `nt.log/access.log`, Grafana dashboard tied to `wednesday` license and session audit.

> Full checklist: [Production HA Checklist](/install/ha-production-checklist).

