---
layout: doc
title: "Reverse Proxy — Next Terminal"
description: "Reverse proxy setup for Next Terminal open source bastion host — Nginx/Caddy, HTTPS, WebSocket and Security Gateway forwarding for unified access."
head:
  - - meta
    - name: keywords
      content: reverse proxy, bastion host, WebSocket, Next Terminal, open source bastion, security gateway
  - - meta
    - property: og:title
      content: "Reverse Proxy — Next Terminal"
  - - meta
    - property: og:description
      content: "Reverse proxy setup for Next Terminal open source bastion host — Nginx/Caddy, HTTPS, WebSocket and Security Gateway forwarding for unified access."
---

# Reverse Proxy

## Nginx Example

```shell
location / {
    proxy_pass http://127.0.0.1:8088/;
    proxy_set_header Host      $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $http_connection;
}
```

## Caddy Example

```shell
next.example.com {
    reverse_proxy 127.0.0.1:8088
}
```
