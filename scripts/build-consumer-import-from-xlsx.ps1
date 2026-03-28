param(
    [string]$WorkbookPath = "C:\Users\justdoit\Documents\SEJUK\Sejuk Data\database konsumen\Database_Konsumen_AC.xlsx",
    [string]$OutputPath = "",
    [string]$AuthEmailDomain = "auth.indosejuk.local"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent $PSScriptRoot

if (-not $OutputPath) {
    $OutputPath = Join-Path $repoRoot "data\consumer-ac-import.json"
}

function Get-ZipEntryText {
    param(
        [Parameter(Mandatory = $true)]
        [System.IO.Compression.ZipArchive]$Archive,
        [Parameter(Mandatory = $true)]
        [string]$EntryPath
    )

    $entry = $Archive.GetEntry($EntryPath)
    if (-not $entry) {
        return $null
    }

    $stream = $entry.Open()
    try {
        $reader = New-Object System.IO.StreamReader($stream)
        return $reader.ReadToEnd()
    }
    finally {
        if ($reader) {
            $reader.Dispose()
        }
    }
}

function Get-ColumnIndexFromReference {
    param([string]$CellReference)

    $letters = ($CellReference -replace "\d", "").ToUpperInvariant()
    $value = 0
    foreach ($character in $letters.ToCharArray()) {
        $value = ($value * 26) + ([int][char]$character - [int][char]'A' + 1)
    }

    return $value - 1
}

function Get-XlsxRows {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,
        [string]$SheetEntryPath = "xl/worksheets/sheet1.xml"
    )

    Add-Type -AssemblyName System.IO.Compression.FileSystem

    $zip = [System.IO.Compression.ZipFile]::OpenRead($Path)
    try {
        [xml]$sharedStringsXml = Get-ZipEntryText -Archive $zip -EntryPath "xl/sharedStrings.xml"
        $sharedStrings = @()

        if ($sharedStringsXml) {
            $sharedNs = New-Object System.Xml.XmlNamespaceManager($sharedStringsXml.NameTable)
            $sharedNs.AddNamespace("x", "http://schemas.openxmlformats.org/spreadsheetml/2006/main")
            $sharedStrings = $sharedStringsXml.SelectNodes("//x:sst/x:si", $sharedNs) | ForEach-Object {
                ($_.SelectNodes(".//x:t", $sharedNs) | ForEach-Object { $_.InnerText }) -join ""
            }
        }

        [xml]$sheetXml = Get-ZipEntryText -Archive $zip -EntryPath $SheetEntryPath
        $sheetNs = New-Object System.Xml.XmlNamespaceManager($sheetXml.NameTable)
        $sheetNs.AddNamespace("x", "http://schemas.openxmlformats.org/spreadsheetml/2006/main")

        $rows = $sheetXml.SelectNodes("//x:worksheet/x:sheetData/x:row", $sheetNs)
        $result = @()

        foreach ($row in $rows) {
            $cellsByIndex = @{}

            foreach ($cell in $row.SelectNodes("./x:c", $sheetNs)) {
                $columnIndex = Get-ColumnIndexFromReference -CellReference $cell.GetAttribute("r")
                $cellType = $cell.GetAttribute("t")
                $valueNode = $cell.SelectSingleNode("./x:v", $sheetNs)
                $value = if ($valueNode) { [string]$valueNode.InnerText } else { "" }

                if ($cellType -eq "s" -and $value -match "^\d+$") {
                    $value = $sharedStrings[[int]$value]
                }
                elseif ($cellType -eq "inlineStr") {
                    $value = ($cell.SelectNodes("./x:is/x:t", $sheetNs) | ForEach-Object { $_.InnerText }) -join ""
                }

                $cellsByIndex[[string]$columnIndex] = $value
            }

            $maxColumnIndex = if ($cellsByIndex.Keys.Count) {
                ($cellsByIndex.Keys | ForEach-Object { [int]$_ } | Measure-Object -Maximum).Maximum
            }
            else {
                -1
            }

            $rowValues = @()
            for ($index = 0; $index -le $maxColumnIndex; $index++) {
                $rowValues += [string]$cellsByIndex[[string]$index]
            }

            $result += ,@($rowValues)
        }

        return $result
    }
    finally {
        $zip.Dispose()
    }
}

function Normalize-Whitespace {
    param([AllowNull()][string]$Value)

    if ($null -eq $Value) {
        return ""
    }

    return (($Value -replace "\s+", " ").Trim())
}

function Convert-ToPlainAscii {
    param([AllowNull()][string]$Value)

    $normalized = Normalize-Whitespace $Value
    if (-not $normalized) {
        return ""
    }

    $decomposed = $normalized.Normalize([Text.NormalizationForm]::FormD)
    $builder = New-Object System.Text.StringBuilder

    foreach ($character in $decomposed.ToCharArray()) {
        $unicodeCategory = [Globalization.CharUnicodeInfo]::GetUnicodeCategory($character)
        if ($unicodeCategory -ne [Globalization.UnicodeCategory]::NonSpacingMark) {
            [void]$builder.Append($character)
        }
    }

    return $builder.ToString().Normalize([Text.NormalizationForm]::FormC)
}

function Convert-ToSlug {
    param(
        [AllowNull()][string]$Value,
        [switch]$Compact
    )

    $ascii = (Convert-ToPlainAscii $Value).ToLowerInvariant()
    if (-not $ascii) {
        return ""
    }

    $separator = if ($Compact) { "" } else { "-" }
    $slug = $ascii -replace "[^a-z0-9]+", $separator

    if ($Compact) {
        return ($slug -replace "[^a-z0-9]", "")
    }

    $slug = $slug.Trim("-")
    $slug = $slug -replace "-{2,}", "-"
    return $slug
}

function Normalize-Phone {
    param([AllowNull()][string]$Value)

    $digits = (Normalize-Whitespace $Value) -replace "\D", ""
    if (-not $digits) {
        return ""
    }

    if ($digits.StartsWith("62")) {
        return "0$($digits.Substring(2))"
    }

    if ($digits.StartsWith("8")) {
        return "0$digits"
    }

    return $digits
}

function Convert-ExcelDateValue {
    param([AllowNull()][string]$Value)

    $normalized = Normalize-Whitespace $Value
    if (-not $normalized) {
        return ""
    }

    $numericValue = 0.0
    if ([double]::TryParse($normalized, [ref]$numericValue) -and $numericValue -ge 1 -and $numericValue -le 60000) {
        return ([datetime]"1899-12-30").AddDays($numericValue).ToString("yyyy-MM-dd")
    }

    $parsedDate = [datetime]::MinValue
    if ([datetime]::TryParse($normalized, [ref]$parsedDate)) {
        return $parsedDate.ToString("yyyy-MM-dd")
    }

    return $normalized
}

function Get-UniqueTrimmedValues {
    param([object[]]$Values)

    $seen = @{}
    $result = @()

    foreach ($value in $Values) {
        if ($value -is [System.Collections.IEnumerable] -and -not ($value -is [string])) {
            foreach ($innerValue in $value) {
                $normalizedInnerValue = Normalize-Whitespace ([string]$innerValue)
                if (-not $normalizedInnerValue) {
                    continue
                }

                $innerKey = $normalizedInnerValue.ToLowerInvariant()
                if ($seen.ContainsKey($innerKey)) {
                    continue
                }

                $seen[$innerKey] = $true
                $result += $normalizedInnerValue
            }
            continue
        }

        $normalized = Normalize-Whitespace ([string]$value)
        if (-not $normalized) {
            continue
        }

        $key = $normalized.ToLowerInvariant()
        if ($seen.ContainsKey($key)) {
            continue
        }

        $seen[$key] = $true
        $result += $normalized
    }

    return @($result)
}

function Select-FirstNonEmpty {
    param([object[]]$Values)

    foreach ($value in $Values) {
        $normalized = Normalize-Whitespace ([string]$value)
        if ($normalized) {
            return $normalized
        }
    }

    return ""
}

function Select-LongestNonEmpty {
    param([object[]]$Values)

    $candidates = @(Get-UniqueTrimmedValues $Values)
    if (-not $candidates.Count) {
        return ""
    }

    return ($candidates | Sort-Object Length -Descending | Select-Object -First 1)
}

function New-OrderedJsonObject {
    return [ordered]@{}
}

function Add-IfValue {
    param(
        [System.Collections.IDictionary]$Target,
        [string]$Key,
        [AllowNull()]$Value
    )

    if ($null -eq $Value) {
        return
    }

    if ($Value -is [string]) {
        $normalized = Normalize-Whitespace $Value
        if ($normalized) {
            $Target[$Key] = $normalized
        }
        return
    }

    if ($Value -is [System.Collections.IEnumerable] -and -not ($Value -is [string])) {
        $items = @($Value)
        if ($items.Count) {
            $Target[$Key] = $items
        }
        return
    }

    $Target[$Key] = $Value
}

if (-not (Test-Path -LiteralPath $WorkbookPath)) {
    throw "Workbook tidak ditemukan: $WorkbookPath"
}

$importedAt = (Get-Date).ToString("s")
$rows = @(Get-XlsxRows -Path $WorkbookPath)

if (-not $rows.Count) {
    throw "Workbook kosong atau sheet tidak dapat dibaca."
}

$headers = @($rows[0])
$headerMap = @{
    "No" = "No"
    "Nama Konsumen" = "NamaKonsumen"
    "Alamat" = "Alamat"
    "Maps" = "Maps"
    "Nomor WA" = "NomorWA"
    "Merk AC" = "MerkAC"
    "Jenis AC" = "JenisAC"
    "Refrigerant" = "Refrigerant"
    "Kapasitas AC" = "KapasitasAC"
    "Tanggal Pemasangan" = "TanggalPemasangan"
    "Tanggal Pemeliharaan" = "TanggalPemeliharaan"
    "Tanggal Perbaikan" = "TanggalPerbaikan"
    "Pengingat Pemeliharaan" = "PengingatPemeliharaan"
    "Teknisi" = "Teknisi"
    "Marketing" = "Marketing"
    "Pekerjaan" = "Pekerjaan"
}

for ($imageIndex = 1; $imageIndex -le 8; $imageIndex++) {
    $headerMap["Image$imageIndex"] = "Image$imageIndex"
}

$worksheetRows = @()

for ($rowIndex = 1; $rowIndex -lt $rows.Count; $rowIndex++) {
    $row = @($rows[$rowIndex])
    if (-not (Normalize-Whitespace ($row -join ""))) {
        continue
    }

    $record = [ordered]@{
        RowNumber = $rowIndex + 1
    }

    for ($columnIndex = 0; $columnIndex -lt $headers.Count; $columnIndex++) {
        $header = Normalize-Whitespace $headers[$columnIndex]
        if (-not $headerMap.ContainsKey($header)) {
            continue
        }

        $targetKey = $headerMap[$header]
        $record[$targetKey] = if ($columnIndex -lt $row.Count) {
            Normalize-Whitespace $row[$columnIndex]
        }
        else {
            ""
        }
    }

    $record["NamaKonsumen"] = Normalize-Whitespace $record["NamaKonsumen"]
    $record["Alamat"] = Normalize-Whitespace $record["Alamat"]
    $record["Maps"] = Normalize-Whitespace $record["Maps"]
    $record["NomorWA"] = Normalize-Phone $record["NomorWA"]
    $record["TanggalPemasangan"] = Convert-ExcelDateValue $record["TanggalPemasangan"]
    $record["TanggalPemeliharaan"] = Convert-ExcelDateValue $record["TanggalPemeliharaan"]
    $record["TanggalPerbaikan"] = Convert-ExcelDateValue $record["TanggalPerbaikan"]

    $imagePaths = @()
    for ($imageIndex = 1; $imageIndex -le 8; $imageIndex++) {
        $imagePaths += $record["Image$imageIndex"]
    }
    $record["ImagePaths"] = Get-UniqueTrimmedValues $imagePaths

    $consumerKey = if ($record["NomorWA"]) {
        "phone:$($record["NomorWA"])"
    }
    else {
        $fallbackName = Convert-ToSlug $record["NamaKonsumen"] -Compact
        $fallbackAddress = Convert-ToSlug $record["Alamat"] -Compact
        "fallback:$fallbackName|$fallbackAddress"
    }

    $record["ConsumerKey"] = $consumerKey
    $record["NormalizedName"] = (Convert-ToSlug $record["NamaKonsumen"])
    $worksheetRows += [pscustomobject]$record
}

$consumerGroups = $worksheetRows | Group-Object ConsumerKey
$generatedUsernames = @{}
$consumers = @()

foreach ($group in $consumerGroups) {
    $items = @($group.Group)
    $primaryName = Select-FirstNonEmpty ($items | ForEach-Object { $_.NamaKonsumen })
    $primaryAddress = Select-LongestNonEmpty ($items | ForEach-Object { $_.Alamat })
    $phone = Select-FirstNonEmpty ($items | ForEach-Object { $_.NomorWA })
    $locationValues = @(Get-UniqueTrimmedValues ($items | ForEach-Object { $_.Maps }))
    $referralValues = @(Get-UniqueTrimmedValues ($items | ForEach-Object { $_.Marketing }))

    $usernameBase = Convert-ToSlug $primaryName
    if (-not $usernameBase) {
        $usernameBase = if ($phone) { "konsumen-$($phone.Substring([Math]::Max(0, $phone.Length - 4)))" } else { "konsumen" }
    }

    $username = $usernameBase
    $usernameCounter = 2
    while ($generatedUsernames.ContainsKey($username)) {
        $username = "$usernameBase-$usernameCounter"
        $usernameCounter++
    }
    $generatedUsernames[$username] = $true

    $passwordBase = Convert-ToSlug $primaryName -Compact
    if (-not $passwordBase) {
        $passwordBase = ($username -replace "[^a-z0-9]", "")
    }
    if (-not $passwordBase) {
        $passwordBase = "konsumen"
    }

    $unitImagePaths = Get-UniqueTrimmedValues ($items | ForEach-Object { $_.ImagePaths })
    $units = @()
    $unitSignatures = @{}

    for ($itemIndex = 0; $itemIndex -lt $items.Count; $itemIndex++) {
        $item = $items[$itemIndex]
        $unitNotesParts = @()
        if ($item.TanggalPemasangan) { $unitNotesParts += "Pemasangan: $($item.TanggalPemasangan)" }
        if ($item.TanggalPemeliharaan) { $unitNotesParts += "Pemeliharaan: $($item.TanggalPemeliharaan)" }
        if ($item.TanggalPerbaikan) { $unitNotesParts += "Perbaikan: $($item.TanggalPerbaikan)" }
        if ($item.PengingatPemeliharaan) { $unitNotesParts += "Pengingat: $($item.PengingatPemeliharaan)" }
        if ($item.Teknisi) { $unitNotesParts += "Teknisi: $($item.Teknisi)" }
        if ($item.Pekerjaan) { $unitNotesParts += "Pekerjaan: $($item.Pekerjaan)" }

        $notes = $unitNotesParts -join " | "
        $createdAt = Select-FirstNonEmpty @($item.TanggalPemasangan, $item.TanggalPemeliharaan, $item.TanggalPerbaikan, $importedAt)
        $updatedAt = Select-FirstNonEmpty @($item.TanggalPerbaikan, $item.TanggalPemeliharaan, $item.TanggalPemasangan, $importedAt)
        $firstImagePath = Select-FirstNonEmpty $item.ImagePaths

        $unitSignature = @(
            ([string]$item.MerkAC).ToLowerInvariant(),
            ([string]$item.JenisAC).ToLowerInvariant(),
            ([string]$item.Refrigerant).ToLowerInvariant(),
            ([string]$item.KapasitasAC).ToLowerInvariant(),
            ([string]$firstImagePath).ToLowerInvariant(),
            ([string]$notes).ToLowerInvariant(),
            $createdAt,
            $updatedAt
        ) -join "||"

        if ($unitSignatures.ContainsKey($unitSignature)) {
            continue
        }
        $unitSignatures[$unitSignature] = $true

        $unit = New-OrderedJsonObject
        $unit["key"] = "legacy-$username-$($units.Count + 1)"
        Add-IfValue -Target $unit -Key "brand" -Value $item.MerkAC
        Add-IfValue -Target $unit -Key "type" -Value $item.JenisAC
        Add-IfValue -Target $unit -Key "refrigerant" -Value $item.Refrigerant
        Add-IfValue -Target $unit -Key "capacity" -Value $item.KapasitasAC
        Add-IfValue -Target $unit -Key "image_path" -Value $firstImagePath
        Add-IfValue -Target $unit -Key "created_at" -Value $createdAt
        Add-IfValue -Target $unit -Key "updated_at" -Value $updatedAt
        Add-IfValue -Target $unit -Key "source" -Value "excel-import"
        Add-IfValue -Target $unit -Key "notes" -Value $notes
        $units += $unit
    }

    $consumer = New-OrderedJsonObject
    $consumer["role"] = "konsumen"
    $consumer["status"] = "Aktif"
    $consumer["verified_at"] = $importedAt
    $consumer["name"] = $primaryName
    $consumer["username"] = $username
    $consumer["password"] = "$passwordBase" + "123"
    $consumer["email"] = $null
    $consumer["auth_email"] = "konsumen.$username@$AuthEmailDomain"
    $consumer["phone"] = if ($phone) { $phone } else { $null }
    $consumer["address"] = if ($primaryAddress) { $primaryAddress } else { $null }
    $consumer["district"] = $null
    $consumer["location_text"] = if ($locationValues.Count) { $locationValues -join " | " } else { $null }
    $consumer["referral"] = if ($referralValues.Count) { $referralValues -join ", " } else { $null }
    $consumer["ac_units"] = @($units)
    $consumer["unit_image_paths"] = @($unitImagePaths)
    $consumer["unit_image_urls"] = @()
    $consumer["source_row_numbers"] = @($items | ForEach-Object { $_.RowNumber } | Sort-Object)
    $consumers += $consumer
}

$duplicateRowsMerged = $worksheetRows.Count - $consumers.Count
$missingPhoneConsumers = @($consumers | Where-Object { -not $_["phone"] }).Count
$duplicatePhoneGroups = @(
    $worksheetRows |
    Where-Object { $_.NomorWA } |
    Group-Object NomorWA |
    Where-Object { $_.Count -gt 1 }
).Count

$output = New-OrderedJsonObject
$output["metadata"] = [ordered]@{
    source_workbook = $WorkbookPath
    generated_at = $importedAt
    worksheet_row_count = $worksheetRows.Count
    consumer_count = $consumers.Count
    duplicate_rows_merged = $duplicateRowsMerged
    duplicate_phone_groups = $duplicatePhoneGroups
    consumers_without_phone = $missingPhoneConsumers
    auth_email_domain = $AuthEmailDomain
    password_rule = "slug_nama_tanpa_spasi + 123"
}
$output["column_mapping"] = [ordered]@{
    "Nama Konsumen" = "name"
    "Alamat" = "address"
    "Maps" = "location_text"
    "Nomor WA" = "phone"
    "Marketing" = "referral"
    "Merk AC" = "ac_units[].brand"
    "Jenis AC" = "ac_units[].type"
    "Refrigerant" = "ac_units[].refrigerant"
    "Kapasitas AC" = "ac_units[].capacity"
    "Tanggal Pemasangan" = "ac_units[].notes + created_at"
    "Tanggal Pemeliharaan" = "ac_units[].notes + updated_at"
    "Tanggal Perbaikan" = "ac_units[].notes + updated_at"
    "Pengingat Pemeliharaan" = "ac_units[].notes"
    "Teknisi" = "ac_units[].notes"
    "Pekerjaan" = "ac_units[].notes"
    "Image1..Image8" = "ac_units[].image_path + unit_image_paths[]"
}
$output["consumers"] = @($consumers | Sort-Object name, username)

$outputDirectory = Split-Path -Parent $OutputPath
if ($outputDirectory -and -not (Test-Path -LiteralPath $outputDirectory)) {
    New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
}

$json = $output | ConvertTo-Json -Depth 10
Set-Content -LiteralPath $OutputPath -Value $json -Encoding UTF8

Write-Host "Workbook  : $WorkbookPath"
Write-Host "Output    : $OutputPath"
Write-Host "Rows      : $($worksheetRows.Count)"
Write-Host "Consumers : $($consumers.Count)"
Write-Host "Merged    : $duplicateRowsMerged"
Write-Host "No phone  : $missingPhoneConsumers"
