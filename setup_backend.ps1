$env:PATH = "C:\Program Files\Erlang OTP\bin;C:\Program Files\Elixir\bin;" + $env:PATH
Set-Location "c:\Users\arouz\Desktop\dev\siteflow-organic"

Write-Host "Installing Hex..."
mix local.hex --force

Write-Host "Installing Phoenix generators..."
mix archive.install hex phx_new --force

Write-Host "Creating Phoenix backend project..."
mix phx.new backend --no-html --no-assets --no-mailer

Write-Host "Done! Now cd into backend and run: mix igniter.install ash ash_postgres ash_phoenix ash_typescript"
