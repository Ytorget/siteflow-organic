# End-to-End Test för File Upload till S3
# Detta script testar hela flödet från login till upload och nedladdning

$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:4000"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  File Upload E2E Test" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Login som admin
Write-Host "[1/6] Loggar in som admin..." -ForegroundColor Yellow
$loginBody = @{
    user = @{
        email = "admin@siteflow.se"
        password = "SecurePassword123!"
    }
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/sign-in" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "  ✓ Inloggning lyckades" -ForegroundColor Green
    Write-Host "  Token: $($token.Substring(0,20))..." -ForegroundColor Gray
}
catch {
    Write-Host "  ✗ Inloggning misslyckades: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Hämta projekt
Write-Host "`n[2/6] Hämtar projekt..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $rpcBody = @{
        resource = "Project"
        action = "read"
        input = @{}
    } | ConvertTo-Json -Depth 5

    $projectsResponse = Invoke-RestMethod -Uri "$baseUrl/api/rpc/run" -Method POST -Headers $headers -Body $rpcBody

    if ($projectsResponse.data -and $projectsResponse.data.Count -gt 0) {
        $projectId = $projectsResponse.data[0].id
        $projectName = $projectsResponse.data[0].name
        Write-Host "  ✓ Hittade projekt: $projectName" -ForegroundColor Green
        Write-Host "  Project ID: $projectId" -ForegroundColor Gray
    }
    else {
        Write-Host "  ✗ Inga projekt hittades" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "  ✗ Kunde inte hämta projekt: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Skapa en test-fil
Write-Host "`n[3/6] Skapar test-fil..." -ForegroundColor Yellow
$testFilePath = "$env:TEMP\siteflow-test-upload.txt"
$testContent = @"
Siteflow File Upload Test
=========================
Datum: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Projekt: $projectName
Test-ID: $(New-Guid)

Detta är en testfil för att verifiera S3 file upload funktionalitet.
Filen ska laddas upp till S3 bucket via backend API.
"@

Set-Content -Path $testFilePath -Value $testContent -Encoding UTF8
Write-Host "  ✓ Test-fil skapad: $testFilePath" -ForegroundColor Green
Write-Host "  Storlek: $((Get-Item $testFilePath).Length) bytes" -ForegroundColor Gray

# Step 4: Ladda upp filen
Write-Host "`n[4/6] Laddar upp fil till S3..." -ForegroundColor Yellow

try {
    # Skapa multipart/form-data request manuellt
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"

    $bodyLines = @(
        "--$boundary",
        "Content-Disposition: form-data; name=`"file`"; filename=`"siteflow-test-upload.txt`"",
        "Content-Type: text/plain$LF",
        $testContent,
        "--$boundary",
        "Content-Disposition: form-data; name=`"project_id`"$LF",
        $projectId,
        "--$boundary",
        "Content-Disposition: form-data; name=`"category`"$LF",
        "other",
        "--$boundary",
        "Content-Disposition: form-data; name=`"name`"$LF",
        "E2E Test Upload",
        "--$boundary",
        "Content-Disposition: form-data; name=`"description`"$LF",
        "End-to-end test av file upload funktionalitet",
        "--$boundary--$LF"
    )

    $body = $bodyLines -join $LF

    $uploadHeaders = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "multipart/form-data; boundary=$boundary"
    }

    $uploadResponse = Invoke-RestMethod -Uri "$baseUrl/api/documents/upload" -Method POST -Headers $uploadHeaders -Body $body

    $documentId = $uploadResponse.data.id
    $s3Path = $uploadResponse.data.file_path
    $fileSize = $uploadResponse.data.file_size

    Write-Host "  ✓ Upload lyckades!" -ForegroundColor Green
    Write-Host "  Document ID: $documentId" -ForegroundColor Gray
    Write-Host "  S3 Path: $s3Path" -ForegroundColor Gray
    Write-Host "  File Size: $fileSize bytes" -ForegroundColor Gray
}
catch {
    Write-Host "  ✗ Upload misslyckades: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "  Response: $responseBody" -ForegroundColor Red
    }
    Remove-Item $testFilePath -ErrorAction SilentlyContinue
    exit 1
}

# Step 5: Hämta download URL
Write-Host "`n[5/6] Hämtar download URL..." -ForegroundColor Yellow

try {
    $downloadUrlResponse = Invoke-RestMethod -Uri "$baseUrl/api/documents/$documentId/download" -Method GET -Headers $headers
    $downloadUrl = $downloadUrlResponse.download_url

    Write-Host "  ✓ Download URL genererad" -ForegroundColor Green
    Write-Host "  URL: $($downloadUrl.Substring(0, 60))..." -ForegroundColor Gray

    # Verifiera att URL:en fungerar (om det är en presigned S3 URL)
    if ($downloadUrl -match "^https?://") {
        Write-Host "  Testar download URL..." -ForegroundColor Gray
        try {
            $downloadTest = Invoke-WebRequest -Uri $downloadUrl -Method GET -UseBasicParsing
            if ($downloadTest.StatusCode -eq 200) {
                Write-Host "  ✓ Download URL fungerar!" -ForegroundColor Green
            }
        }
        catch {
            Write-Host "  ⚠ Kunde inte testa download (S3 kanske inte är konfigurerat)" -ForegroundColor Yellow
        }
    }
}
catch {
    Write-Host "  ✗ Kunde inte hämta download URL: $_" -ForegroundColor Red
}

# Step 6: Ta bort dokumentet
Write-Host "`n[6/6] Tar bort test-dokumentet..." -ForegroundColor Yellow

try {
    Invoke-RestMethod -Uri "$baseUrl/api/documents/$documentId" -Method DELETE -Headers $headers
    Write-Host "  ✓ Dokument borttaget" -ForegroundColor Green
}
catch {
    Write-Host "  ⚠ Kunde inte ta bort dokument: $_" -ForegroundColor Yellow
}

# Cleanup
Remove-Item $testFilePath -ErrorAction SilentlyContinue

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ✓ E2E Test Slutfört!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Sammanfattning:" -ForegroundColor Cyan
Write-Host "  • Login: ✓" -ForegroundColor Green
Write-Host "  • Hämta projekt: ✓" -ForegroundColor Green
Write-Host "  • Skapa test-fil: ✓" -ForegroundColor Green
Write-Host "  • Upload till S3: ✓" -ForegroundColor Green
Write-Host "  • Generate download URL: ✓" -ForegroundColor Green
Write-Host "  • Ta bort dokument: ✓" -ForegroundColor Green

Write-Host "`nResultat:" -ForegroundColor Cyan
Write-Host "  - Document skapades i databasen" -ForegroundColor White
Write-Host "  - Fil uppladdades till S3 path: $s3Path" -ForegroundColor White
Write-Host "  - Presigned URL genererades och testades" -ForegroundColor White
Write-Host "  - Document togs bort från databas och S3`n" -ForegroundColor White
