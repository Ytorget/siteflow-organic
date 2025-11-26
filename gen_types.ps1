$env:PATH = "C:\Program Files\Erlang OTP\bin;C:\Program Files\Elixir\bin;" + $env:PATH
Set-Location "c:\Users\arouz\Desktop\dev\siteflow-organic\backend"

Write-Host "=== Compiling backend ===" -ForegroundColor Cyan
mix compile

Write-Host "=== Generating TypeScript types ===" -ForegroundColor Cyan
mix ash_typescript.codegen
