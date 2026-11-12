# Run with PowerShell 7 from any directory. Passwords are used only by this process and its children.
[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$Keystore,
    [Parameter(Mandatory)][string]$UploadSha256
)

$ErrorActionPreference = 'Stop'
$store = Get-Item -LiteralPath ($Keystore.Trim().Trim('"'))
if ($store.PSIsContainer) { throw 'Select the upload keystore file.' }
$expected = ($UploadSha256 -replace '[:\s-]', '').ToUpperInvariant()
if ($expected -notmatch '^[0-9A-F]{64}$') { throw 'Copy the SHA-256 fingerprint under Upload key certificate in Play Console.' }
$android = Join-Path $PSScriptRoot '../android'
$cert = New-TemporaryFile
$names = 'ZAD_KEYSTORE_PATH','ZAD_KEYSTORE_PASSWORD','ZAD_KEY_ALIAS','ZAD_KEY_PASSWORD'
$previous = @{}
foreach ($name in $names) { $previous[$name] = [Environment]::GetEnvironmentVariable($name, 'Process') }

Push-Location $android
try {
    $env:ZAD_KEYSTORE_PATH = $store.FullName
    $env:ZAD_KEYSTORE_PASSWORD = Read-Host 'Keystore password' -MaskInput
    & keytool -list -keystore $store.FullName -storepass:env ZAD_KEYSTORE_PASSWORD
    if ($LASTEXITCODE) { throw 'Could not open keystore.' }
    $env:ZAD_KEY_ALIAS = (Read-Host 'Alias of the PrivateKeyEntry listed above').Trim()
    & keytool -exportcert -keystore $store.FullName -alias $env:ZAD_KEY_ALIAS -storepass:env ZAD_KEYSTORE_PASSWORD -file $cert.FullName
    if ($LASTEXITCODE) { throw 'Could not read the certificate for that alias.' }
    if ((Get-FileHash $cert.FullName -Algorithm SHA256).Hash -ne $expected) {
        throw 'This certificate differs from the Play Console upload certificate. Check the file and alias.'
    }
    $env:ZAD_KEY_PASSWORD = Read-Host 'Key password (press Enter if same as keystore password)' -MaskInput
    if (!$env:ZAD_KEY_PASSWORD) { $env:ZAD_KEY_PASSWORD = $env:ZAD_KEYSTORE_PASSWORD }
    & .\gradlew.bat --no-daemon :app:bundleRelease
    if ($LASTEXITCODE) { throw 'Release build failed.' }

    $bundle = (Get-Item 'app/build/outputs/bundle/release/app-release.aab').FullName
    $verification = & jarsigner '-J-Duser.language=en' -verify $bundle
    if ($LASTEXITCODE -or !($verification -match '^jar verified\.$')) { throw 'AAB signature verification failed.' }
    $signers = & keytool '-J-Duser.language=en' -printcert -jarfile $bundle
    if ($LASTEXITCODE -or !(($signers -replace '[:\s]', '') -contains "SHA256$expected")) {
        throw 'Could not confirm the upload certificate in the signed AAB.'
    }
    Write-Host "Verified Google Play upload bundle: $bundle"
} finally {
    Pop-Location
    foreach ($name in $names) { [Environment]::SetEnvironmentVariable($name, $previous[$name], 'Process') }
    Remove-Item -LiteralPath $cert.FullName -ErrorAction SilentlyContinue
}
