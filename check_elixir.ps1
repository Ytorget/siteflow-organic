$env:PATH = "C:\Program Files\Erlang OTP\bin;C:\Program Files\Elixir\bin;" + $env:PATH
Write-Host "Checking Elixir..."
elixir --version
Write-Host "Checking Mix..."
mix --version
