$env:PATH = "C:\Program Files\Erlang OTP\bin;C:\Program Files\Elixir\bin;" + $env:PATH
Set-Location "c:\Users\arouz\Desktop\dev\siteflow-organic\backend"

Write-Host "Installing Ash Framework with Igniter..."
mix igniter.install ash ash_postgres ash_phoenix ash_json_api ash_authentication ash_authentication_phoenix --yes

Write-Host "Installing AshTypescript..."
mix igniter.install ash_typescript --framework react --yes

Write-Host "Ash Framework installed!"
