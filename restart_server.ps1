$env:PATH = "C:\Program Files\Erlang OTP\bin;C:\Program Files\Elixir\bin;" + $env:PATH
$env:PORT = "4000"  # Ensure server runs on port 4000 for Tidewave MCP
Set-Location "c:\Users\arouz\Desktop\dev\siteflow-organic\backend"

Write-Host "=== Updating dependencies ===" -ForegroundColor Cyan
mix deps.get

Write-Host "`n=== Compiling ===" -ForegroundColor Cyan
mix compile

Write-Host "`n=== Starting Siteflow Backend ===" -ForegroundColor Cyan
Write-Host "API: http://localhost:4000" -ForegroundColor Green
Write-Host "Tidewave MCP: http://localhost:4000/tidewave/mcp" -ForegroundColor Magenta
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

mix phx.server
