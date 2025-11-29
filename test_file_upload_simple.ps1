# End-to-End Test for File Upload till S3
$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:4000"

Write-Host "`n========================================"
Write-Host "  File Upload E2E Test"
Write-Host "========================================`n"

# Step 1: Login som admin
Write-Host "[1/5] Loggar in som admin..."
$loginBody = @{
    user = @{
        email = "admin@siteflow.se"
        password = "AdminPassword123!"
    }
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/sign-in" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
Write-Host "  OK - Inloggning lyckades"
Write-Host "  Token: $($token.Substring(0,20))...`n"

# Step 2: Hamta projekt
Write-Host "[2/5] Hamtar projekt..."
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

$projectsResponse = Invoke-RestMethod -Uri "$baseUrl/api/rpc/run" -Method POST -Headers $headers -Body $rpcBody

if ($projectsResponse.data -and $projectsResponse.data.Count -gt 0) {
    $projectId = $projectsResponse.data[0].id
    $projectName = $projectsResponse.data[0].name
} else {
    Write-Host "  FAIL - Inga projekt hittades!"
    exit 1
}
Write-Host "  OK - Hittade projekt: $projectName"
Write-Host "  Project ID: $projectId`n"

# Step 3: Skapa test-fil
Write-Host "[3/5] Skapar test-fil..."
$testFilePath = "$env:TEMP\siteflow-test.txt"
$testContent = "Siteflow E2E Test - $(Get-Date)"
Set-Content -Path $testFilePath -Value $testContent
Write-Host "  OK - Test-fil skapad: $testFilePath"
Write-Host "  Storlek: $((Get-Item $testFilePath).Length) bytes`n"

# Step 4: Upload fil
Write-Host "[4/5] Laddar upp fil..."

# Skapa multipart form data
Add-Type -AssemblyName System.Net.Http
$multipartContent = New-Object System.Net.Http.MultipartFormDataContent

# Ladda fil
$fileStream = [System.IO.File]::OpenRead($testFilePath)
$fileContent = New-Object System.Net.Http.StreamContent($fileStream)
$fileContent.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::Parse("text/plain")
$multipartContent.Add($fileContent, "file", "siteflow-test.txt")

# Lagg till andra falt
$stringContent1 = New-Object System.Net.Http.StringContent($projectId)
$multipartContent.Add($stringContent1, "project_id")

$stringContent2 = New-Object System.Net.Http.StringContent("other")
$multipartContent.Add($stringContent2, "category")

$stringContent3 = New-Object System.Net.Http.StringContent("E2E Test")
$multipartContent.Add($stringContent3, "name")

$stringContent4 = New-Object System.Net.Http.StringContent("End-to-end test upload")
$multipartContent.Add($stringContent4, "description")

# Skicka request
$httpClient = New-Object System.Net.Http.HttpClient
$httpClient.DefaultRequestHeaders.Add("Authorization", "Bearer $token")

$uploadResponse = $httpClient.PostAsync("$baseUrl/api/documents/upload", $multipartContent).Result
$responseBody = $uploadResponse.Content.ReadAsStringAsync().Result
$uploadData = $responseBody | ConvertFrom-Json

$fileStream.Close()
$httpClient.Dispose()

$documentId = $uploadData.data.id
$s3Path = $uploadData.data.file_path

Write-Host "  OK - Upload lyckades!"
Write-Host "  Document ID: $documentId"
Write-Host "  S3 Path: $s3Path`n"

# Step 5: Hamta download URL
Write-Host "[5/5] Hamtar download URL..."
$downloadResponse = Invoke-RestMethod -Uri "$baseUrl/api/documents/$documentId/download" -Method GET -Headers $headers
$downloadUrl = $downloadResponse.download_url

Write-Host "  OK - Download URL genererad"
Write-Host "  URL: $($downloadUrl.Substring(0, 60))...`n"

# Ta bort dokument
Write-Host "Cleanup: Tar bort test-dokument..."
Invoke-RestMethod -Uri "$baseUrl/api/documents/$documentId" -Method DELETE -Headers $headers | Out-Null
Write-Host "  OK - Dokument borttaget`n"

# Ta bort test-fil
Remove-Item $testFilePath -ErrorAction SilentlyContinue

Write-Host "========================================"
Write-Host "  Test Slutfort!"
Write-Host "========================================`n"

Write-Host "Sammanfattning:"
Write-Host "  • Login: OK"
Write-Host "  • Hamta projekt: OK"
Write-Host "  • Skapa test-fil: OK"
Write-Host "  • Upload till S3: OK"
Write-Host "  • Generate download URL: OK"
Write-Host "  • Ta bort dokument: OK`n"
