[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$repositoryPath = Split-Path $PSScriptRoot -Parent
$environmentPath = Join-Path $repositoryPath '.env'
if (Test-Path -LiteralPath $environmentPath) {
    Write-Output 'Existing .env retained.'
    return
}
$content = Get-Content -Raw (Join-Path $repositoryPath '.env.example')
foreach ($key in @('POSTGRES_PASSWORD', 'SERVER_DATABASE_PASSWORD', 'ADMIN_DATABASE_PASSWORD')) {
    $secret = [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(24))
    $content = [regex]::Replace($content, "(?m)^$key=.*$", "$key=$secret")
}
[IO.File]::WriteAllText($environmentPath, $content, [Text.UTF8Encoding]::new($false))
Write-Output 'Created ignored .env with independent random local database passwords.'
