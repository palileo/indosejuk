param(
    [string]$InputPath = "",
    [string]$SupabaseUrl = $env:SUPABASE_URL,
    [string]$ServiceRoleKey = $env:SUPABASE_SERVICE_ROLE_KEY,
    [string]$ReportPath = "",
    [switch]$Apply,
    [switch]$ForcePasswordReset
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent $PSScriptRoot

if (-not $InputPath) {
    $InputPath = Join-Path $repoRoot "data\consumer-ac-import.json"
}

if (-not $ReportPath) {
    $ReportPath = Join-Path $repoRoot "data\consumer-ac-import-report.json"
}

function Normalize-Whitespace {
    param([AllowNull()][string]$Value)

    if ($null -eq $Value) {
        return ""
    }

    return (($Value -replace "\s+", " ").Trim())
}

function Get-RequiredValue {
    param(
        [AllowNull()][string]$Value,
        [string]$Label
    )

    $normalized = Normalize-Whitespace $Value
    if (-not $normalized) {
        throw "$Label wajib tersedia."
    }

    return $normalized
}

function New-ApiHeaders {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ApiKey,
        [string]$ContentProfile = "",
        [switch]$ReturnRepresentation
    )

    $headers = @{
        "apikey" = $ApiKey
        "Authorization" = "Bearer $ApiKey"
    }

    if ($ContentProfile) {
        $headers["Content-Profile"] = $ContentProfile
        $headers["Accept-Profile"] = $ContentProfile
    }

    if ($ReturnRepresentation) {
        $headers["Prefer"] = "return=representation"
    }

    return $headers
}

function ConvertTo-CompactJson {
    param([AllowNull()]$Value)
    return ($Value | ConvertTo-Json -Depth 15 -Compress)
}

function Invoke-SupabaseRest {
    param(
        [Parameter(Mandatory = $true)]
        [ValidateSet("GET", "POST", "PATCH", "PUT")]
        [string]$Method,
        [Parameter(Mandatory = $true)]
        [string]$Url,
        [Parameter(Mandatory = $true)]
        [hashtable]$Headers,
        [AllowNull()]$Body = $null
    )

    $requestParams = @{
        Method = $Method
        Uri = $Url
        Headers = $Headers
        ContentType = "application/json"
    }

    if ($PSBoundParameters.ContainsKey("Body") -and $null -ne $Body) {
        $requestParams["Body"] = (ConvertTo-CompactJson $Body)
    }

    try {
        return Invoke-RestMethod @requestParams
    }
    catch {
        $response = $_.Exception.Response
        $rawBody = ""
        if ($response) {
            try {
                $stream = $response.GetResponseStream()
                if ($stream) {
                    $reader = New-Object System.IO.StreamReader($stream)
                    $rawBody = $reader.ReadToEnd()
                    $reader.Dispose()
                }
            }
            catch {
            }
        }

        $statusCode = if ($response) { [int]$response.StatusCode } else { 0 }
        $message = $_.Exception.Message
        if ($rawBody) {
            throw "HTTP $statusCode $Method $Url gagal. $message Body: $rawBody"
        }

        throw "HTTP $statusCode $Method $Url gagal. $message"
    }
}

function Get-ProfileQueryUrl {
    param(
        [Parameter(Mandatory = $true)]
        [string]$BaseUrl,
        [Parameter(Mandatory = $true)]
        [string]$FilterColumn,
        [AllowNull()][string]$FilterValue
    )

    $safeBaseUrl = $BaseUrl.TrimEnd("/")
    $select = [System.Uri]::EscapeDataString("id,role,username,name,phone,auth_email,status")
    $encodedValue = [System.Uri]::EscapeDataString((Normalize-Whitespace $FilterValue))
    return "$safeBaseUrl/rest/v1/profiles?select=$select&$FilterColumn=eq.$encodedValue"
}

function Get-ExistingProfileMatches {
    param(
        [Parameter(Mandatory = $true)]
        [string]$BaseUrl,
        [Parameter(Mandatory = $true)]
        [string]$ApiKey,
        [Parameter(Mandatory = $true)]
        $Consumer
    )

    $headers = New-ApiHeaders -ApiKey $ApiKey -ContentProfile "public"
    $matches = @{}

    if ($Consumer.auth_email) {
        $authEmailResult = @(Invoke-SupabaseRest -Method GET -Url (Get-ProfileQueryUrl -BaseUrl $BaseUrl -FilterColumn "auth_email" -FilterValue $Consumer.auth_email) -Headers $headers)
        if ($authEmailResult.Count) {
            $matches["auth_email"] = $authEmailResult[0]
        }
    }

    if ($Consumer.phone) {
        $phoneResult = @(Invoke-SupabaseRest -Method GET -Url (Get-ProfileQueryUrl -BaseUrl $BaseUrl -FilterColumn "phone" -FilterValue $Consumer.phone) -Headers $headers)
        if ($phoneResult.Count) {
            $matches["phone"] = $phoneResult[0]
        }
    }

    if ($Consumer.username) {
        $usernameResult = @(Invoke-SupabaseRest -Method GET -Url (Get-ProfileQueryUrl -BaseUrl $BaseUrl -FilterColumn "username" -FilterValue $Consumer.username) -Headers $headers)
        if ($usernameResult.Count) {
            $matches["username"] = $usernameResult[0]
        }
    }

    return $matches
}

function Get-ConflictSummary {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Matches
    )

    $ids = @($Matches.Values | ForEach-Object { $_.id } | Select-Object -Unique)
    if ($ids.Count -le 1) {
        return $null
    }

    return [ordered]@{
        reason = "Beberapa profile berbeda cocok dengan username/phone/auth_email import."
        matches = @(
            $Matches.GetEnumerator() | Sort-Object Name | ForEach-Object {
                [ordered]@{
                    match_type = $_.Key
                    id = $_.Value.id
                    username = $_.Value.username
                    phone = $_.Value.phone
                    auth_email = $_.Value.auth_email
                    role = $_.Value.role
                    name = $_.Value.name
                    status = $_.Value.status
                }
            }
        )
    }
}

function Build-UserMetadata {
    param(
        [Parameter(Mandatory = $true)]
        $Consumer
    )

    return [ordered]@{
        role = "konsumen"
        username = $Consumer.username
        name = $Consumer.name
        contact_email = $Consumer.email
        auth_email = $Consumer.auth_email
        phone = $Consumer.phone
        address = $Consumer.address
        district = $Consumer.district
        referral = $Consumer.referral
        ac_units = @($Consumer.ac_units)
        location_text = $Consumer.location_text
        status = $Consumer.status
        verified_at = $Consumer.verified_at
    }
}

function Build-ProfilePayload {
    param(
        [Parameter(Mandatory = $true)]
        [string]$UserId,
        [Parameter(Mandatory = $true)]
        $Consumer
    )

    return [ordered]@{
        id = $UserId
        role = "konsumen"
        username = $Consumer.username
        name = $Consumer.name
        email = $Consumer.email
        auth_email = $Consumer.auth_email
        phone = $Consumer.phone
        address = $Consumer.address
        district = $Consumer.district
        location_text = $Consumer.location_text
        referral = $Consumer.referral
        status = $Consumer.status
        verified_at = $Consumer.verified_at
        ac_units = @($Consumer.ac_units)
    }
}

function New-AuthUser {
    param(
        [Parameter(Mandatory = $true)]
        [string]$BaseUrl,
        [Parameter(Mandatory = $true)]
        [string]$ApiKey,
        [Parameter(Mandatory = $true)]
        $Consumer
    )

    $headers = New-ApiHeaders -ApiKey $ApiKey -ReturnRepresentation
    $body = [ordered]@{
        email = $Consumer.auth_email
        password = $Consumer.password
        email_confirm = $true
        user_metadata = Build-UserMetadata -Consumer $Consumer
    }

    return Invoke-SupabaseRest -Method POST -Url ($BaseUrl.TrimEnd("/") + "/auth/v1/admin/users") -Headers $headers -Body $body
}

function Update-AuthUser {
    param(
        [Parameter(Mandatory = $true)]
        [string]$BaseUrl,
        [Parameter(Mandatory = $true)]
        [string]$ApiKey,
        [Parameter(Mandatory = $true)]
        [string]$UserId,
        [Parameter(Mandatory = $true)]
        $Consumer,
        [switch]$ForcePasswordReset
    )

    $headers = New-ApiHeaders -ApiKey $ApiKey -ReturnRepresentation
    $body = [ordered]@{
        email = $Consumer.auth_email
        email_confirm = $true
        user_metadata = Build-UserMetadata -Consumer $Consumer
    }

    if ($ForcePasswordReset) {
        $body["password"] = $Consumer.password
    }

    return Invoke-SupabaseRest -Method PUT -Url ($BaseUrl.TrimEnd("/") + "/auth/v1/admin/users/$UserId") -Headers $headers -Body $body
}

function Upsert-Profile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$BaseUrl,
        [Parameter(Mandatory = $true)]
        [string]$ApiKey,
        [Parameter(Mandatory = $true)]
        $ProfilePayload
    )

    $headers = New-ApiHeaders -ApiKey $ApiKey -ContentProfile "public" -ReturnRepresentation
    $headers["Prefer"] = "resolution=merge-duplicates,return=representation"
    $url = ($BaseUrl.TrimEnd("/") + "/rest/v1/profiles?on_conflict=id")
    return Invoke-SupabaseRest -Method POST -Url $url -Headers $headers -Body @($ProfilePayload)
}

function Save-Report {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,
        [Parameter(Mandatory = $true)]
        $Report
    )

    $directory = Split-Path -Parent $Path
    if ($directory -and -not (Test-Path -LiteralPath $directory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }

    Set-Content -LiteralPath $Path -Value ($Report | ConvertTo-Json -Depth 15) -Encoding UTF8
}

if (-not (Test-Path -LiteralPath $InputPath)) {
    throw "File input impor tidak ditemukan: $InputPath"
}

$input = Get-Content -Raw -LiteralPath $InputPath | ConvertFrom-Json
$consumers = @($input.consumers)

if (-not $consumers.Count) {
    throw "Tidak ada data konsumen pada file impor."
}

$mode = if ($Apply) { "apply" } else { "dry-run" }
$startedAt = (Get-Date).ToString("s")

$report = [ordered]@{
    started_at = $startedAt
    mode = $mode
    input_path = $InputPath
    total_consumers = $consumers.Count
    results = @()
}

if (-not $SupabaseUrl -or -not $ServiceRoleKey) {
    $report["summary"] = [ordered]@{
        ok = 0
        created = 0
        updated = 0
        skipped = $consumers.Count
        conflicts = 0
        failed = 0
        message = "SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum tersedia."
    }
    Save-Report -Path $ReportPath -Report $report
    throw "SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi untuk proses impor."
}

foreach ($consumer in $consumers) {
    $result = [ordered]@{
        name = $consumer.name
        username = $consumer.username
        auth_email = $consumer.auth_email
        phone = $consumer.phone
        mode = $mode
        action = ""
        ok = $false
    }

    try {
        $matches = Get-ExistingProfileMatches -BaseUrl $SupabaseUrl -ApiKey $ServiceRoleKey -Consumer $consumer
        $conflict = Get-ConflictSummary -Matches $matches
        if ($conflict) {
            $result["action"] = "conflict"
            $result["conflict"] = $conflict
            $report.results += $result
            continue
        }

        $existingProfile = $null
        if ($matches.Count) {
            $existingProfile = @($matches.Values | Select-Object -First 1)[0]
        }

        $action = if ($existingProfile) { "update-existing" } else { "create-new" }
        $result["action"] = $action
        $result["existing_profile_id"] = if ($existingProfile) { $existingProfile.id } else { $null }

        if (-not $Apply) {
            $result["ok"] = $true
            $result["profile_payload_preview"] = Build-ProfilePayload -UserId (if ($existingProfile) { $existingProfile.id } else { "new-auth-user-id" }) -Consumer $consumer
            $report.results += $result
            continue
        }

        $userId = ""
        if ($existingProfile) {
            $userId = [string]$existingProfile.id
            [void](Update-AuthUser -BaseUrl $SupabaseUrl -ApiKey $ServiceRoleKey -UserId $userId -Consumer $consumer -ForcePasswordReset:$ForcePasswordReset)
        }
        else {
            $createResponse = New-AuthUser -BaseUrl $SupabaseUrl -ApiKey $ServiceRoleKey -Consumer $consumer
            $userId = Get-RequiredValue -Value ([string]$createResponse.user.id) -Label "User ID hasil create auth"
        }

        $profilePayload = Build-ProfilePayload -UserId $userId -Consumer $consumer
        $profileResponse = @(Upsert-Profile -BaseUrl $SupabaseUrl -ApiKey $ServiceRoleKey -ProfilePayload $profilePayload)

        $result["ok"] = $true
        $result["user_id"] = $userId
        $result["profile_status"] = if ($profileResponse.Count) { $profileResponse[0].status } else { $consumer.status }
        $report.results += $result
    }
    catch {
        $result["action"] = if ($result["action"]) { $result["action"] } else { "failed" }
        $result["error"] = $_.Exception.Message
        $report.results += $result
    }
}

$createdCount = @($report.results | Where-Object { $_.ok -and $_.action -eq "create-new" }).Count
$updatedCount = @($report.results | Where-Object { $_.ok -and $_.action -eq "update-existing" }).Count
$conflictCount = @($report.results | Where-Object { $_.action -eq "conflict" }).Count
$failedCount = @($report.results | Where-Object { -not $_.ok -and $_.action -ne "conflict" }).Count
$okCount = @($report.results | Where-Object { $_.ok }).Count
$skippedCount = $report.total_consumers - $okCount - $conflictCount - $failedCount

$report["summary"] = [ordered]@{
    ok = $okCount
    created = $createdCount
    updated = $updatedCount
    skipped = $skippedCount
    conflicts = $conflictCount
    failed = $failedCount
}

Save-Report -Path $ReportPath -Report $report

Write-Host "Mode      : $mode"
Write-Host "Input     : $InputPath"
Write-Host "Report    : $ReportPath"
Write-Host "OK        : $okCount"
Write-Host "Created   : $createdCount"
Write-Host "Updated   : $updatedCount"
Write-Host "Conflicts : $conflictCount"
Write-Host "Failed    : $failedCount"
