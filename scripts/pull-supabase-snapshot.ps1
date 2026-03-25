$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

Write-Host "Pull perubahan repo terbaru..."
git pull --ff-only

$snapshotUrl = $env:INDOSEJUK_SNAPSHOT_URL
$snapshotBearer = $env:INDOSEJUK_SNAPSHOT_BEARER

if ($snapshotUrl) {
    $outputDir = Join-Path $repoRoot "data"
    $outputFile = Join-Path $outputDir "profiles-snapshot.json"
    if (-not (Test-Path $outputDir)) {
        New-Item -ItemType Directory -Path $outputDir | Out-Null
    }

    $headers = @{}
    if ($snapshotBearer) {
        $headers["Authorization"] = "Bearer $snapshotBearer"
    }

    Write-Host "Mengambil snapshot profiles dari endpoint aman..."
    Invoke-RestMethod -Uri $snapshotUrl -Headers $headers -OutFile $outputFile
    Write-Host "Snapshot disimpan di $outputFile"
}
else {
    Write-Host "INDOSEJUK_SNAPSHOT_URL belum diset. Snapshot endpoint dilewati."
}

Write-Host "Catatan: localhost app tetap membaca Supabase langsung sebagai source of truth."
Write-Host "Snapshot GitHub hanya untuk audit, backup, atau inspeksi perubahan."
