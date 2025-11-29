# Database Backup & Restore

This directory contains scripts for backing up and restoring the Siteflow PostgreSQL database.

## Prerequisites

- PostgreSQL installed and `pg_dump`, `psql` available in PATH
- PowerShell 5.1 or later
- Sufficient disk space for backups

## Scripts

### `backup_database.ps1`

Creates a backup of the PostgreSQL database.

**Basic Usage:**
```powershell
.\backup_database.ps1
```

**Options:**
- `-BackupDir "path"` - Custom backup directory (default: `.\backups`)
- `-Compress` - Create compressed backup (`.sql.gz` format)
- `-RetentionDays N` - Keep backups for N days (default: 30)

**Examples:**
```powershell
# Basic backup
.\backup_database.ps1

# Compressed backup
.\backup_database.ps1 -Compress

# Custom directory and retention
.\backup_database.ps1 -BackupDir "D:\Backups" -Compress -RetentionDays 60
```

### `restore_database.ps1`

Restores the database from a backup file.

**Usage:**
```powershell
.\restore_database.ps1 -BackupFile "path\to\backup.sql"
```

**⚠️ WARNING:** This will drop and recreate the entire database!

**Examples:**
```powershell
# Restore from regular backup
.\restore_database.ps1 -BackupFile ".\backups\siteflow_dev_backup_20250127_140530.sql"

# Restore from compressed backup
.\restore_database.ps1 -BackupFile ".\backups\siteflow_dev_backup_20250127_140530.sql.gz"
```

### `backup_schedule_example.ps1`

Sets up automatic daily backups using Windows Task Scheduler.

**Usage:**
```powershell
.\backup_schedule_example.ps1
```

This creates a scheduled task that runs daily at 2:00 AM with:
- Compressed backups
- 30-day retention period

## Backup Strategy Recommendations

### Development Environment
- **Frequency:** Daily backups
- **Retention:** 7-30 days
- **Compression:** Recommended
- **Schedule:** Off-hours (2-4 AM)

### Production Environment
- **Frequency:**
  - Full backup: Daily
  - Incremental backup: Every 4-6 hours
- **Retention:**
  - Daily backups: 30 days
  - Weekly backups: 12 weeks
  - Monthly backups: 12 months
- **Compression:** Strongly recommended
- **Schedule:** Off-peak hours
- **Offsite Storage:** Copy backups to cloud storage (AWS S3, Azure Blob Storage)

## Backup File Naming Convention

Backups are automatically named with timestamps:
```
{database_name}_backup_{YYYYMMDD}_{HHmmss}.sql[.gz]
```

Example:
```
siteflow_dev_backup_20250127_140530.sql
siteflow_dev_backup_20250127_140530.sql.gz
```

## Automatic Cleanup

The backup script automatically removes backups older than the retention period to save disk space.

## Testing Backups

It's crucial to periodically test that backups can be restored successfully:

1. Create a test backup:
   ```powershell
   .\backup_database.ps1 -Compress
   ```

2. Restore to a test database (modify `restore_database.ps1` to use a test DB):
   ```powershell
   # Edit restore_database.ps1: Change $DBName to "siteflow_test"
   .\restore_database.ps1 -BackupFile "path\to\backup.sql.gz"
   ```

3. Verify the restored data is complete and correct

## Troubleshooting

### "pg_dump: command not found"
- Ensure PostgreSQL is installed
- Add PostgreSQL bin directory to PATH

### "Permission denied"
- Verify database credentials
- Check that the PostgreSQL user has backup permissions

### Backup file is empty or very small
- Check disk space
- Verify database connection settings
- Ensure the database contains data

## Security Notes

- **Never commit backups to version control**
- Add `backups/` to `.gitignore`
- Encrypt backups containing sensitive data
- Secure backup storage with appropriate access controls
- Use strong passwords for database access
