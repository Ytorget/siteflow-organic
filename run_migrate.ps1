$env:PATH = "C:\Program Files\Erlang OTP\bin;C:\Program Files\Elixir\bin;" + $env:PATH
Set-Location "c:\Users\arouz\Desktop\dev\siteflow-organic\backend"

Write-Host "=== Generating Ash migrations ===" -ForegroundColor Cyan
mix ash.codegen create_initial_schema

Write-Host "`n=== Running migrations ===" -ForegroundColor Cyan
mix ecto.migrate
