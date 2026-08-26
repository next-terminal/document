---
layout: doc
title: "Next Terminal 主备高可用部署实战：堡垒机上线前的关键避坑"
description: "堡垒机高可用部署实战：基于 Next Terminal 主备架构处理 PostgreSQL 16 到 18、real-ip 与 Docker userland-proxy 问题，作为 JumpServer/Teleport 替代的生产检查参考。"
head:
  - - meta
    - name: keywords
      content: 堡垒机高可用,HA部署,开源堡垒机,PostgreSQL迁移,real-ip,userland-proxy,JumpServer替代,Teleport替代
  - - meta
    - property: og:title
      content: Next Terminal 主备高可用部署实战：堡垒机上线前的关键避坑
  - - meta
    - property: og:description
      content: 从架构、共享存储、数据库版本、反向代理、真实客户端 IP 到故障演练，梳理 Next Terminal 开源堡垒机高可用部署的可执行检查路径。
---

# Next Terminal 主备高可用部署实战：堡垒机上线前的关键避坑

**堡垒机高可用**不是简单地把两个应用容器启动起来。对需要连续运维访问和完整运维审计的团队来说，真正要解决的是：主节点故障时谁接管流量，数据库是否仍然可写，录像和配置是否能被接管节点读取，以及审计记录里的客户端 IP 是否可信。本文以 Next Terminal v3.7.2 的文档能力为边界，整理一套主备部署思路，帮助正在评估开源堡垒机、JumpServer 替代或 Teleport 替代的团队先把风险边界想清楚。

本文不会把“演示可运行”包装成“自动故障切换”。Next Terminal 应用节点、Guacamole、PostgreSQL 和录像存储各有职责；高可用需要外围的数据库、入口和存储方案共同完成。生产环境请以实际基础设施的能力和验证结果为准。

## 一、先区分主备架构与真正的高可用

最小的主备拓扑可以抽象为：用户访问统一域名，Nginx 或负载均衡器把请求送到主节点 A；A 不可用时，入口把流量切到备用节点 B。两个应用节点连接同一个 PostgreSQL 服务，并读取同一份持久化数据或对象存储。可以参考[主备高可用部署文档](/zh/install/ha-primary-standby-guide)中的示意配置，再用[生产级高可用 Checklist](/zh/install/ha-production-checklist)逐项验收。

```text
用户 -> 域名 / Nginx / VIP -> 主节点 A
                              | 失败切换
                              v
                          备用节点 B
                               |
             PostgreSQL + 共享 data 或 S3 录像存储
```

这里有三个容易被忽略的事实：

1. **备用节点不等于热备。** 如果 B 没有启动应用、无法连接数据库或读不到录像，它只是另一台服务器。
2. **数据库是状态核心。** 两个应用节点共同连接一个数据库地址，并不自动产生 PostgreSQL 主从、自动选主或数据复制。
3. **入口切换不等于会话无损。** 已建立的 WebSocket、SSH 或 RDP 会话可能需要重新连接；上线前应明确 RTO、RPO 和用户预期。

因此，建议先画出依赖关系，再选择 Keepalived、云负载均衡、数据库托管主备、Patroni 等外围组件。Next Terminal 负责统一访问、资产授权、会话审计和录像，基础设施负责可用性和数据保护，两者边界必须写进运维手册。

## 二、应用节点与持久化边界

在每个节点使用一致的镜像版本、`config.yaml` 和 Compose 配置。节点本地的日志可以分别保留，但应用依赖的数据目录、录像目录和 Guacamole 工作目录不能因为切换而消失。对于只做验证的环境，可以按主备文档使用共享 `data`；生产环境更应优先采用可靠的共享存储或 S3，并做好权限、延迟、容量和生命周期管理。

容器安装的基础命令如下，完整参数以[容器安装](/zh/install/container-install)为准：

```bash
mkdir -p /opt/next-terminal/{data,logs}
# 在 A、B 节点分别准备同版本的 compose 与 config.yaml
docker compose up -d
docker compose ps
```

不要把 `docker compose up -d` 当成高可用验证。至少需要确认：A、B 都能启动 `next-terminal` 和 `guacd`；B 能连接数据库；挂载路径在两个节点上语义一致；录像写入后能从接管节点读取；入口的健康检查不会仅检查 TCP 端口，而是检查应用实际响应。

对于本地录像，切换节点若看不到原目录，用户仍可能能登录，却无法正常回放历史会话。生产 Checklist 建议优先使用 S3 录像；如果使用 NFS，应验证网络中断、重连、锁和超时行为，并配置告警。数据备份也不能只备份 Compose 文件：至少要覆盖 PostgreSQL 与 `data`，并定期做恢复演练。

## 三、PostgreSQL 16 与 18：不要直接换镜像

PostgreSQL 主版本升级是主备部署中最常见的事故来源之一。当前文档同时说明了 PostgreSQL 16 和 18 的支持方式：已有 PostgreSQL 16 部署可以继续使用；如果选择 18，需要使用与之匹配的 Next Terminal 镜像标签。**不能仅把 `postgres:16` 改成 `postgres:18`，然后复用 16 的数据目录。** 数据目录的主版本不兼容，正确做法是先备份，再按照[PostgreSQL 16 迁移到 18](/zh/faq/postgresql-16-to-18)执行导出、创建新数据库、恢复和校验。

上线前建议形成一张版本矩阵：

| 项目 | PostgreSQL 16 | PostgreSQL 18 |
| --- | --- | --- |
| 现有服务 | 可继续运行 | 需新建 18 实例或完成迁移 |
| Next Terminal 镜像 | 与 16 client 匹配的标签 | `latest-pg18` |
| 数据目录 | 只能由 16 使用 | 只能由 18 使用 |
| 切换方式 | 先验证备份与恢复 | 迁移后验证连接、资产和审计 |

迁移不是“服务能启动”就结束。应检查管理员登录、资产列表、授权关系、SSH/RDP 连接、历史审计和录像索引；同时保留旧实例和回滚步骤，直到业务确认。数据库高可用还需要独立验证复制延迟、主备端点、故障选主和连接重试。共享 PostgreSQL 端点可以支撑应用主备，但不会替代数据库高可用。

## 四、real-ip：高可用也要保证审计可信

当链路是“用户 → Nginx/CDN/负载均衡 → Next Terminal”时，应用看到的 TCP 对端通常是代理地址。如果不配置真实 IP，登录日志、资产访问审计和基于 IP 的控制就可能记录错误来源。主备切换后若两台节点配置不一致，同一用户在 A、B 上还会得到不同的审计结果。

Next Terminal 的配置应根据实际可信代理链设置 `IpExtractor` 和 `IpTrustList`，不要盲目接受任意 `X-Forwarded-For`。请先阅读[获取真实客户端 IP](/zh/install/real-ip)，确认哪些代理会覆盖或追加请求头，再让 A、B 使用同样的配置。验证时从不同网络访问，分别比对入口日志、Next Terminal 访问日志和审计记录；不要只看浏览器页面显示。

同时，反向代理需要正确转发 `Host`、`X-Real-IP`、`X-Forwarded-For` 和 WebSocket 升级请求，并设置足够的读超时。健康检查路径、HTTPS 终止位置和 `SelfDomain` 也应在两节点保持一致。若使用内置反向代理，按照实际拓扑启用；若外部已有 Nginx，则不要重复叠加不清晰的代理层。

## 五、Docker userland-proxy 与端口可达性

某些 Docker 网络和端口映射场景会受到 userland-proxy 影响，表现为端口占用、回环访问异常或代理链路不符合预期。它不是所有部署都必须关闭的开关，只有在环境确实遇到相关问题、并完成验证时才处理。可参考[禁用 Docker userland-proxy](/zh/install/disable-docker-userland-proxy)，记录修改前后的端口监听、容器网络和回滚方法。

建议把端口检查分成三层：节点本地检查应用监听；同网段检查入口到节点的访问；用户侧检查 HTTPS、WebSocket、SSH 或 RDP 代理路径。备用节点不能因为平时没有流量就被防火墙、路由或安全组遗漏。尤其是 Guacamole 端口、数据库访问和共享存储访问，应使用最小必要范围放行，而不是为了“先跑通”开放整个内网。

## 六、故障演练：用证据判断是否达标

高可用部署必须演练，而不是只阅读配置。演练前记录当前版本、数据库状态、录像对象、活跃会话和监控时间；通知相关人员；准备回滚。可以按以下顺序进行：

1. 确认 A 正常服务，B 已能连接全部依赖。
2. 从外部验证登录、SSH/RDP 资产访问、审计记录和录像写入。
3. 停止 A 的应用服务，观察健康检查和入口切换。
4. 记录切换耗时，重新建立用户会话并检查审计连续性。
5. 恢复 A，验证是否按照预期回切；不要在没有单写约束时同时启动两个会写共享数据的节点。
6. 检查 PostgreSQL、共享存储、Nginx 和应用日志，确认没有双主、数据丢失或错误 IP。

演练结果至少应包含时间点、RTO、RPO、影响范围、失败原因和改进责任人。不要把一次“页面打开了”写成完整验收；堡垒机的价值在于访问控制和审计链路同样可靠。

## 七、上线前检查清单

- [ ] A、B 使用一致的 Next Terminal v3.7.2 配置和镜像策略。
- [ ] 数据库主版本与镜像 client 匹配，16→18 已按迁移文档完成。
- [ ] PostgreSQL 有备份、恢复验证和明确的主备策略。
- [ ] 录像采用已验证的共享存储或 S3，容量和生命周期有告警。
- [ ] Nginx/VIP 健康检查能发现应用不可用，并已验证切换。
- [ ] `IpExtractor`、`IpTrustList` 和代理头在两个节点一致。
- [ ] 资产、授权、SSH/RDP、审计和录像均完成接管测试。
- [ ] userland-proxy 只在有证据的问题场景中调整，并保留回滚方案。
- [ ] 演练记录了 RTO/RPO，值班人员知道手工接管步骤。

## 结语：把“能启动”升级为“可运营”

主备高可用的重点不在于堆叠更多组件，而在于明确状态、入口、存储和审计的责任边界。Next Terminal 适合以统一入口管理 SSH、RDP、VNC、Telnet 和 Web 资产，并通过授权、会话审计和录像降低运维风险；真正的生产可靠性，则来自匹配的 PostgreSQL、可靠存储、正确代理配置和反复演练。

如果你正在评估开源堡垒机、JumpServer 替代或 Teleport 替代方案，可以先按文档完成容器部署，再用本文清单做一次不影响业务的故障切换演练。需要了解商业授权与部署支持，可访问[价格与方案](https://www.next-terminal.com/pricing)；也可以直接打开[在线 Demo](https://demo.next-terminal.com)体验统一访问和运维审计流程。
