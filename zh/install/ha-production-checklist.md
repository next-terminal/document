---
layout: doc
title: "生产级高可用 Checklist — Next Terminal"
description: "Next Terminal 开源堡垒机生产级高可用上线检查表 — Keepalived VIP、脑裂防护、PostgreSQL 高可用、S3 录像、探针与季度演练。"
head:
  - - meta
    - name: keywords
      content: 堡垒机高可用检查表, 高可用, Keepalived VIP, 脑裂, PostgreSQL高可用, S3录像, Next Terminal
  - - meta
    - property: og:title
      content: "生产级高可用 Checklist — Next Terminal"
  - - meta
    - property: og:description
      content: "Next Terminal 高可用上线检查：VIP、PG高可用、存储、探针与演练。"
---

# 生产级高可用 Checklist

用于判定 Next Terminal 是否达到生产上线标准，作为 [主备高可用部署](/zh/install/ha-primary-standby-guide) 的配套检查表。

## 必备（未完成不得上线）

- [ ] **单写约束**：`keepalived nopreempt + track_script chk_nt`，同刻仅一个 `next-terminal` 写 `data`。
- [ ] **VIP 健康**：`curl -sf http://127.0.0.1:8088/api/health` 纳入 `vrrp_script`，`fall 2 / rise 2`，VIP 漂移 <3s 已验证。
- [ ] **PostgreSQL 高可用**：云 RDS 主备端点或 Patroni+etcd+pgbouncer VIP；共享 PG 仅为演示。
- [ ] **录像存储**：优先 S3（`App.Recording.Type: s3`），保留 NFS 时配 `hard,intr,_netdev` 与超时告警。
- [ ] **反向代理**：VIP 上线后 Nginx `upstream backup` 移除，单点 `server <VIP>:8088`，`proxy_read_timeout 3600s`。
- [ ] **真实 IP**：`IpExtractor: x-forwarded-for` 且 `IpTrustList` 含 Nginx/VIP。
- [ ] **备份**：PostgreSQL `pg_basebackup` + `data`（或 S3 版本）每日，恢复已演练。
- [ ] **探针**：`chk_nt / pg_isready / NFS stat / guacd:4822` 纳入 Keepalived 或 cron 并告警。

## 推荐

- [ ] `config.yaml` 由 ConfigMap/Secret 注入，`data` 无状态化。
- [ ] Prometheus `blackbox_exporter` 探 `https://<DOMAIN>` + `node_exporter` + Loki 采 `nt.log/access.log`。
- [ ] VIP 漂移、PG 延迟 >5s、NFS/S3 不可用、`VRRP FAULT` 必告警。
- [ ] 每季度演练并记录 RTO/RPO（目标 RTO <60s）。
- [ ] 已验证 [禁用 Docker userland-proxy](/zh/install/disable-docker-userland-proxy) 与 [获取真实IP](/zh/install/real-ip)。

## 演练模板

```bash
date -Iseconds > drill.log
ssh <PRIMARY_IP> "docker compose stop next-terminal" && curl -i http://<VIP>:8088 --max-time 5 | head -1 | tee -a drill.log
# 预期：3s 内 200，VIP 在备节点，/var/log/messages 无双主
```

签字：运维 ________  日期 ________  RTO ________  RPO ________
