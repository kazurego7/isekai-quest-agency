param([switch]$Stop)
$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $PSScriptRoot
$localPath = Join-Path $projectPath '.local'
$dataPath = Join-Path $localPath 'postgres'
$passwordPath = Join-Path $localPath 'db-password.txt'
$logPath = Join-Path $localPath 'postgres.log'
$port = 55432
$dbName = 'isekai_quest_agency'
$dbUser = 'quest_local'

foreach ($tool in @('initdb', 'pg_ctl', 'psql', 'createdb')) {
  if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
    throw "PostgreSQL の bin フォルダを PATH に追加してください。見つからないコマンド: $tool"
  }
}
if ($Stop) {
  if (Test-Path (Join-Path $dataPath 'PG_VERSION')) {
    & pg_ctl -D $dataPath status *> $null
    if ($LASTEXITCODE -eq 0) {
      & pg_ctl -D $dataPath -m fast -w stop
      if ($LASTEXITCODE -ne 0) { throw 'DBを停止できませんでした。' }
    }
  }
  exit 0
}
New-Item -ItemType Directory -Force -Path $localPath | Out-Null
if (-not (Test-Path (Join-Path $dataPath 'PG_VERSION'))) {
  $dbPassword = [guid]::NewGuid().ToString('N')
  Set-Content -LiteralPath $passwordPath -Value $dbPassword -Encoding utf8NoBOM
  & initdb -D $dataPath -U $dbUser --auth=scram-sha-256 --pwfile=$passwordPath --encoding=UTF8 --locale=C
  if ($LASTEXITCODE -ne 0) { throw '検証用とは別の開発用DBを初期化できませんでした。' }
}
if (-not (Test-Path $passwordPath)) { throw '開発用DBのパスワードファイルが見つかりません。' }
$dbPassword = (Get-Content -LiteralPath $passwordPath -Raw).Trim()
& pg_ctl -D $dataPath status *> $null
if ($LASTEXITCODE -ne 0) {
  & pg_ctl -D $dataPath -l $logPath -o "-h 127.0.0.1 -p $port" -w start
  if ($LASTEXITCODE -ne 0) { throw 'DBを起動できませんでした。ポート55432の使用状況を確認してください。' }
}
$previousPassword = $env:PGPASSWORD
try {
  $env:PGPASSWORD = $dbPassword
  $exists = & psql -h 127.0.0.1 -p $port -U $dbUser -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$dbName'"
  if ($LASTEXITCODE -ne 0) { throw 'DBに接続できませんでした。' }
  if ($exists -ne '1') {
    & createdb -h 127.0.0.1 -p $port -U $dbUser $dbName
    if ($LASTEXITCODE -ne 0) { throw 'データベースを作成できませんでした。' }
  }
} finally { $env:PGPASSWORD = $previousPassword }

$envPath = Join-Path $projectPath '.env.local'
$lines = if (Test-Path $envPath) { @(Get-Content -LiteralPath $envPath) } else { @() }
$connection = "postgresql://${dbUser}:${dbPassword}@127.0.0.1:${port}/${dbName}"
$lines = @($lines | Where-Object { $_ -notmatch '^DATABASE_URL=' })
$lines += 'DATABASE_URL="' + $connection + '"'
if (-not ($lines | Where-Object { $_ -match '^NEXTAUTH_SECRET=' })) {
  $lines += 'NEXTAUTH_SECRET="' + [guid]::NewGuid().ToString('N') + '"'
}
if (-not ($lines | Where-Object { $_ -match '^NEXTAUTH_URL=' })) {
  $lines += 'NEXTAUTH_URL="http://localhost:3000"'
}
Set-Content -LiteralPath $envPath -Value $lines -Encoding utf8NoBOM
Write-Host "開発用DBを起動しました (127.0.0.1:$port / $dbName)。"
Write-Host '初回は pnpm db:push、pnpm db:generate を実行してください。'
