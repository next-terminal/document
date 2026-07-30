---
title: Container Installation
description: Install Next Terminal quickly with Docker Compose, including setup, upgrade commands, and optional IPv6 configuration.
head:
  - - meta
    - name: keywords
      content: Next Terminal, Docker, Docker Compose, installation, quick setup
  - - meta
    - property: og:title
      content: Next Terminal Container Installation
  - - meta
    - property: og:description
      content: Install Next Terminal quickly with Docker Compose, then initialize admin and start secure remote access management.
---

# Installation

Before installation, make sure your host meets the [system requirements](/install/system-requirements).

## Install with Docker


```shell
curl -sSL https://f.next-terminal.com/next-terminal/docker-compose.yaml > docker-compose.yaml
curl -sSL https://f.next-terminal.com/next-terminal/config.yaml > config.yaml
docker compose up -d
```

::: tip After successful installation
Visit `http://{ip}:8088/setup` to initialize the admin user.

Visit `http://{ip}:8088/login` to sign in.
:::

### Upgrade

Both PostgreSQL 16 and PostgreSQL 18 are supported. Existing PostgreSQL 16 deployments can continue using PostgreSQL 16 and do not need to migrate to PostgreSQL 18 in order to upgrade Next Terminal.

Make sure the PostgreSQL server major version matches the PostgreSQL client included in the Next Terminal image:

| PostgreSQL server | Next Terminal image |
| --- | --- |
| `postgres:16` | `dushixiang/next-terminal:latest` |
| `postgres:18` | `dushixiang/next-terminal:latest-pg18` |

If you use the Alibaba Cloud registry, keep the existing registry hostname and use the corresponding image tag.

::: warning Only required when migrating to PostgreSQL 18
If your existing `docker-compose.yaml` uses `postgres:16`, do not change it directly to `postgres:18`. PostgreSQL major versions cannot be upgraded by replacing the container image, and PostgreSQL 18 cannot use a PostgreSQL 16 data directory directly.

If you choose to migrate to PostgreSQL 18, follow [Migrate from PostgreSQL 16 to PostgreSQL 18](/faq/postgresql-16-to-18). Otherwise, keep your existing PostgreSQL 16 configuration.
:::

After confirming that `docker-compose.yaml` uses the correct image combination, you can upgrade Next Terminal with the following commands whether you use PostgreSQL 16 or PostgreSQL 18:

```shell
docker compose pull
docker compose up -d
```

## Enable IPv6 (Optional)

See the official Docker documentation: https://docs.docker.com/engine/daemon/ipv6/
