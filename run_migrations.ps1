$env:PATH = "C:\Program Files\Erlang OTP\bin;C:\Program Files\Elixir\bin;" + $env:PATH
$env:ERL_FLAGS = "-sname localhost"
Set-Location "c:\Users\arouz\Desktop\dev\siteflow-organic\backend"

Write-Host "=== Running Migrations ===" -ForegroundColor Cyan

Write-Host "`n1. Generating migrations..." -ForegroundColor Yellow
mix ash_postgres.generate_migrations --name initial_setup --no-start

Write-Host "`n2. Running migrations..." -ForegroundColor Yellow
mix ecto.migrate

Write-Host "`nDone!" -ForegroundColor Green
