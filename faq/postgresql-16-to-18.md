# Migrate from PostgreSQL 16 to PostgreSQL 18

The current Next Terminal container installation uses PostgreSQL 18 by default. If an existing deployment still uses PostgreSQL 16, export the data with the built-in system backup, create a PostgreSQL 18 database, and restore the backup.

::: danger Do not replace the PostgreSQL image directly
A PostgreSQL major-version upgrade cannot be performed by changing `postgres:16` directly to `postgres:18`. PostgreSQL 18 cannot use a PostgreSQL 16 data directory directly.

Until the migration has been verified, do not delete the original PostgreSQL 16 data directory or the `.ntbak` backup, and do not run `docker compose down -v`.
:::

This guide applies to Next Terminal installations using the official `docker-compose.yaml`. If you changed the service name, database credentials, data directory, or volume mounts, adjust the commands for your configuration.

## Images and PostgreSQL Client Versions

The system backup uses `pg_dump` and `pg_restore` included in the Next Terminal image. The Next Terminal image must match the database major version before and after migration:

| Migration stage | PostgreSQL image | Next Terminal image | Included client |
| --- | --- | --- | --- |
| Before migration | `postgres:16` | `dushixiang/next-terminal:latest` | PostgreSQL 16 |
| After migration | `postgres:18` | `dushixiang/next-terminal:latest-pg18` | PostgreSQL 18 |

If you use the Alibaba Cloud registry, keep the existing registry hostname and change only the Next Terminal tag from `latest` to `latest-pg18`.

## 1. Check the Current Versions

In the directory containing `docker-compose.yaml`, check the PostgreSQL server and the client included in the Next Terminal image:

```shell
docker compose exec -T postgresql postgres --version
docker compose exec -T next-terminal pg_dump --version
```

Before continuing, confirm that both commands report PostgreSQL 16. If they already report PostgreSQL 18, you do not need this guide.

## 2. Create a Backup in the System UI

1. Sign in to Next Terminal as an administrator.
2. Open **System Settings → System Maintenance → Backup & Restore**.
3. Click **Back Up Now**.
4. Wait for the backup task to complete successfully.
5. Click the download button in the backup list and save the `.ntbak` file locally.

::: warning Enter a maintenance window
The backup can run while the system is online, but data created after it finishes will not be included. Do not modify system data after the backup, and proceed to the shutdown steps as soon as possible.
:::

The `.ntbak` package contains the PostgreSQL database and CA certificates and keys. It excludes session recordings and Windows mounted-drive files. These files remain in `data/recordings` and `data/drive`; back them up separately before migration.

## 3. Save the Compose Configuration and Stop the Services

Save the current PostgreSQL 16 Compose configuration for rollback:

```shell
cp docker-compose.yaml docker-compose.pg16.yaml
```

Stop all containers. Do not add the `-v` option:

```shell
docker compose down
```

Rename and preserve the original PostgreSQL 16 data directory:

```shell
mv data/postgresql data/postgresql-pg16-backup
```

Before running the command, make sure `data/postgresql-pg16-backup` does not already exist. If it does, choose a different backup directory name.

## 4. Switch to the PostgreSQL 18 Images

Edit `docker-compose.yaml` and update both the PostgreSQL and Next Terminal services.

Use `postgres:18` for PostgreSQL and change the container volume target to `/var/lib/postgresql`:

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

Use the Next Terminal image that includes the PostgreSQL 18 client:

```yaml
next-terminal:
  image: dushixiang/next-terminal:latest-pg18
```

::: warning Data volume path
The official PostgreSQL 18 container image uses a new default data-directory layout. When using `postgres:18`, update the container volume target to `/var/lib/postgresql`; do not keep mounting it at `/var/lib/postgresql/data`.
:::

Pull the new images and start the services:

```shell
docker compose pull postgresql next-terminal
docker compose up -d
```

Confirm that PostgreSQL 18 and the PostgreSQL 18 client are active:

```shell
docker compose exec -T postgresql postgres --version
docker compose exec -T next-terminal pg_restore --version
```

## 5. Initialize a Temporary Administrator and Restore the Backup

PostgreSQL 18 starts with a new database. Visit `http://{ip}:8088/setup`, create a temporary administrator as prompted, and sign in to Next Terminal.

Open **System Settings → System Maintenance → Backup & Restore**, click **Upload and Restore**, select the `.ntbak` file downloaded before migration, and confirm the restore.

The restore overwrites the current PostgreSQL 18 database, replacing the temporary administrator with the users from the backup. When the page reports that the restore task succeeded, restart Next Terminal:

```shell
docker compose restart next-terminal
```

## 6. Verify the Migration

Check the container status:

```shell
docker compose ps
```

Confirm the database version:

```shell
docker compose exec -T postgresql psql \
  -U next-terminal \
  -d next-terminal \
  -tAc "SHOW server_version;"
```

Review the PostgreSQL and Next Terminal logs:

```shell
docker compose logs --tail=100 postgresql next-terminal
```

Sign in with an administrator account from before the migration. Verify users, assets, credentials, and other application data, and confirm that session recordings and Windows mounted-drive files remain accessible.

## Roll Back to PostgreSQL 16

If the migration fails, stop all containers:

```shell
docker compose down
```

Preserve the PostgreSQL 18 data directory, then restore the PostgreSQL 16 directory and Compose configuration:

```shell
mv data/postgresql data/postgresql-pg18-failed
mv data/postgresql-pg16-backup data/postgresql
cp docker-compose.pg16.yaml docker-compose.yaml
docker compose up -d
```

Before renaming directories, make sure the destination paths do not already exist. The restored Compose configuration switches back to `postgres:16` and the Next Terminal image containing the PostgreSQL 16 client.

Even after a successful migration, keep the PostgreSQL 16 data directory and `.ntbak` file for a while. Remove them manually only after the system has remained stable.
