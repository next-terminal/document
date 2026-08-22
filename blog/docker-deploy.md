---
layout: doc
title: "Deploy Next Terminal Bastion Host with Docker: First SSH Asset in 5 Minutes"
description: "Deploy Next Terminal open source bastion host with Docker Compose, from container startup to your first SSH asset in 5 minutes. A lightweight JumpServer/Teleport alternative for small teams."
head:
  - - meta
    - name: keywords
      content: bastion host deployment,docker bastion host,open source bastion deployment,Next Terminal,JumServer alternative,Teleport alternative,SSH bastion
  - - meta
    - property: og:title
      content: "Deploy Next Terminal Bastion Host with Docker: First SSH Asset in 5 Minutes"
  - - meta
    - property: og:description
      content: Step-by-step Docker Compose deployment of Next Terminal and onboarding your first SSH asset for self-hosted bastion evaluation.
---

# Deploy Next Terminal Bastion Host with Docker: First SSH Asset in 5 Minutes

For small teams, the first hurdle of a **bastion host deployment** is not features but "can we get it running quickly." Next Terminal is a lightweight **open source bastion host** that ships ready-to-run Docker images and Compose templates — no complex dependencies required. This guide shows a **Docker one-click deployment** path that takes you from zero to your first SSH asset in about five minutes, ideal for teams evaluating a **JumpServer alternative** or **Teleport alternative**.

## Why Docker for Next Terminal

Compared with binary or package-based installs, containers bring consistency, easy rollback, and cheap migration. Next Terminal images bundle Guacamole, supporting services, and the web UI, while the official `docker-compose.yaml` and `config.yaml` let you bring up the full stack with a single command.

| Aspect | Traditional install | Docker install |
| --- | --- | --- |
| Dependencies | Install Guacamole/PostgreSQL manually | Bundled in images; only Docker Engine required |
| Upgrade / rollback | Handle file and config diffs manually | `docker compose pull && docker compose up -d` |
| Migration | Export configs and data piece by piece | Back up volumes and `config.yaml` |
| Audience | Strong ops background | Small teams and solo operators |

> Check [System Requirements](/install/system-requirements) before you start. Full instructions are in [Container Installation](/install/container-install).

## Prep Checklist (1 minute)

1. **Docker Engine** ≥ 20.10 and Compose v2 (`docker compose version`).
2. **Ports**: `8088` for the web UI plus proxy ports (`3389`/`3390`) if you plan to use RDP/SSH proxies — open them in the firewall as needed.
3. **Persistence**: create a host directory for PostgreSQL data and session recordings.
4. **Domain / TLS (optional)**: put the service behind a [Reverse Proxy](/install/reverse-proxy) with HTTPS when exposing it publicly.

## Step 1: Fetch Compose and Config

Next Terminal provides region-specific compose files for faster pulls:

::: code-group

```shell [Mainland China]
curl -sSL https://f.next-terminal.com/next-terminal/docker-compose-aliyun.yaml > docker-compose.yaml
curl -sSL https://f.next-terminal.com/next-terminal/config.yaml > config.yaml
cat docker-compose.yaml
```

```shell [Other regions]
curl -sSL https://f.next-terminal.com/next-terminal/docker-compose.yaml > docker-compose.yaml
curl -sSL https://f.next-terminal.com/next-terminal/config.yaml > config.yaml
cat docker-compose.yaml
```

:::

`config.yaml` is the primary server config (session, storage, reverse proxy, etc.). See [Configuration File](/install/config-desc). For real client IP and disabling Docker userland-proxy, see [Real Client IP](/install/real-ip) and [Disable Docker userland-proxy](/install/disable-docker-userland-proxy).

## Step 2: Start the Stack

```shell
docker compose up -d
docker compose ps
docker compose logs -f next-terminal
```

The first start initializes the database and Guacamole components automatically. When you see `listening on :8088` without errors, you are ready. If a port conflict appears, change the mapping in `docker-compose.yaml` and run `up -d` again.

::: tip Next
Open `http://{server-ip}:8088/setup` to create the admin account, then sign in at `http://{server-ip}:8088/login`.
:::

## Step 3: Initialize and Configure Basics

1. Complete the admin setup wizard at `/setup`.
2. In system settings, verify site URL, session timeout, and audit policies.
3. To expose the service on a public domain, enable reverse proxy and set `SelfDomain` as described in [Reverse Proxy](/install/reverse-proxy).

## Step 4: Onboard Your First SSH Asset

Assets are the core object of any bastion host. Go to Asset Management → Create Asset and fill in:

- **Name**: e.g. `prod-web-01`
- **Protocol**: `SSH`
- **Host / Port**: e.g. `192.168.1.10:22`
- **Credential**: password or private key (configure the matching public key on the target host)
- **Group**: organize by environment or project for later authorization

Field details are in [Assets](/usage/asset). Save and use **Test Connection** to verify network and credential correctness.

## Step 5: Authorize and Verify Access

After creation, authorize the asset to a user or group, then connect via [Asset Access](/usage/access).

- Open the in-browser web terminal to verify SSH login, command execution, and session recording.
- For local clients or the SSH proxy, see [SSH Proxy Server](/usage/ssh-server) and [Termark](/usage/termark).
- For assets in other networks or data centers, connect them through the [Security Gateway](/usage/agent-gateway) without opening every asset port on the edge firewall.

## FAQ

**PostgreSQL 16 or 18?**
Both are supported. Existing `postgres:16` deployments can stay as-is. `postgres:18` requires the `dushixiang/next-terminal:latest-pg18` tag. Do not switch the data volume from 16 to 18 by only changing the image — follow [Migrate PostgreSQL 16 to 18](/faq/postgresql-16-to-18).

**How to upgrade Next Terminal?**
After confirming the image tag matches your PostgreSQL major version:

```shell
docker compose pull
docker compose up -d
```

**How to back up and restore?**
For self-hosted deployments, back up the PostgreSQL volume and `config.yaml` regularly. To restore, recreate containers and re-mount the data.

## Conclusion

Deploying **Next Terminal as an open source bastion host** with Docker comes down to three actions: fetch the Compose files, start the containers, and onboard an SSH asset. Compared with heavier alternatives, Next Terminal keeps deployment complexity, resource usage, and day-to-day maintenance low — a practical **JumpServer/Teleport alternative** for small teams to pilot and run long-term. After the first asset, extend to RDP, database, and Web assets and tighten authorization and audit policies over time.

To evaluate features and cost, see [Next Terminal Pricing](https://www.next-terminal.com/pricing) and try the live [Demo](https://demo.next-terminal.com).
