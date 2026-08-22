---
layout: doc
title: "Production HA Checklist — Next Terminal"
description: "Production-grade high-availability checklist for Next Terminal open source bastion host — keepalived VIP, split-brain protection, PostgreSQL HA, S3 recordings, probes and quarterly drills."
head:
  - - meta
    - name: keywords
      content: bastion host HA checklist, high availability, keepalived VIP, split-brain, PostgreSQL HA, S3 recording, Next Terminal
  - - meta
    - property: og:title
      content: "Production HA Checklist — Next Terminal"
  - - meta
    - property: og:description
      content: "Go-live checklist for Next Terminal HA: VIP failover, PGHA, storage, probes and drills."
---

# Production HA Checklist

Use this checklist before marking a Next Terminal deployment as production-ready. It complements [Primary/Standby HA Deployment](/install/ha-primary-standby-guide).

## Must-have (block go-live)

- [ ] **Single writer**: `keepalived nopreempt + track_script chk_nt` — only one `next-terminal` writes `data` at a time.
- [ ] **VIP health**: `curl -sf http://127.0.0.1:8088/api/health` in `vrrp_script` with `fall 2 / rise 2`, VIP failover <3s verified.
- [ ] **PostgreSQL HA**: either managed RDS primary/standby endpoint or Patroni+etcd with pgbouncer VIP; shared PG alone is demo-only.
- [ ] **Recording storage**: S3 (`App.Recording.Type: s3`) preferred; NFS `hard,intr,_netdev` with soft-timeout alerts if kept.
- [ ] **Reverse proxy**: Nginx `upstream backup` removed after VIP, single `server <VIP>:8088` with `proxy_read_timeout 3600s`.
- [ ] **Real IP**: `IpExtractor: x-forwarded-for` and `IpTrustList` includes Nginx/VIP.
- [ ] **Backup**: PostgreSQL `pg_basebackup` + `data` (or S3 versioning) daily, restore tested.
- [ ] **Probes**: `chk_nt / pg_isready / NFS stat / guacd:4822` in Keepalived or cron, alerts fire.

## Recommended

- [ ] `config.yaml` from ConfigMap/Secret, `data` stateless.
- [ ] Prometheus `blackbox_exporter` on `https://<DOMAIN>` + `node_exporter` + Loki for `nt.log/access.log`.
- [ ] Alert on VIP move, PG lag >5s, NFS/S3 unavailable, `VRRP FAULT`.
- [ ] Quarterly drill log with RTO/RPO (target RTO <60s).
- [ ] [Disable Docker userland-proxy](/install/disable-docker-userland-proxy) and [Real Client IP](/install/real-ip) verified.

## Drill template

```bash
date -Iseconds > drill.log
ssh <PRIMARY_IP> "docker compose stop next-terminal" && curl -i http://<VIP>:8088 --max-time 5 | head -1 | tee -a drill.log
# expect: HTTP/1.1 200 within 3s, VIP on standby, no dual-primary in /var/log/messages
```

Sign-off: SRE ________  Date ________  RTO ________  RPO ________
