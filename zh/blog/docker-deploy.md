---
layout: doc
title: "Docker 一键部署 Next Terminal 开源堡垒机：5分钟接入首个 SSH 资产"
description: "用 Docker 一键部署 Next Terminal 开源堡垒机，从容器启动到接入首个 SSH 资产全流程实操，5 分钟完成堡垒机部署。适合中小团队的 JumpServer/Teleport 轻量替代方案。"
head:
  - - meta
    - name: keywords
      content: 堡垒机部署,docker 堡垒机,开源堡垒机部署,跳板机部署,Next Terminal,JumpServer替代,Teleport替代,SSH堡垒机
  - - meta
    - property: og:title
      content: Docker 一键部署 Next Terminal 开源堡垒机：5分钟接入首个 SSH 资产
  - - meta
    - property: og:description
      content: 从零开始用 Docker Compose 部署 Next Terminal，初始化、配置存储与网络，完成首个 SSH 资产接入与授权验证。
---

# Docker 一键部署 Next Terminal 开源堡垒机：5分钟接入首个 SSH 资产

对于中小团队而言，**堡垒机部署**的第一道门槛往往不是功能，而是“能不能快速跑起来”。Next Terminal 作为轻量**开源堡垒机**，提供开箱即用的 Docker 镜像与 Compose 模板，无需预装复杂依赖即可完成**跳板机部署**。本文以 **Docker 一键部署**为路径，带你在 5 分钟内从零启动服务并接入首个 SSH 资产，适合评估 **JumpServer 替代**或 **Teleport 替代**的团队快速验证。

## 为什么选择 Docker 部署 Next Terminal

相比传统二进制或包管理器部署，容器化部署在堡垒机场景有三个明确收益：环境一致、可回滚、迁移成本低。Next Terminal 的容器镜像已内置 Guacamole、依赖服务与前端资源，配合官方提供的 `docker-compose.yaml` 与 `config.yaml`，一条命令即可拉起完整栈。

| 维度 | 传统部署 | Docker 部署 |
| --- | --- | --- |
| 依赖管理 | 需手动安装 Guacamole/PostgreSQL 等 | 镜像内已集成，仅需 Docker Engine |
| 升级回滚 | 需处理文件与配置差异 | `docker compose pull && docker compose up -d` 即可 |
| 迁移 | 需逐项导出配置与数据 | 备份数据卷与 `config.yaml` 即可整体迁移 |
| 适配人群 | 运维经验较强 | 中小团队、个人运维均可快速上手 |

> 已有服务器需满足[系统需求](/zh/install/system-requirements)，完整安装说明见[容器安装](/zh/install/container-install)。

## 准备工作：1 分钟检查清单

开始前确认以下几点，避免启动后反复排错：

1. **Docker 版本**：建议 Docker Engine ≥ 20.10，Compose v2（`docker compose version` 可验证）。
2. **端口占用**：默认暴露 `8088`（Web）、`3389/3390` 相关代理端口，按需放行防火墙。
3. **持久化目录**：提前创建数据目录，确保 PostgreSQL 数据与录像文件可持久化。
4. **域名/证书（可选）**：若需对外提供 Web 访问，建议配合[反向代理](/zh/install/reverse-proxy)与 HTTPS。

## 第 1 步：拉取 Compose 与配置文件

Next Terminal 为中国大陆与海外分别提供加速地址，任选其一：

::: code-group

```shell [中国大陆]
curl -sSL https://f.next-terminal.com/next-terminal/docker-compose-aliyun.yaml > docker-compose.yaml
curl -sSL https://f.next-terminal.com/next-terminal/config.yaml > config.yaml
cat docker-compose.yaml
```

```shell [其他地区]
curl -sSL https://f.next-terminal.com/next-terminal/docker-compose.yaml > docker-compose.yaml
curl -sSL https://f.next-terminal.com/next-terminal/config.yaml > config.yaml
cat docker-compose.yaml
```

:::

`config.yaml` 为服务端主配置，包含会话、存储、反向代理等配置项说明，详见[配置文件](/zh/install/config-desc)。如需获取真实客户端 IP 或禁用 Docker userland-proxy，可按需参考[获取真实IP](/zh/install/real-ip)与[禁用 Docker userland-proxy](/zh/install/disable-docker-userland-proxy)。

## 第 2 步：一键启动

```shell
docker compose up -d
docker compose ps
docker compose logs -f next-terminal
```

首次启动会自动初始化数据库与 Guacamole 组件。出现 `listening on :8088` 且无 error 日志即可进入下一步。若日志提示端口冲突，修改 `docker-compose.yaml` 中映射端口后重新 `up -d` 即可。

::: tip 提示
启动后访问 `http://{服务器IP}:8088/setup` 完成管理员初始化，再通过 `http://{服务器IP}:8088/login` 登录控制台。
:::

## 第 3 步：初始化与基础配置

1. 打开 `/setup` 按向导设置管理员账号与密码。
2. 登录后进入「系统设置」检查站点地址、会话超时与审计策略是否符合预期。
3. 如需将服务暴露到公网域名，开启反向代理并配置 `SelfDomain`，参考[反向代理](/zh/install/reverse-proxy)。

## 第 4 步：接入首个 SSH 资产

资产是堡垒机的核心对象。进入「资产管理」→「新增资产」，填写以下必填项：

- **名称**：如 `prod-web-01`
- **协议**：`SSH`
- **主机/端口**：如 `192.168.1.10:22`
- **账号/认证**：密码或密钥（二者选一，密钥需提前在资产侧配置公钥）
- **分组**：按环境/项目归类，便于后续授权

详细字段见[资产管理](/zh/usage/asset)。保存后点击「测试连接」验证网络与认证是否通畅。

## 第 5 步：授权并验证访问

资产创建后需授权给用户方可访问：进入「授权」将该资产授予当前账号或指定用户组，然后通过[资产访问](/zh/usage/access)发起连接。

- 浏览器内直接打开 Web 终端即可验证 SSH 登录、命令执行与会话录像是否正常。
- 如需通过本地客户端或 SSH 代理访问，参考 [SSH 代理服务器](/zh/usage/ssh-server) 与 [Termark 本地客户端](/zh/usage/termark)。
- 多机房/内网资产可通过[安全网关](/zh/usage/agent-gateway)接入，无需在边界防火墙开放全部资产端口。

## 常见问题

**1. PostgreSQL 16 还是 18？**
两者均受支持，现有 `postgres:16` 部署可继续使用；`postgres:18` 需使用 `dushixiang/next-terminal:latest-pg18` 标签。不要直接将数据卷从 16 换成 18，需按[从 PostgreSQL 16 迁移到 18](/zh/faq/postgresql-16-to-18)执行迁移。

**2. 升级 Next Terminal 怎么做？**
确认 Compose 中镜像标签与 PostgreSQL 主版本匹配后执行：

```shell
docker compose pull
docker compose up -d
```

**3. 如何备份与恢复？**
私有化部署建议定期备份 PostgreSQL 数据卷与 `config.yaml`，恢复时重建容器并挂载原数据即可。更多请参考备份相关文档与 FAQ。

## 总结

用 Docker 完成 **Next Terminal 开源堡垒机部署**，核心步骤只有三件：拉取 Compose、启动容器、接入 SSH 资产。相比重量级堡垒机方案，Next Terminal 在部署复杂度、资源占用与日常维护上更适合中小团队作为 **JumpServer/Teleport 替代**进行试点与长期使用。完成首个资产接入后，可继续扩展 RDP、数据库与 Web 资产，并逐步完善授权与审计策略。

想进一步评估功能与成本，可查看 [Next Terminal 定价](https://www.next-terminal.com/pricing) 并在 [在线演示](https://demo.next-terminal.com) 中体验完整审计与录像能力。
