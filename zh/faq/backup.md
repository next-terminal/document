# 系统备份与恢复

Next Terminal 已内置备份与恢复功能。管理员登录后，进入“系统设置 → 系统维护 → 备份与恢复”即可操作，无需下载或运行额外的备份脚本。

## 备份内容

系统备份文件使用 `.ntbak` 格式，包含：

- PostgreSQL 数据库
- CA 证书与私钥

备份不包含录屏文件和 Windows 挂载盘文件。如需完整备份部署数据，请另外备份 `data/recordings` 和 `data/drive`。

## 手动备份

1. 进入“系统设置 → 系统维护 → 备份与恢复”。
2. 点击“立即备份”。
3. 等待备份任务完成。
4. 在备份列表中下载生成的 `.ntbak` 文件，并将其保存到部署服务器之外的安全位置。

本地备份文件默认保存在 `data/backups`。建议下载一份副本，避免服务器或磁盘故障导致备份与原始数据同时丢失。

## 定时备份与远端存储

在“备份与恢复”页面可以设置：

- 是否启用定时备份
- 每日备份时间
- 自动备份保留天数
- 备份成功后上传到 S3、SFTP 或 WebDAV

启用远端上传前，请先测试连接，并确认远端目录有足够的存储空间。

## 恢复备份

可以通过以下两种方式恢复：

- 在备份列表中选择已有文件并点击恢复按钮。
- 点击“上传并恢复”，从本地选择 `.ntbak` 文件。

::: danger 恢复会覆盖当前数据库
恢复操作会覆盖当前 PostgreSQL 数据库。系统会在恢复前自动创建一份安全备份，但仍建议先下载并保管当前备份。
:::

恢复完成后，重启 Next Terminal：

```shell
docker compose restart next-terminal
```

## PostgreSQL client 版本

系统通过 Next Terminal 镜像内置的 `pg_dump` 和 `pg_restore` 执行数据库备份与恢复。Next Terminal 镜像必须与 PostgreSQL 服务端主版本匹配：

| PostgreSQL 服务端 | Next Terminal 镜像 | 内置 client |
| --- | --- | --- |
| PostgreSQL 16 | `dushixiang/next-terminal:latest` | PostgreSQL 16 |
| PostgreSQL 18 | `dushixiang/next-terminal:latest-pg18` | PostgreSQL 18 |

如果需要将 PostgreSQL 16 迁移到 PostgreSQL 18，请参考[从 PostgreSQL 16 迁移到 PostgreSQL 18](/zh/faq/postgresql-16-to-18)。
