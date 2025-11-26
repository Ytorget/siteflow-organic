$env:PATH = "C:\Program Files\Erlang OTP\bin;C:\Program Files\Elixir\bin;" + $env:PATH
Set-Location "c:\Users\arouz\Desktop\dev\siteflow-organic\backend"

Write-Host "Getting dependencies..."
mix deps.get

Write-Host "Compiling backend..."
mix compile

Write-Host "Done!"
