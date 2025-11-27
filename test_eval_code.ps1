# Test project_eval tool
$body = @{
    jsonrpc = "2.0"
    method = "tools/call"
    id = 4
    params = @{
        name = "project_eval"
        arguments = @{
            code = @"
# Count records in each Portal resource
resources = [
  {"Users", Backend.Accounts.User},
  {"Companies", Backend.Portal.Company},
  {"Projects", Backend.Portal.Project},
  {"Tickets", Backend.Portal.Ticket},
  {"Meetings", Backend.Portal.Meeting}
]

Enum.map(resources, fn {name, resource} ->
  count = Ash.count!(resource)
  {name, count}
end)
|> Enum.map(fn {name, count} -> "#{name}: #{count}" end)
|> Enum.join("\n")
"@
        }
    }
} | ConvertTo-Json -Depth 5

Write-Host "Evaluating Elixir code in the running Phoenix application..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/tidewave/mcp" -Method POST -Body $body -ContentType "application/json"
    Write-Host "`nStatus Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $json = $response.Content | ConvertFrom-Json
    Write-Host "`n$($json.result.content[0].text)" -ForegroundColor Green
} catch {
    Write-Host "`nError: $_" -ForegroundColor Red
}
