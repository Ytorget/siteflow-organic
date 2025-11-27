# Test execute_sql_query tool
$body = @{
    jsonrpc = "2.0"
    method = "tools/call"
    id = 3
    params = @{
        name = "execute_sql_query"
        arguments = @{
            query = "SELECT id::text, email, role FROM users LIMIT 5"
        }
    }
} | ConvertTo-Json -Depth 5

Write-Host "Executing SQL query against Backend.Repo..." -ForegroundColor Cyan
Write-Host "Query: SELECT id::text, email, role FROM users LIMIT 5`n" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/tidewave/mcp" -Method POST -Body $body -ContentType "application/json"
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "`nResponse:" -ForegroundColor Yellow
    $json = $response.Content | ConvertFrom-Json
    $json.result.content | ConvertTo-Json -Depth 10
} catch {
    Write-Host "`nError: $_" -ForegroundColor Red
}
