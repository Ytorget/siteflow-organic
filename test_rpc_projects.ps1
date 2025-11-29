# Quick test to see RPC response format
$baseUrl = "http://localhost:4000"

# Login
$loginBody = @{
    user = @{
        email = "admin@siteflow.se"
        password = "AdminPassword123!"
    }
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/sign-in" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token

Write-Host "Token: $($token.Substring(0,20))...`n"

# Fetch projects
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$rpcBody = @{
    resource = "Project"
    action = "project_read"
    input = @{}
    fields = @("id", "name", "description", "state", "budget")
} | ConvertTo-Json -Depth 5

Write-Host "Sending RPC request..."
$projectsResponse = Invoke-RestMethod -Uri "$baseUrl/api/rpc/run" -Method POST -Headers $headers -Body $rpcBody

Write-Host "`nFull Response:"
$projectsResponse | ConvertTo-Json -Depth 10
