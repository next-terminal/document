---
layout: doc
title: "反向代理 — Next Terminal"
description: "Next Terminal 开源堡垒机的反向代理配置 — Nginx/Caddy、HTTPS、WebSocket 与安全网关转发，统一访问入口。"
head:
  - - meta
    - name: keywords
      content: 反向代理, 堡垒机, WebSocket, Next Terminal, 开源堡垒机, 安全网关
  - - meta
    - property: og:title
      content: "反向代理 — Next Terminal"
  - - meta
    - property: og:description
      content: "Next Terminal 开源堡垒机的反向代理配置 — Nginx/Caddy、HTTPS、WebSocket 与安全网关转发，统一访问入口。"
---

# 反向代理

## nginx 反向代理示例

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

## caddy 反向代理示例

```shell
next.example.com {
    reverse_proxy 127.0.0.1:8088
}
```