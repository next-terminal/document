---
layout: doc
title: "Next Terminal HA Deployment: Primary/Standby Pitfalls"
description: "Bastion host high availability deployment with Next Terminal: PostgreSQL 16 to 18 migration, real client IP, and Docker userland-proxy considerations for an open source bastion host and JumpServer or Teleport alternative."
head:
  - - meta
    - name: keywords
      content: bastion host high availability, HA deployment, open source bastion host, PostgreSQL migration, real client IP, userland-proxy, JumpServer alternative, Teleport alternative
  - - meta
    - property: og:title
      content: "Next Terminal HA Deployment: Primary/Standby Pitfalls"
  - - meta
    - property: og:description
      content: A practical primary/standby deployment guide covering shared state, PostgreSQL versions, proxy identity, Docker networking, and failure drills for Next Terminal.
---

# Next Terminal HA Deployment: Primary/Standby Pitfalls

**Bastion host high availability** is not achieved by starting two application containers. Teams that depend on continuous remote access and reliable operations audit must answer several operational questions: which node receives traffic after a failure, whether the database remains writable, whether recordings are available from the standby, and whether the client IP recorded in the audit trail can be trusted. This guide stays within the documented capabilities of Next Terminal v3.7.2 and organizes a primary/standby deployment approach for teams evaluating an open source bastion host, a JumpServer alternative, or a Teleport alternative.

It does not present a demonstration deployment as automatic failover. The application nodes, Guacamole, PostgreSQL, and recording storage have different responsibilities. Production availability requires suitable database, ingress, and storage infrastructure around Next Terminal. Treat those boundaries as part of the runbook and validate them in your own environment.

## 1. Separate primary/standby from complete high availability

A minimal topology is: users reach one domain, Nginx or a load balancer sends traffic to primary node A, and the ingress sends traffic to standby node B when A is unavailable. Both application nodes connect to the same PostgreSQL service and read the same persistent data or object storage. Start with the [primary/standby HA deployment guide](/install/ha-primary-standby-guide), then validate each item in the [production HA checklist](/install/ha-production-checklist).

```text
User -> Domain / Nginx / VIP -> Primary A
                                  | failure switch
                                  v
                              Standby B
                                   |
              PostgreSQL + shared data or S3 recording storage
```

Three facts are easy to miss:

1. **A standby is not automatically hot.** If B is stopped, cannot reach the database, or cannot read recordings, it is only another server.
2. **The database is the state core.** Two application nodes pointing at one database endpoint do not create PostgreSQL replication, leader election, or automatic failover.
3. **Ingress switching does not preserve every session.** Existing WebSocket, SSH, or RDP sessions may need to reconnect. Define RTO, RPO, and the expected user impact before launch.

Draw the dependency graph before choosing Keepalived, a cloud load balancer, a managed database failover endpoint, or Patroni. Next Terminal provides unified access, asset authorization, session audit, and recording; infrastructure provides availability and data protection. The boundary must be explicit.

## 2. Application nodes and the persistence boundary

Use the same image version, `config.yaml`, and Compose strategy on both nodes. Local logs can remain separate, but application data, recordings, and Guacamole working data must not disappear during a switch. For a test environment, the documented primary/standby example can use shared `data`. In production, prefer a dependable shared store or S3 where appropriate, and validate permissions, latency, capacity, and lifecycle policies.

The basic container commands are below; use the full [container installation](/install/container-install) documentation for the complete parameters:

```bash
mkdir -p /opt/next-terminal/{data,logs}
# Prepare the same compose and config.yaml on A and B
docker compose up -d
docker compose ps
```

Do not treat `docker compose up -d` as an HA test. Confirm that both nodes can start `next-terminal` and `guacd`, B can reach the database, mount paths have the same meaning, recordings written on A can be read after takeover, and health checks test a real application response rather than only a TCP port.

If local recordings are used and the takeover node cannot see the directory, users may still log in but historical sessions may not replay. The production checklist recommends S3 recordings; with NFS, test interruption, reconnects, locking, and timeout behavior and configure alerts. Backups must cover more than Compose files: include PostgreSQL and `data`, and perform regular restore drills.

## 3. PostgreSQL 16 and 18: never swap the image blindly

A PostgreSQL major-version change is a common source of HA incidents. The current documentation supports both PostgreSQL 16 and 18: an existing PostgreSQL 16 deployment can remain in place; when choosing 18, use a matching Next Terminal image tag. **Do not change `postgres:16` to `postgres:18` while reusing the 16 data directory.** Major versions are not interchangeable. Back up first, then follow [Migrate PostgreSQL 16 to 18](/faq/postgresql-16-to-18) to export, create the new database, restore, and verify.

Keep a version matrix in the runbook:

| Item | PostgreSQL 16 | PostgreSQL 18 |
| --- | --- | --- |
| Existing service | Can continue running | Requires a new 18 instance or migration |
| Next Terminal image | Tag matching the 16 client | `latest-pg18` |
| Data directory | Must be used by 16 | Must be used by 18 |
| Cutover | Verify backup and restore first | Verify connection, assets, and audit after migration |

Migration is not complete when the service merely starts. Check administrator login, assets, authorization, SSH/RDP connections, historical audit entries, and recording indexes. Keep the old instance and a rollback plan until the business owner confirms the result. Database HA also requires independent validation of replication lag, the failover endpoint, leader election, and connection retry behavior. A shared PostgreSQL endpoint may support application primary/standby, but it does not replace database HA.

## 4. Real client IP: HA must preserve trustworthy audit data

In a chain such as “user → Nginx/CDN/load balancer → Next Terminal,” the application commonly sees the proxy as its TCP peer. Without real client IP configuration, login logs, asset-access audits, and IP-based controls may show the wrong source. After a primary switch, inconsistent configuration between A and B can produce different audit results for the same user.

Configure `IpExtractor` and `IpTrustList` according to the actual trusted proxy chain. Do not accept arbitrary `X-Forwarded-For` values. Read [Get the real client IP](/install/real-ip), determine which proxy overwrites or appends headers, and apply the same settings to both nodes. Test from multiple networks and compare ingress logs, Next Terminal access logs, and audit records; do not rely only on what the browser displays.

The reverse proxy should also forward `Host`, `X-Real-IP`, `X-Forwarded-For`, and WebSocket upgrade headers, with a suitable read timeout. Keep the health-check path, HTTPS termination point, and `SelfDomain` consistent across nodes. If an external Nginx already exists, avoid adding an unclear second proxy layer.

## 5. Docker userland-proxy and port reachability

Some Docker networking and port-mapping environments are affected by userland-proxy. Symptoms can include port conflicts, unexpected loopback behavior, or a proxy chain that does not behave as expected. This is not a setting that every deployment must disable. Change it only when the environment shows a relevant problem and the result has been tested. Use [Disable Docker userland-proxy](/install/disable-docker-userland-proxy) and record the before-and-after listeners, container networking, and rollback procedure.

Check reachability at three layers: application listeners locally on each node; ingress-to-node access from the relevant network; and the user-facing HTTPS, WebSocket, SSH, or RDP proxy path. A standby that receives no normal traffic can still be omitted from a firewall, route, or security group. Limit database, Guacamole, and storage access to the required ranges rather than opening the whole internal network for convenience.

## 6. Failure drills: judge readiness with evidence

HA requires a drill, not just a configuration review. Before starting, record versions, database state, recording objects, active sessions, and monitoring time; notify stakeholders; and prepare rollback. A practical sequence is:

1. Confirm that A serves normally and B can reach every dependency.
2. Verify login, SSH/RDP asset access, audit entries, and recording writes from outside the cluster.
3. Stop the application service on A and observe the health check and ingress switch.
4. Record the elapsed time, reconnect user sessions, and inspect audit continuity.
5. Restore A and verify the intended return behavior; never start two nodes that can write shared state without a single-writer constraint.
6. Inspect PostgreSQL, storage, Nginx, and application logs for split brain, data loss, or incorrect IPs.

The drill report should contain timestamps, RTO, RPO, impact, root cause, and an owner for each improvement. A page opening successfully is not a complete bastion-host acceptance test: access control and audit continuity matter just as much as availability.

## 7. Pre-launch checklist

- [ ] A and B use a consistent Next Terminal v3.7.2 image and configuration policy.
- [ ] Database major version matches the image client; 16→18 migration follows the documented procedure.
- [ ] PostgreSQL has backups, restore verification, and a defined HA strategy.
- [ ] Recordings use validated shared storage or S3 with capacity and lifecycle alerts.
- [ ] Nginx/VIP health checks detect application failure and failover has been tested.
- [ ] `IpExtractor`, `IpTrustList`, and proxy-header behavior match on both nodes.
- [ ] Assets, authorization, SSH/RDP, audit, and recordings have passed takeover tests.
- [ ] userland-proxy is changed only for an evidenced issue, with rollback documented.
- [ ] RTO/RPO are recorded and on-call staff know the manual takeover steps.

## Conclusion: move from “starts” to “operable”

The goal of primary/standby HA is not to stack more components, but to define responsibility for state, ingress, storage, and audit. Next Terminal can provide a unified way to manage SSH, RDP, VNC, Telnet, and Web assets with authorization, session audit, and recording. Production reliability still depends on a compatible PostgreSQL setup, dependable storage, correct proxy identity, and repeated drills.

If you are evaluating an open source bastion host, JumpServer alternative, or Teleport alternative, deploy the container version first, then run a controlled failover drill using this checklist. For licensing and deployment options, visit [Pricing and plans](https://www.next-terminal.com/pricing); you can also open the [online demo](https://demo.next-terminal.com) to explore unified access and operations audit.
