---
title: Fix Docker Port Forwarding Conflict — Disable userland-proxy to Get Real Client IP
description: Docker published ports hide the real client IP (172.17.0.1). Fix the port mapping conflict by disabling Docker userland-proxy, restore the original IP for Next Terminal, and verify with a Compose example.
head:
  - - meta
    - name: keywords
      content: Docker disable userland proxy, Docker port forwarding, real client IP, 172.17.0.1, Next Terminal
  - - meta
    - property: og:title
      content: Fix Docker Port Forwarding Conflict — Disable userland-proxy to Get Real Client IP | Next Terminal
  - - meta
    - property: og:description
      content: Docker published ports hide the real client IP. Learn how to disable userland-proxy, fix port conflicts, and restore the original IP for Next Terminal with a Compose example.
---

# Fix Docker Port Forwarding Conflict — Disable userland-proxy to Get Real Client IP

When NextTerminal is exposed through Docker published ports, Docker's `userland-proxy` may cause the application to see the Docker gateway or host-side address instead of the real visitor IP, such as `172.17.0.1` or `172.18.0.1`.

If the original network peer address has already been hidden by `userland-proxy`, NextTerminal cannot restore it by changing `IpExtractor` or `IpTrustList`. Disable `userland-proxy` on the Docker host, then recreate the container so Docker rebuilds the port publishing rules.

::: warning Linux Docker host only
The commands below are for Linux hosts managed by `systemd`. Docker Desktop environments may manage the Docker daemon differently.
:::

## 1. Edit Docker daemon configuration

Open `/etc/docker/daemon.json`:

```bash
sudo vi /etc/docker/daemon.json
```

If the file is empty or does not exist, use:

```json
{
  "userland-proxy": false
}
```

If the file already has other options, merge `userland-proxy` into the existing JSON object. For example:

```json
{
  "registry-mirrors": [
    "https://mirror.example.com"
  ],
  "userland-proxy": false
}
```

## 2. Restart Docker

Validate the JSON first:

```bash
sudo dockerd --validate --config-file /etc/docker/daemon.json
```

Then restart Docker:

```bash
sudo systemctl restart docker
```

::: warning Restarting Docker interrupts running containers
Restart Docker during a maintenance window if this host is running production workloads.
:::

## 3. Recreate the NextTerminal container

Docker applies published-port rule changes when containers are created. Restarting the existing container may not be enough; recreate it:

```bash
docker compose down
docker compose up -d
```

If your Compose file uses a different project directory or filename, run the commands in that directory and include the same `-f` arguments you normally use.

## 4. Verify the setting

Check Docker daemon output:

```bash
docker info | grep -i "userland"
```

You should see `userland-proxy` reported as disabled, or no enabled `userland-proxy` entry depending on the Docker version.

Then access NextTerminal from an external client and check the relevant log:

| Symptom appears in | Where to check |
| --- | --- |
| Web asset access log | Web Assets → Access Logs |
| Admin login log / security audit | Admin UI → Login Logs / Security Audit |

## 5. Keep NextTerminal IP extraction as direct

If users connect directly to NextTerminal and there is no Nginx, CDN, WAF, or load balancer in front, keep the IP extraction mode as `direct`.

Only use `x-forwarded-for` or `x-real-ip` when there is a real upstream proxy that sets those headers.

## Related Docs

- [Get the Real Client IP](./real-ip) — Configure NextTerminal IP extraction
- [Container Installation](./container-install) — Install NextTerminal with Docker Compose
