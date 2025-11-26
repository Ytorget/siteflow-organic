Write-Host "=== Testing API ===" -ForegroundColor Cyan

Write-Host "`n1. Testing health endpoint..." -ForegroundColor Yellow
$health = Invoke-WebRequest -Uri 'http://localhost:3000/api/health' -UseBasicParsing
Write-Host "Health: $($health.Content)" -ForegroundColor Green

Write-Host "`n2. Testing user registration..." -ForegroundColor Yellow
$registerBody = @{
    user = @{
        email = "test@example.com"
        password = "testpassword123"
        password_confirmation = "testpassword123"
        first_name = "Test"
        last_name = "User"
    }
} | ConvertTo-Json -Depth 3

try {
    $register = Invoke-WebRequest -Uri 'http://localhost:3000/api/auth/password/register' -Method POST -Body $registerBody -ContentType 'application/json' -UseBasicParsing
    Write-Host "Registration successful!" -ForegroundColor Green
    Write-Host $register.Content
} catch {
    Write-Host "Registration response:" -ForegroundColor Yellow
    Write-Host $_.Exception.Response.StatusCode
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $reader.BaseStream.Position = 0
    $reader.DiscardBufferedData()
    Write-Host $reader.ReadToEnd()
}

Write-Host "`n=== API Test Complete ===" -ForegroundColor Cyan
