$env:PATH = "C:\Program Files\Erlang OTP\bin;C:\Program Files\Elixir\bin;" + $env:PATH
$env:ERL_FLAGS = "-sname localhost"
$env:MIX_ENV = "test"
Set-Location "c:\Users\arouz\Desktop\dev\siteflow-organic\backend"

Write-Host "Running all tests..." -ForegroundColor Yellow
mix test --color
