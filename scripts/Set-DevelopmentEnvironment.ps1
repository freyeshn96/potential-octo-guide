[CmdletBinding()]
param([Parameter(Mandatory)][ValidateSet('Server', 'Admin')][string]$Service)
$ErrorActionPreference = 'Stop'
$repositoryPath = Split-Path $PSScriptRoot -Parent
$environmentPath = Join-Path $repositoryPath 'infrastructure/docker/.env'
if (-not (Test-Path -LiteralPath $environmentPath)) {
    throw 'Run scripts/Initialize-Development.ps1 first.'
}
$settings = @{}
foreach ($line in Get-Content $environmentPath) {
    if ($line -match '^([A-Z_]+)=(.*)$') { $settings[$Matches[1]] = $Matches[2].Trim() }
}
$prefix = $Service.ToUpperInvariant()
foreach ($suffix in @('DATABASE', 'DATABASE_USER', 'DATABASE_PASSWORD', 'PORT')) {
    if ([string]::IsNullOrWhiteSpace($settings["${prefix}_${suffix}"])) {
        throw "Missing ${prefix}_${suffix} in .env."
    }
}
$env:Database__ConnectionString = "Host=localhost;Port=$($settings['POSTGRES_PORT']);Database=$($settings["${prefix}_DATABASE"]);Username=$($settings["${prefix}_DATABASE_USER"]);Password=$($settings["${prefix}_DATABASE_PASSWORD"]);Timeout=5;Command Timeout=5"
$env:ASPNETCORE_ENVIRONMENT = 'Development'
$env:ASPNETCORE_URLS = "http://localhost:$($settings["${prefix}_PORT"])"
if ($Service -eq 'Server') {
    $providerUrl = $settings['KEYCLOAK_PUBLIC_URL']
    if ([string]::IsNullOrWhiteSpace($providerUrl)) { $providerUrl = 'http://localhost:8180' }
    $env:Keycloak__BaseUrl = $providerUrl
    $env:Keycloak__PublicIssuerUrl = "$providerUrl/realms/gateway-development"
    $env:Keycloak__AdministrativeApiUrl = "$providerUrl/admin"
    $env:Keycloak__AuthenticationRealm = 'gateway-development'
    $env:Keycloak__ClientId = 'gateway-reader'
    $env:Keycloak__ClientSecret = $settings['KEYCLOAK_CLIENT_SECRET']
    $env:Keycloak__AllowInsecureHttp = 'true'
}
Write-Output "Configured the current session for AuthGateway.$Service."
