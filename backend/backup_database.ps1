# PostgreSQL Database Backup Script
# This script creates a backup of the PostgreSQL database for the Siteflow backend.
#
# Usage:
#   .\backup_database.ps1                    # Create backup with default settings
#   .\backup_database.ps1 -BackupDir "path"  # Specify custom backup directory
#   .\backup_database.ps1 -Compress          # Create compressed backup

param(
    [string]$BackupDir = ".\backups",
    [switch]$Compress = $false,
    [int]$RetentionDays = 30
)

# Configuration
$DBName = "siteflow_dev"
$DBUser = "postgres"
$DBHost = "localhost"
$DBPort = "5432"

# Create backup directory if it doesn't exist
if (-not (Test-Path $BackupDir)) {
    Write-Host "Creating backup directory: $BackupDir" -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

# Generate backup filename with timestamp
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFileName = "${DBName}_backup_${Timestamp}"

if ($Compress) {
    $BackupFilePath = Join-Path $BackupDir "${BackupFileName}.sql.gz"
    Write-Host "Creating compressed backup: $BackupFilePath" -ForegroundColor Cyan

    # Create compressed backup
    $env:PGPASSWORD = "postgres"
    pg_dump -h $DBHost -p $DBPort -U $DBUser -F p $DBName | gzip > $BackupFilePath
    Remove-Item Env:\PGPASSWORD
} else {
    $BackupFilePath = Join-Path $BackupDir "${BackupFileName}.sql"
    Write-Host "Creating backup: $BackupFilePath" -ForegroundColor Cyan

    # Create backup
    $env:PGPASSWORD = "postgres"
    pg_dump -h $DBHost -p $DBPort -U $DBUser -F p -f $BackupFilePath $DBName
    Remove-Item Env:\PGPASSWORD
}

# Check if backup was successful
if (Test-Path $BackupFilePath) {
    $FileSize = (Get-Item $BackupFilePath).Length
    $FileSizeMB = [math]::Round($FileSize / 1MB, 2)
    Write-Host "Backup created successfully!" -ForegroundColor Green
    Write-Host "File: $BackupFilePath" -ForegroundColor Green
    Write-Host "Size: ${FileSizeMB} MB" -ForegroundColor Green

    # Clean up old backups
    Write-Host "`nCleaning up backups older than $RetentionDays days..." -ForegroundColor Cyan
    $CutoffDate = (Get-Date).AddDays(-$RetentionDays)
    Get-ChildItem -Path $BackupDir -Filter "${DBName}_backup_*.sql*" |
        Where-Object { $_.LastWriteTime -lt $CutoffDate } |
        ForEach-Object {
            Write-Host "Deleting old backup: $($_.Name)" -ForegroundColor Yellow
            Remove-Item $_.FullName
        }

    Write-Host "`nBackup completed successfully!" -ForegroundColor Green
} else {
    Write-Host "Backup failed!" -ForegroundColor Red
    exit 1
}
