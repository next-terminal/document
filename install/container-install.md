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

::: warning Existing PostgreSQL 16 installations
If your existing `docker-compose.yaml` uses `postgres:16`, do not change it directly to `postgres:18`. PostgreSQL major versions cannot be upgraded by replacing the container image, and PostgreSQL 18 cannot use a PostgreSQL 16 data directory directly.

First follow [Migrate from PostgreSQL 16 to PostgreSQL 18](/faq/postgresql-16-to-18) to migrate the database.
:::

If your deployment already uses PostgreSQL 18, upgrade Next Terminal with:

```shell
docker compose pull
docker compose up -d
```

## Enable IPv6 (Optional)

See the official Docker documentation: https://docs.docker.com/engine/daemon/ipv6/
