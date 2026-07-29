# System Backup and Restore

Next Terminal includes built-in backup and restore. After signing in as an administrator, open **System Settings → System Maintenance → Backup & Restore**. No external backup script is required.

## Backup Contents

System backup files use the `.ntbak` format and include:

- The PostgreSQL database
- CA certificates and private keys

Backups exclude session recordings and Windows mounted-drive files. To back up all deployment data, also back up `data/recordings` and `data/drive` separately.

## Manual Backup

1. Open **System Settings → System Maintenance → Backup & Restore**.
2. Click **Back Up Now**.
3. Wait for the backup task to finish.
4. Download the generated `.ntbak` file from the backup list and store it safely outside the deployment server.

Local backup files are stored in `data/backups` by default. Keep a downloaded copy so that a server or disk failure does not destroy both the original data and its backups.

## Scheduled Backups and Remote Storage

The **Backup & Restore** page lets you configure:

- Scheduled backups
- The daily backup time
- Automatic-backup retention
- Uploading successful backups to S3, SFTP, or WebDAV

Test the connection before enabling remote uploads, and make sure the remote destination has sufficient storage space.

## Restore a Backup

You can restore a backup in either of these ways:

- Select an existing file in the backup list and click its restore button.
- Click **Upload and Restore** and select a local `.ntbak` file.

::: danger Restoring overwrites the current database
A restore overwrites the current PostgreSQL database. The system automatically creates a safety backup before restoring, but you should still download and retain a current backup first.
:::

After the restore finishes, restart Next Terminal:

```shell
docker compose restart next-terminal
```

## PostgreSQL Client Version

The system runs database backups and restores with `pg_dump` and `pg_restore` included in the Next Terminal image. The Next Terminal image must match the PostgreSQL server major version:

| PostgreSQL server | Next Terminal image | Included client |
| --- | --- | --- |
| PostgreSQL 16 | `dushixiang/next-terminal:latest` | PostgreSQL 16 |
| PostgreSQL 18 | `dushixiang/next-terminal:latest-pg18` | PostgreSQL 18 |

To migrate from PostgreSQL 16 to PostgreSQL 18, see [Migrate from PostgreSQL 16 to PostgreSQL 18](/faq/postgresql-16-to-18).
