$env:PATH = "C:\Program Files\Erlang OTP\bin;C:\Program Files\Elixir\bin;" + $env:PATH
Set-Location "c:\Users\arouz\Desktop\dev\siteflow-organic\backend"

Write-Host "=== Testing Siteflow Backend ===" -ForegroundColor Cyan

Write-Host "`n1. Checking compilation..." -ForegroundColor Yellow
mix compile
if ($LASTEXITCODE -ne 0) {
    Write-Host "Compilation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Compilation OK!" -ForegroundColor Green

Write-Host "`n2. Creating database..." -ForegroundColor Yellow
Write-Host "   (Make sure PostgreSQL is running on localhost:5432)" -ForegroundColor Gray
mix ecto.create
if ($LASTEXITCODE -ne 0) {
    Write-Host "Database creation failed - is PostgreSQL running?" -ForegroundColor Red
    Write-Host "   Default credentials: postgres/postgres on localhost:5432" -ForegroundColor Gray
    exit 1
}
Write-Host "Database created!" -ForegroundColor Green

Write-Host "`n3. Generating migrations..." -ForegroundColor Yellow
mix ash_postgres.generate_migrations --name initial_setup
Write-Host "Migrations generated!" -ForegroundColor Green

Write-Host "`n4. Running migrations..." -ForegroundColor Yellow
mix ecto.migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "Migration failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Migrations complete!" -ForegroundColor Green

Write-Host "`n=== Backend Ready! ===" -ForegroundColor Cyan
Write-Host "Start the server with: mix phx.server" -ForegroundColor White
Write-Host "API will be available at: http://localhost:4000" -ForegroundColor White
Write-Host "`nEndpoints:" -ForegroundColor Yellow
Write-Host "  POST /api/auth/password/register - Register user" -ForegroundColor Gray
Write-Host "  POST /api/auth/password/sign_in  - Login" -ForegroundColor Gray
Write-Host "  GET  /api/health                 - Health check" -ForegroundColor Gray
Write-Host "  GET  /api/portal/*               - Portal API (requires auth)" -ForegroundColor Gray
