# PostgreSQL Database Restore Script
# This script restores the PostgreSQL database from a backup file.
#
# Usage:
#   .\restore_database.ps1 -BackupFile "path\to\backup.sql"
#   .\restore_database.ps1 -BackupFile "path\to\backup.sql.gz"

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile
)

# Configuration
$DBName = "siteflow_dev"
$DBUser = "postgres"
$DBHost = "localhost"
$DBPort = "5432"

# Check if backup file exists
if (-not (Test-Path $BackupFile)) {
    Write-Host "Error: Backup file not found: $BackupFile" -ForegroundColor Red
    exit 1
}

# Confirm restore operation
Write-Host "WARNING: This will restore the database from backup." -ForegroundColor Yellow
Write-Host "Database: $DBName" -ForegroundColor Yellow
Write-Host "Backup file: $BackupFile" -ForegroundColor Yellow
$Confirm = Read-Host "Are you sure you want to continue? (yes/no)"

if ($Confirm -ne "yes") {
    Write-Host "Restore cancelled." -ForegroundColor Yellow
    exit 0
}

# Drop and recreate database
Write-Host "`nDropping existing database..." -ForegroundColor Cyan
$env:PGPASSWORD = "postgres"
psql -h $DBHost -p $DBPort -U $DBUser -c "DROP DATABASE IF EXISTS $DBName;" postgres
psql -h $DBHost -p $DBPort -U $DBUser -c "CREATE DATABASE $DBName;" postgres

# Restore from backup
if ($BackupFile -like "*.gz") {
    Write-Host "Restoring from compressed backup..." -ForegroundColor Cyan
    gzip -dc $BackupFile | psql -h $DBHost -p $DBPort -U $DBUser $DBName
} else {
    Write-Host "Restoring from backup..." -ForegroundColor Cyan
    psql -h $DBHost -p $DBPort -U $DBUser -f $BackupFile $DBName
}

Remove-Item Env:\PGPASSWORD

# Check if restore was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "`nDatabase restored successfully!" -ForegroundColor Green
} else {
    Write-Host "`nRestore failed!" -ForegroundColor Red
    exit 1
}
