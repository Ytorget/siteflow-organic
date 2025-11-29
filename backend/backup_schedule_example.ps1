# Example: Schedule daily backups using Windows Task Scheduler
#
# This script creates a scheduled task to run daily backups at 2 AM.
# Run this script once to set up automatic backups.
#
# Usage:
#   .\backup_schedule_example.ps1

$ScriptPath = Join-Path $PSScriptRoot "backup_database.ps1"
$TaskName = "Siteflow Database Backup"
$TaskDescription = "Daily backup of Siteflow PostgreSQL database"

# Create the scheduled task action
$Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$ScriptPath`" -Compress -RetentionDays 30"

# Create the trigger (daily at 2 AM)
$Trigger = New-ScheduledTaskTrigger -Daily -At 2am

# Create task settings
$Settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -RunOnlyIfNetworkAvailable

# Register the scheduled task
try {
    Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description $TaskDescription -Force
    Write-Host "Scheduled task '$TaskName' created successfully!" -ForegroundColor Green
    Write-Host "Backups will run daily at 2:00 AM" -ForegroundColor Green
} catch {
    Write-Host "Failed to create scheduled task: $_" -ForegroundColor Red
    exit 1
}

# Verify the task was created
$Task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($Task) {
    Write-Host "`nScheduled Task Details:" -ForegroundColor Cyan
    Write-Host "Name: $($Task.TaskName)" -ForegroundColor White
    Write-Host "State: $($Task.State)" -ForegroundColor White
    Write-Host "Next Run Time: $($Task.NextRunTime)" -ForegroundColor White
} else {
    Write-Host "Warning: Task was not found after registration!" -ForegroundColor Yellow
}
