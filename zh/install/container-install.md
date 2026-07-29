**推广**

<a href="https://www.lcayun.com/actcloud.html?from=next-terminal" target="_blank">![img.png](images/lcayun.png)</a>

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

::: warning PostgreSQL 16 用户请注意
如果现有 `docker-compose.yaml` 使用的是 `postgres:16`，请勿直接将其修改为 `postgres:18`。PostgreSQL 的主版本不能通过更换容器镜像直接升级，PostgreSQL 18 也无法直接使用 PostgreSQL 16 的数据目录。

请先按照[从 PostgreSQL 16 迁移到 PostgreSQL 18](/zh/faq/postgresql-16-to-18)完成数据库迁移。
:::

如果当前部署已经使用 PostgreSQL 18，可以执行以下命令升级 Next Terminal：

```shell
docker compose pull
docker compose up -d
```

## 开启 IPv6 (非必需)

请参考 docker 官方文档 https://docs.docker.com/engine/daemon/ipv6/
