---
layout: doc
title: "Primary/Standby (Active/Passive) Deployment — Next Terminal"
description: "Deploy two Next Terminal application nodes with shared PostgreSQL and file storage, then perform safe failover, failback, and upgrades."
head:
  - - meta
    - name: keywords
      content: Next Terminal HA, bastion host high availability, active passive, PostgreSQL HA, guacd, failover
  - - meta
    - property: og:title
      content: "Primary/Standby (Active/Passive) Deployment — Next Terminal"
  - - meta
    - property: og:description
      content: "Active/passive Next Terminal deployment with shared dependencies, safe traffic switching, failover, failback, and upgrades."
---

# Primary/Standby (Active/Passive) Deployment

This guide deploys two Next Terminal application nodes in active/passive mode. Under normal conditions, only one `next-terminal` instance runs. The standby node is prepared with the same image, configuration, and shared dependencies. After a failure, isolate the original node, start the standby application, and move all entry-point traffic to it.

::: danger This is not an application-managed cluster
Next Terminal currently has no node election, distributed lock, or automatic-failover setting. Application instances run scheduled jobs, credential rotation, backups, and some session-local state. Do not run two `next-terminal` instances continuously behind a round-robin load balancer.

Automatic failover requires an external HA platform with reliable fencing. Moving a VIP alone does not stop the old node from writing to the database or running jobs.
:::

## 1. Scope

Use this design when:

- You need to reduce downtime caused by failure of one Next Terminal application node.
- PostgreSQL and shared file storage can live outside both application nodes.
- Existing SSH, RDP, VNC, and Telnet sessions may disconnect during failover and users can reconnect.
- Operators perform failover manually, or an external platform can fence nodes, start services, and switch traffic.

This design does not by itself remove a single point of failure in:

- A single PostgreSQL instance.
- A single NFS, NAS, S3, or WebDAV service.
- One reverse proxy or load balancer.
- One switch, power source, site, or DNS service.

Two application servers with a single-instance database and storage provide application-node redundancy, not end-to-end high availability.

## 2. Architecture and Responsibilities

```text
                          ┌──────────────────────────┐
Users ── HTTPS / TCP ────▶│ Entry point / LB / VIP   │
                          └─────────────┬────────────┘
                                        │ routes only to active node
                         ┌──────────────┴──────────────┐
                         │                             │
              ┌──────────▼──────────┐      ┌───────────▼─────────┐
              │ Node A (active)      │      │ Node B (standby)     │
              │ next-terminal: up    │      │ next-terminal: down  │
              │ guacd: up            │      │ guacd: up            │
              └──────────┬──────────┘      └───────────┬─────────┘
                         │                             │
                         └──────────────┬──────────────┘
                                        │
                  ┌─────────────────────┼─────────────────────┐
                  │                     │                     │
          ┌───────▼────────┐   ┌────────▼────────┐   ┌────────▼────────┐
          │ PostgreSQL      │   │ Shared filesystem│  │ S3 / WebDAV     │
          │ writer endpoint │   │ drive/local rec. │  │ optional rec.   │
          └────────────────┘   └─────────────────┘   └─────────────────┘
```

| Layer | Purpose | Requirement |
| --- | --- | --- |
| Next Terminal | Web management, SSH access, sessions, and jobs | Only one application instance runs at a time |
| guacd | RDP/VNC protocol proxy | May run on both nodes; active application uses its local guacd |
| PostgreSQL | Users, assets, authorization, logs, and settings | Both nodes use one writer endpoint; the database platform owns database HA |
| Shared filesystem | Windows mapped drives and local recordings | Same container path on both nodes; mount before application and guacd start |
| S3/WebDAV | Optional external recording storage | Requires its own availability and backup design |
| Entry point | Web, SSH proxy, and other published ports | Routes only to the active node and switches every enabled entry point together |

## 3. Supported Boundaries

The deployment must match the current configuration model:

- `App.Guacd.Hosts` accepts multiple weighted guacd addresses, but selection is weight based; it is not health-aware removal. This guide uses the Compose name `guacd` so each active application talks to its local instance.
- `App.Recording.Type` supports `local` and `s3`; WebDAV can be configured in System Settings.
- `App.Guacd.Drive` is a filesystem directory, not an object-storage URL. An RDP mapped drive cannot be shared by changing this value to S3.
- There is no application role, node ID, election, or distributed job-lock setting. The deployment platform owns the active/passive state.
- Release images support AMD64 and ARM64. Separate PostgreSQL 16- and PostgreSQL 18-client image variants are published, and the client major version must match the server.

## 4. Prepare the Environment

Replace these placeholders:

```text
Node A: <NODE_A_IP>
Node B: <NODE_B_IP>
PostgreSQL writer endpoint: <PG_HOST>:<PG_PORT>
Shared filesystem: <NFS_HOST>:<NFS_PATH>
Public domain: <DOMAIN>
Next Terminal release: <VERSION>, for example v3.x.y
```

Both nodes must:

1. Use a supported CPU architecture and the same Docker Engine and Compose versions.
2. Synchronize time and use consistent time-zone settings.
3. Reach the PostgreSQL writer endpoint, target assets, and object storage.
4. Receive the same `config.yaml`; distribute database credentials through a permission-restricted file or secret manager.
5. Mount shared storage at the same host and container paths.
6. Expose only required ports and restrict PostgreSQL, NFS, and internal port `4822` to trusted sources.

::: warning Pin an explicit version
Use an explicit production tag such as `dushixiang/next-terminal:<VERSION>`. Never let the two nodes drift to different releases, and do not depend only on `latest` without validation.
:::

## 5. Prepare PostgreSQL

Both application nodes must use the same PostgreSQL writer endpoint. Use a managed primary/standby endpoint or a PostgreSQL HA cluster maintained separately. Next Terminal does not perform database replication, election, or recovery.

Match the application image to the server major version:

| PostgreSQL server | Next Terminal image tag |
| --- | --- |
| PostgreSQL 16 | `dushixiang/next-terminal:<VERSION>` |
| PostgreSQL 18 | `dushixiang/next-terminal:<VERSION>-pg18` |

A database major-version migration cannot be completed by swapping images. See [PostgreSQL 16 to 18 Migration](/install/postgresql-16-to-18) when needed.

Test connectivity from both nodes:

```shell
nc -vz <PG_HOST> <PG_PORT>
```

Do not run an independent PostgreSQL database on each application node; the nodes would show different data after failover.

## 6. Prepare Shared File Storage

Even when recordings use S3 or WebDAV, Windows mapped drives still require a shared filesystem. This example mounts NFS at the same `/opt/next-terminal/data` path on both nodes:

```shell
mkdir -p /opt/next-terminal/data /opt/next-terminal/logs
mount -t nfs <NFS_HOST>:<NFS_PATH> /opt/next-terminal/data
mountpoint /opt/next-terminal/data
```

Configure `/etc/fstab` with options appropriate for the storage platform, including `_netdev` where applicable. Do not copy unverified NFS timeout settings into production.

Before starting services, verify the mount and write access:

```shell
mountpoint -q /opt/next-terminal/data
test -w /opt/next-terminal/data
```

::: danger Prevent writes to an unmounted local directory
If the NFS mount fails but Compose starts, containers may write recordings or mapped-drive files into an empty local directory. Make a mounted-and-writable check a startup dependency in systemd, deployment scripts, or the external HA platform.
:::

Directory roles:

```text
/opt/next-terminal/data/drive       Windows mapped-drive files
/opt/next-terminal/data/recordings  Session recordings when Type=local
/opt/next-terminal/logs             Node-local logs; do not share these
```

S3 recording reduces recording capacity and throughput pressure on the shared filesystem, but it does not replace the `drive` directory.

## 7. Use the Same Configuration on Both Nodes

Create `/opt/next-terminal/config.yaml` on both nodes. This excerpt contains only fields relevant to active/passive deployment:

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

For S3 recordings, use the S3 fields supported by the current configuration example:

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

`Path` may still be used while a recording is created, converted, or uploaded. Do not remove shared storage merely because S3 is enabled.

See the full [`config.yaml` Reference](/install/config-desc). Confirm both files are identical:

```shell
sha256sum /opt/next-terminal/config.yaml
```

## 8. Use the Same Compose Definition on Both Nodes

Create `/opt/next-terminal/docker-compose.yaml` on both nodes:

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

For PostgreSQL 18, use `dushixiang/next-terminal:<VERSION>-pg18`. Mainland China deployments can keep the same tag and use the project-provided Alibaba Cloud registry.

This Compose file intentionally does not start PostgreSQL or MinIO on each application node. Copying development-only single-instance PostgreSQL or MinIO services to two servers does not create a shared database or highly available object storage.

## 9. First Start

Start only guacd on both nodes:

```shell
cd /opt/next-terminal
mountpoint -q ./data
docker compose pull
docker compose up -d guacd
docker compose ps
```

Choose node A as the initial active node and start the application only there:

```shell
cd /opt/next-terminal
docker compose up -d next-terminal
docker compose ps
docker compose exec next-terminal nt status
curl -fsS -o /dev/null http://127.0.0.1:8088/login
```

Do not run `docker compose up -d next-terminal` on node B. Confirm that no standby application container is running:

```shell
docker compose ps next-terminal
```

## 10. Configure the Entry Point

The Web UI and browser sessions need long-lived connections and WebSocket support. This Nginx example points only to the active node:

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

    # Configure ssl_certificate and ssl_certificate_key for the deployment.
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

See [Real Client IP](/install/real-ip) for trusted-proxy configuration. Do not set `IpTrustList` to `0.0.0.0/0` without a specific trust-boundary reason.

If the SSH proxy uses port `2022`, or RDP proxy and other TCP entry points are enabled, switch them through an L4 load balancer, VIP, or DNS at the same time. An HTTP Nginx `upstream` does not proxy these TCP services.

::: warning An Nginx backup server does not create an application cluster
Adding node B as an Nginx `backup` backend changes only HTTP routing. It does not start the standby application, fence the original node, check shared storage, or prevent dual-active operation. This guide does not treat that setting as failover.
:::

## 11. Pre-Go-Live Validation

Test node A directly and through the public entry point. At minimum, verify:

1. Administrator and ordinary-user sign-in and authorization.
2. SSH terminal and SSH filesystem access.
3. RDP/VNC sessions, clipboard, and display behavior.
4. The Windows mapped drive and visibility of the same file in browser storage.
5. Recording lookup and replay after a session ends.
6. Every enabled Web asset, database proxy, SSH proxy, or other entry point.
7. Backup creation and off-node retention.
8. guacd is healthy on node B while `next-terminal` is stopped.

<!-- TODO(image): Add screenshots of System Monitoring and a verified session replay. -->

## 12. Fail Over from A to B

Always follow this order: fence the old node, check shared dependencies, start the new node, then switch traffic.

### 12.1 Fence node A

If node A is reachable, stop the application:

```shell
cd /opt/next-terminal
docker compose stop next-terminal
docker compose ps next-terminal
```

If node A is unreachable, use the virtualization platform, cloud control plane, security group, switch, or power controller to ensure it cannot continue serving traffic or writing shared dependencies. Do not start node B while the fencing state is unknown.

### 12.2 Check prerequisites on node B

```shell
cd /opt/next-terminal
mountpoint -q ./data
test -w ./data
nc -vz <PG_HOST> <PG_PORT>
sha256sum config.yaml
docker compose images
docker compose ps guacd
```

Compare the configuration checksum and image tag with the recorded values from node A.

### 12.3 Start node B

```shell
docker compose up -d next-terminal
docker compose exec next-terminal nt status
curl -fsS -o /dev/null http://127.0.0.1:8088/login
docker compose logs --tail=100 next-terminal guacd
```

### 12.4 Switch every entry point

Change the HTTPS backend from `<NODE_A_IP>:8088` to `<NODE_B_IP>:8088`, validate the proxy configuration, and reload it. Switch port `2022` and every other enabled TCP entry point as part of the same operation.

### 12.5 Validate the service

Repeat sign-in, authorization, SSH, RDP/VNC, file, and recording checks. Existing sessions on the failed node do not migrate and users must reconnect.

Record incident time, fencing time, recovery time, any data-loss window, and actual RTO/RPO.

## 13. Fail Back from B to A

Failback is not simply restarting node A. Repair node A and synchronize its image and configuration, then:

1. Confirm node A can reach shared storage and PostgreSQL.
2. Stop and verify the `next-terminal` instance on node B.
3. Start `next-terminal` on node A and validate it locally.
4. Move Web and all TCP entry points back to node A.
5. Complete business validation and record the result.

Do not keep both application instances running briefly to reduce the switch time.

## 14. Minimum Requirements for Automatic Failover

Pacemaker, a cloud HA orchestrator, a virtualization platform, or another external system can automate this guide, but it must provide:

1. **Fencing:** the old node is powered off, disconnected, or denied write access to the database and shared storage.
2. **Dependency checks:** the PostgreSQL writer, shared mount, and local guacd are available.
3. **Single-active enforcement:** no more than one `next-terminal` instance can run.
4. **Entry-point switching:** Web, SSH, RDP proxy, and every enabled port move together.
5. **Failure handling:** if startup or validation fails, traffic switching stops and an alert fires.
6. **Audit evidence:** trigger, fencing result, command output, and timestamps are retained.

Keepalived performs VIP election only. If it is used, a tested resource manager or notification scripts must still control service start/stop and fencing. Do not let untested scripts take over production.

## 15. Upgrade Both Nodes

The release pipeline publishes each version for AMD64/ARM64 and publishes distinct PostgreSQL 16- and PostgreSQL 18-client tags. Keep the nodes and database on a valid version combination.

Recommended procedure:

1. Create and download a [Backup and Restore](/usage/backup) backup; separately protect `drive`, local recordings, and `config.yaml`.
2. Read the target release notes and identify database migration and rollback constraints.
3. Pull the explicit target image on the standby without starting the application.
4. Enter a maintenance window, fence the active node, and start the standby by following the failover procedure.
5. Complete full business validation before updating the original node.
6. Retain the previous version information and backups through the observation period.

::: danger A database migration may prevent direct rollback
The first start of a new release may change the database schema. Keeping the old image does not prove that it can be restarted safely. Confirm migration compatibility and maintain a tested database restore plan before rollback.
:::

## 16. Monitoring and Drills

Monitor at least:

- The public entry point and HTTP availability of the active node.
- PostgreSQL connectivity, replication, and writer endpoint.
- Shared-mount presence, write access, capacity, and latency.
- guacd port and RDP/VNC connection success rate.
- S3/WebDAV availability, upload failures, and backlog.
- Next Terminal, guacd, proxy, and operating-system logs.
- Active/passive state and accidental simultaneous application instances.

Run a failover drill after each application upgrade or material infrastructure change. Cover:

1. Planned switch after a clean application stop.
2. Fencing when the active node is unreachable.
3. Refusing promotion when PostgreSQL or shared storage is unavailable.
4. Switching Web and TCP entry points together.
5. User reconnection, file access, and recording replay.
6. Failback and failed-promotion recovery.

## 17. Final Checklist

- [ ] Both nodes use the same explicit image tag and `config.yaml`.
- [ ] PostgreSQL client and server major versions match.
- [ ] Both nodes use the same PostgreSQL writer endpoint.
- [ ] `data` is mounted at the same path on both nodes and checked before startup.
- [ ] `drive` uses a shared filesystem and is not misconfigured as an S3 URL.
- [ ] S3/WebDAV or the shared filesystem has its own availability and backup plan.
- [ ] Only one `next-terminal` instance runs under normal conditions.
- [ ] guacd runs on both nodes and the active application uses local `guacd`.
- [ ] Web, SSH, and every other TCP entry point move to the same active node.
- [ ] A reliable fencing procedure exists.
- [ ] Failover, business validation, and failback have been rehearsed.
- [ ] RTO, RPO, owners, and rollback conditions are recorded.
