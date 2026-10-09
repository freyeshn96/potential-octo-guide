[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$repositoryPath = Split-Path $PSScriptRoot -Parent
$environmentDirectory = Join-Path $repositoryPath 'infrastructure/docker'
$environmentPath = Join-Path $environmentDirectory '.env'
if (Test-Path -LiteralPath $environmentPath) {
    Write-Output 'Existing .env retained.'
    $content = Get-Content -Raw -LiteralPath $environmentPath
} else {
    $content = Get-Content -Raw (Join-Path $environmentDirectory '.env.example')
}
foreach ($key in @('POSTGRES_PASSWORD', 'SERVER_DATABASE_PASSWORD', 'ADMIN_DATABASE_PASSWORD',
    'KEYCLOAK_DATABASE_PASSWORD', 'KEYCLOAK_BOOTSTRAP_ADMIN_PASSWORD', 'KEYCLOAK_CLIENT_SECRET')) {
    $existingSecret = [regex]::Match($content, "(?m)^$key=(.*)$").Groups[1].Value.Trim()
    if ([string]::IsNullOrWhiteSpace($existingSecret)) {
        $secret = [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(24))
        if ($content -match "(?m)^$key=") {
            $content = [regex]::Replace($content, "(?m)^$key=.*$", "$key=$secret")
        } else {
            $content = $content.TrimEnd() + "`n$key=$secret`n"
        }
    }
}
[IO.File]::WriteAllText($environmentPath, $content, [Text.UTF8Encoding]::new($false))
$clientSecret = [regex]::Match($content, '(?m)^KEYCLOAK_CLIENT_SECRET=(.+)$').Groups[1].Value.Trim()
$realm = @{
    realm = 'gateway-development'; enabled = $true
    clients = @(@{ clientId = 'gateway-reader'; secret = $clientSecret; enabled = $true
        publicClient = $false; fullScopeAllowed = $false; serviceAccountsEnabled = $true
        standardFlowEnabled = $false; directAccessGrantsEnabled = $false })
    clientScopeMappings = @{ 'realm-management' = @(@{ client = 'gateway-reader'; roles = @('view-realm') }) }
    users = @(@{ username = 'service-account-gateway-reader'; enabled = $true
        serviceAccountClientId = 'gateway-reader'
        clientRoles = @{ 'realm-management' = @('view-realm') } })
}
$realmPath = Join-Path $environmentDirectory '.keycloak-realm.json'
[IO.File]::WriteAllText($realmPath, ($realm | ConvertTo-Json -Depth 10), [Text.UTF8Encoding]::new($false))
Write-Output 'Prepared ignored development credentials and a read-only Keycloak service account import.'
