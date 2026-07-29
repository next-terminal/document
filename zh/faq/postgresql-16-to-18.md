# 从 PostgreSQL 16 迁移到 PostgreSQL 18

当前的 Next Terminal 容器安装配置默认使用 PostgreSQL 18。如果现有部署仍在使用 PostgreSQL 16，需要先通过系统备份功能导出数据，再创建 PostgreSQL 18 数据库并恢复备份。

::: danger 请勿直接更换 PostgreSQL 镜像
PostgreSQL 的主版本不能通过将 `postgres:16` 直接修改为 `postgres:18` 完成升级。PostgreSQL 18 无法直接使用 PostgreSQL 16 的数据目录。

迁移完成并确认数据无误前，请勿删除原 PostgreSQL 16 数据目录和 `.ntbak` 备份文件，也不要执行 `docker compose down -v`。
:::

本指南适用于使用官方 `docker-compose.yaml` 安装的 Next Terminal。如果修改过服务名、数据库账号、数据目录或卷挂载，请根据实际配置调整命令。

## 镜像与 PostgreSQL client 版本

系统备份功能调用 Next Terminal 镜像内置的 `pg_dump` 和 `pg_restore`。迁移前后的 Next Terminal 镜像必须与数据库主版本匹配：

| 迁移阶段 | PostgreSQL 镜像 | Next Terminal 镜像 | 内置 client |
| --- | --- | --- | --- |
| 迁移前 | `postgres:16` | `dushixiang/next-terminal:latest` | PostgreSQL 16 |
| 迁移后 | `postgres:18` | `dushixiang/next-terminal:latest-pg18` | PostgreSQL 18 |

## 1. 确认当前版本

进入 `docker-compose.yaml` 所在目录，检查 PostgreSQL 服务端和 Next Terminal 镜像内置 client 的版本：

```shell
docker compose exec -T postgresql postgres --version
docker compose exec -T next-terminal pg_dump --version
```

继续迁移前，请确认两条命令都输出 PostgreSQL 16。如果已经是 PostgreSQL 18，则不需要执行本指南。

## 2. 通过系统页面创建备份

1. 以管理员身份登录 Next Terminal。
2. 进入“系统设置 → 系统维护 → 备份与恢复”。
3. 点击“立即备份”。
4. 等待备份任务成功完成。
5. 在备份列表中点击下载按钮，将 `.ntbak` 文件下载到本地并妥善保存。

::: warning 进入维护窗口
系统备份可以在线执行，但备份完成后产生的新数据不会包含在该备份中。备份完成后请勿再修改系统数据，并尽快执行后续停机步骤。
:::

`.ntbak` 包含 PostgreSQL 数据库以及 CA 证书和私钥，不包含录屏文件和 Windows 挂载盘文件。这些文件仍保留在部署目录的 `data/recordings` 和 `data/drive` 中，建议在迁移前另外备份。

## 3. 备份 Compose 配置并停止服务

保存当前 PostgreSQL 16 Compose 配置，以便迁移失败时回滚：

```shell
cp docker-compose.yaml docker-compose.pg16.yaml
```

停止全部容器。不要添加 `-v` 参数：

```shell
docker compose down
```

将原 PostgreSQL 16 数据目录改名保留：

```shell
mv data/postgresql data/postgresql-pg16-backup
```

执行前请确认 `data/postgresql-pg16-backup` 不存在。如果该目录已经存在，请使用其他备份目录名。

## 4. 切换到 PostgreSQL 18 镜像

编辑 `docker-compose.yaml`，同时更新 PostgreSQL 和 Next Terminal 服务。

PostgreSQL 服务使用 `postgres:18`，并将容器内卷挂载路径修改为 `/var/lib/postgresql`：

```yaml
postgresql:
  container_name: postgresql
  image: postgres:18
  environment:
    POSTGRES_DB: next-terminal
    POSTGRES_USER: next-terminal
    POSTGRES_PASSWORD: next-terminal
  volumes:
    - ./data/postgresql:/var/lib/postgresql
  restart: always
```

::: tip 中国大陆镜像加速
中国大陆环境可以将 `postgres:18` 替换为阿里云加速镜像：

```yaml
image: registry.cn-beijing.aliyuncs.com/dushixiang/postgres:18
```
:::

Next Terminal 服务改用内置 PostgreSQL 18 client 的镜像：

```yaml
next-terminal:
  image: dushixiang/next-terminal:latest-pg18
```

::: tip 中国大陆镜像加速
中国大陆环境可以使用 Next Terminal 的阿里云加速镜像：

```yaml
next-terminal:
  image: registry.cn-beijing.aliyuncs.com/dushixiang/next-terminal:latest-pg18
```
:::

::: warning 数据卷路径
PostgreSQL 18 官方容器镜像调整了默认数据目录布局。使用 `postgres:18` 时，请同时将容器内的卷挂载路径更新为 `/var/lib/postgresql`，不要继续挂载到 `/var/lib/postgresql/data`。
:::

拉取新镜像并启动服务：

```shell
docker compose pull postgresql next-terminal
docker compose up -d
```

确认 PostgreSQL 18 和 PostgreSQL client 18 均已生效：

```shell
docker compose exec -T postgresql postgres --version
docker compose exec -T next-terminal pg_restore --version
```

## 5. 初始化临时管理员并恢复备份

PostgreSQL 18 使用的是全新数据库。访问 `http://{ip}:8088/setup`，按照页面提示创建一个临时管理员，然后登录 Next Terminal。

进入“系统设置 → 系统维护 → 备份与恢复”，点击“上传并恢复”，选择迁移前下载的 `.ntbak` 文件并确认恢复。

恢复操作会覆盖当前 PostgreSQL 18 数据库，临时管理员也会被原备份中的用户数据替换。等待页面提示恢复任务成功后，重启 Next Terminal：

```shell
docker compose restart next-terminal
```

## 6. 检查迁移结果

确认容器状态：

```shell
docker compose ps
```

检查数据库版本：

```shell
docker compose exec -T postgresql psql \
  -U next-terminal \
  -d next-terminal \
  -tAc "SHOW server_version;"
```

检查 PostgreSQL 和 Next Terminal 日志：

```shell
docker compose logs --tail=100 postgresql next-terminal
```

使用迁移前的管理员账号登录 Next Terminal，检查用户、资产、凭据和其他业务数据是否完整，同时确认录屏文件和 Windows 挂载盘文件仍可正常访问。

## 回滚到 PostgreSQL 16

如果迁移失败，请停止全部容器：

```shell
docker compose down
```

保留迁移过程中创建的 PostgreSQL 18 数据目录，并恢复原 PostgreSQL 16 数据目录和 Compose 配置：

```shell
mv data/postgresql data/postgresql-pg18-failed
mv data/postgresql-pg16-backup data/postgresql
cp docker-compose.pg16.yaml docker-compose.yaml
docker compose up -d
```

执行改名命令前，请确认目标目录不存在。恢复的 Compose 配置会重新使用 `postgres:16` 和内置 PostgreSQL 16 client 的 Next Terminal 镜像。

迁移成功后也建议保留 PostgreSQL 16 数据目录和 `.ntbak` 文件一段时间，确认系统稳定后再手动清理。
