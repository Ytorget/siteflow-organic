# Test att servern returnerar korrekt felmeddelande
$ErrorActionPreference = "Continue"
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

# Hamta projekt
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$rpcBody = @{
    resource = "Project"
    action = "project_read"
    input = @{}
    fields = @("id", "name")
} | ConvertTo-Json -Depth 5

$projectsResponse = Invoke-RestMethod -Uri "$baseUrl/api/rpc/run" -Method POST -Headers $headers -Body $rpcBody
$projectId = $projectsResponse.data[0].id

# Skapa testfil
$testFilePath = "$env:TEMP\test-upload.txt"
Set-Content -Path $testFilePath -Value "Test content"

# Testa upload (kommer att misslyckas pga S3)
Add-Type -AssemblyName System.Net.Http
$multipartContent = New-Object System.Net.Http.MultipartFormDataContent

$fileStream = [System.IO.File]::OpenRead($testFilePath)
$fileContent = New-Object System.Net.Http.StreamContent($fileStream)
$fileContent.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::Parse("text/plain")
$multipartContent.Add($fileContent, "file", "test.txt")

$multipartContent.Add((New-Object System.Net.Http.StringContent($projectId)), "project_id")
$multipartContent.Add((New-Object System.Net.Http.StringContent("other")), "category")
$multipartContent.Add((New-Object System.Net.Http.StringContent("Test")), "name")

$httpClient = New-Object System.Net.Http.HttpClient
$httpClient.DefaultRequestHeaders.Add("Authorization", "Bearer $token")

try {
    $response = $httpClient.PostAsync("$baseUrl/api/documents/upload", $multipartContent).Result
    $responseBody = $response.Content.ReadAsStringAsync().Result

    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Response Body:"
    $responseBody | ConvertFrom-Json | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: $_"
} finally {
    $fileStream.Close()
    $httpClient.Dispose()
    Remove-Item $testFilePath -ErrorAction SilentlyContinue
}
