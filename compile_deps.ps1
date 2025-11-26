$env:PATH = "C:\Program Files\Erlang OTP\bin;C:\Program Files\Elixir\bin;" + $env:PATH
Set-Location "c:\Users\arouz\Desktop\dev\siteflow-organic\backend"

Write-Host "Updating dependencies..."
mix deps.get

Write-Host "Compiling (skipping bcrypt)..."
mix deps.compile --except bcrypt_elixir

Write-Host "Compiling app..."
mix compile

Write-Host "Done!"
