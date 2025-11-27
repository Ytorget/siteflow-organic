$env:PATH = "C:\Program Files\Erlang OTP\bin;C:\Program Files\Elixir\bin;" + $env:PATH
$env:ERL_FLAGS = "-sname localhost"
$env:MIX_ENV = "test"
Set-Location "c:\Users\arouz\Desktop\dev\siteflow-organic\backend"

Write-Host "Resetting test database..." -ForegroundColor Yellow

Write-Host "Dropping test database..." -ForegroundColor Cyan
mix ecto.drop --force-drop
# Ignore drop errors if database doesn't exist

Write-Host "Creating test database..." -ForegroundColor Cyan
mix ecto.create

Write-Host "Running migrations..." -ForegroundColor Cyan
mix ecto.migrate

Write-Host "Test database reset complete!" -ForegroundColor Green
