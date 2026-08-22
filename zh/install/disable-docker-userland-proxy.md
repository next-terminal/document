---
layout: doc
title: "禁用 Docker userland-proxy — Next Terminal"
description: "为 Next Terminal 开源堡垒机禁用 Docker userland-proxy — 降低端口转发开销与真实 IP 透传优化。"
head:
  - - meta
    - name: keywords
      content: Docker, userland-proxy, 堡垒机部署, Next Terminal, 开源堡垒机
  - - meta
    - property: og:title
      content: "禁用 Docker userland-proxy — Next Terminal"
  - - meta
    - property: og:description
      content: "为 Next Terminal 开源堡垒机禁用 Docker userland-proxy — 降低端口转发开销与真实 IP 透传优化。"
---

# 禁用 Docker userland-proxy

当 NextTerminal 通过 Docker 端口映射对外暴露时，Docker 的 `userland-proxy` 可能会导致应用看到的是 Docker 网关或宿主机侧地址，而不是真实访问者 IP，例如 `172.17.0.1`、`172.18.0.1`。

如果原始网络对端地址已经被 `userland-proxy` 隐藏，NextTerminal 无法通过修改 `IpExtractor` 或 `IpTrustList` 把它还原出来。需要在 Docker 主机上禁用 `userland-proxy`，然后重建容器，让 Docker 重新生成端口映射规则。

::: warning 仅适用于 Linux Docker 主机
下面命令适用于使用 `systemd` 管理 Docker 的 Linux 主机。Docker Desktop 环境的 Docker daemon 管理方式可能不同。
:::

## 1. 编辑 Docker daemon 配置

打开 `/etc/docker/daemon.json`：

```bash
sudo vi /etc/docker/daemon.json
```

如果文件为空或不存在，写入：

```json
{
  "userland-proxy": false
}
```

如果文件里已经有其他配置，把 `userland-proxy` 合并到现有 JSON 对象中。例如：

```json
{
  "registry-mirrors": [
    "https://mirror.example.com"
  ],
  "userland-proxy": false
}
```

## 2. 重启 Docker

先校验 JSON 配置：

```bash
sudo dockerd --validate --config-file /etc/docker/daemon.json
```

然后重启 Docker：

```bash
sudo systemctl restart docker
```

::: warning 重启 Docker 会中断正在运行的容器
如果这台主机上有生产业务容器，请安排维护窗口后再操作。
:::

## 3. 重建 NextTerminal 容器

Docker 在创建容器时应用端口映射规则。只重启已有容器可能不够，需要重建：

```bash
docker compose down
docker compose up -d
```

如果你的 Compose 文件使用了其他目录或文件名，请在对应目录执行，并带上平时使用的 `-f` 参数。

## 4. 验证配置

查看 Docker daemon 输出：

```bash
docker info | grep -i "userland"
```

根据 Docker 版本不同，输出中应显示 `userland-proxy` 已禁用，或不再出现启用状态的 `userland-proxy` 项。

然后从外部客户端访问 NextTerminal，并检查对应日志：

| 现象出现位置 | 检查位置 |
| --- | --- |
| Web 资产访问日志 | Web 资产 → 访问日志 |
| 管理后台登录日志 / 安全审计 | 管理后台 → 登录日志 / 安全审计 |

## 5. NextTerminal 继续使用 direct

如果用户是直连 NextTerminal，前面没有 Nginx、CDN、WAF、负载均衡等外部代理，IP 获取方式继续使用 `direct`。

只有当前面确实存在会设置请求头的上游代理时，才使用 `x-forwarded-for` 或 `x-real-ip`。

## 相关文档

- [获取真实客户端 IP](./real-ip) — 配置 NextTerminal 的 IP 提取方式
- [容器安装](./container-install) — 使用 Docker Compose 安装 NextTerminal
