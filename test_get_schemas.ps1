# Test get_ecto_schemas tool
$body = @{
    jsonrpc = "2.0"
    method = "tools/call"
    id = 2
    params = @{
        name = "get_ecto_schemas"
        arguments = @{}
    }
} | ConvertTo-Json -Depth 5

Write-Host "Calling get_ecto_schemas tool..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/tidewave/mcp" -Method POST -Body $body -ContentType "application/json"
    Write-Host "`nStatus Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $json = $response.Content | ConvertFrom-Json
    $json.result.content | ConvertTo-Json -Depth 10
} catch {
    Write-Host "`nError: $_" -ForegroundColor Red
}
