---
layout: doc
title: "容器安装 — Next Terminal 开源堡垒机"
description: "用 Docker Compose 一键部署 Next Terminal 开源堡垒机 — 5分钟完成堡垒机部署，JumpServer/Teleport 轻量替代，适合中小团队。"
head:
  - - meta
    - name: keywords
      content: 堡垒机部署, docker 堡垒机, 开源堡垒机部署, 跳板机部署, Next Terminal, JumpServer替代
  - - meta
    - property: og:title
      content: "容器安装 — Next Terminal 开源堡垒机"
  - - meta
    - property: og:description
      content: "用 Docker Compose 一键部署 Next Terminal 开源堡垒机 — 5分钟完成堡垒机部署，JumpServer/Teleport 轻量替代，适合中小团队。"
---

**推广**

<a href="https://www.lcayun.com/actcloud.html?from=next-terminal" target="_blank" rel="sponsored noopener">![img.png](images/lcayun.png)</a>

雨云，湖北 8272CL 100G+高防，8核16G 200兆，仅需178元/月，[点击这里购买](https://www.rainyun.com/MTE3MDI2Mw==_)

----

# 安装

安装之前请先检查硬件及依赖符合[系统需求](/zh/install/system-requirements)

## 使用 Docker 安装

::: code-group

```shell [中国大陆]
curl -sSL https://f.next-terminal.com/next-terminal/docker-compose-aliyun.yaml > docker-compose.yaml
curl -sSL https://f.next-terminal.com/next-terminal/config.yaml > config.yaml
docker compose up -d
```

```shell [其他]
curl -sSL https://f.next-terminal.com/next-terminal/docker-compose.yaml > docker-compose.yaml
curl -sSL https://f.next-terminal.com/next-terminal/config.yaml > config.yaml
docker compose up -d
```

:::


::: tip 安装成功后
访问 http://{ip}:8088/setup 进行用户初始化设置

访问 http://{ip}:8088/login 进行登陆
:::

### 版本升级

PostgreSQL 16 和 PostgreSQL 18 均受支持。现有 PostgreSQL 16 部署可以继续使用，无需为了升级 Next Terminal 而迁移到 PostgreSQL 18。

请确保 PostgreSQL 服务端与 Next Terminal 镜像内置的 PostgreSQL client 主版本一致：

| PostgreSQL 服务端 | Next Terminal 镜像 |
| --- | --- |
| `postgres:16` | `dushixiang/next-terminal:latest` |
| `postgres:18` | `dushixiang/next-terminal:latest-pg18` |

如果使用阿里云镜像，请保留原有镜像仓库地址，并使用对应的标签。

::: warning 仅在迁移到 PostgreSQL 18 时需要注意
如果现有 `docker-compose.yaml` 使用的是 `postgres:16`，请勿直接将其修改为 `postgres:18`。PostgreSQL 的主版本不能通过更换容器镜像直接升级，PostgreSQL 18 也无法直接使用 PostgreSQL 16 的数据目录。

如需迁移到 PostgreSQL 18，请按照[从 PostgreSQL 16 迁移到 PostgreSQL 18](/zh/faq/postgresql-16-to-18)完成数据库迁移；不需要迁移时，请继续保留现有 PostgreSQL 16 配置。
:::

确认 `docker-compose.yaml` 中的镜像版本组合正确后，无论使用 PostgreSQL 16 还是 PostgreSQL 18，都可以执行以下命令升级 Next Terminal：

```shell
docker compose pull
docker compose up -d
```

## 开启 IPv6 (非必需)

请参考 docker 官方文档 https://docs.docker.com/engine/daemon/ipv6/
