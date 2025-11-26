$env:PATH = "C:\Program Files\Erlang OTP\bin;C:\Program Files\Elixir\bin;" + $env:PATH
Set-Location "c:\Users\arouz\Desktop\dev\siteflow-organic\backend"

Write-Host "Getting Ash Framework dependencies..."
mix deps.get

Write-Host "Compiling dependencies..."
mix deps.compile

Write-Host "Done!"
