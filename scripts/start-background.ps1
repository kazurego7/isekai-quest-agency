$ErrorActionPreference = 'Stop'

$projectPath = Split-Path -Parent $PSScriptRoot
$localPath = Join-Path $projectPath '.local'
$startupLogPath = Join-Path $localPath 'app-startup.log'
$dbLogPath = Join-Path $localPath 'app-db-startup.log'
$dbErrorLogPath = Join-Path $localPath 'app-db-startup-error.log'
$devLogPath = Join-Path $localPath 'app-dev.log'
$devErrorLogPath = Join-Path $localPath 'app-dev-error.log'
$appPort = 3000

New-Item -ItemType Directory -Force -Path $localPath | Out-Null

function Write-StartupLog([string]$message) {
  Add-Content -LiteralPath $startupLogPath -Value ("[{0}] {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $message) -Encoding utf8NoBOM
}

try {
  $existingApp = Get-NetTCPConnection -LocalPort $appPort -State Listen -ErrorAction SilentlyContinue
  if ($existingApp) {
    Write-StartupLog "アプリはすでに起動しています (ポート $appPort)。"
    exit 0
  }

  $registeredPath = @(
    [Environment]::GetEnvironmentVariable('Path', 'Machine')
    [Environment]::GetEnvironmentVariable('Path', 'User')
  ) -join ';'
  $pathEntries = @($env:Path, $registeredPath) -join ';' -split ';' |
    Where-Object { $_ } |
    ForEach-Object { [Environment]::ExpandEnvironmentVariables($_) } |
    Select-Object -Unique
  $env:Path = $pathEntries -join ';'

  $nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
  if (-not $nodeCommand) {
    throw 'PATH上にNode.jsが見つかりません。'
  }
  foreach ($postgresCommand in @('initdb.exe', 'pg_ctl.exe', 'psql.exe', 'createdb.exe')) {
    if (-not (Get-Command $postgresCommand -ErrorAction SilentlyContinue)) {
      throw "PATH上にPostgreSQLの実行ファイルが見つかりません: $postgresCommand"
    }
  }
  Set-Location -LiteralPath $projectPath

  Write-StartupLog '開発用DBを起動しています。'
  $dbScriptPath = Join-Path $projectPath 'scripts/local-db.ps1'
  $dbProcess = Start-Process `
    -FilePath (Join-Path $PSHOME 'pwsh.exe') `
    -ArgumentList @('-NoLogo', '-NoProfile', '-NonInteractive', '-File', $dbScriptPath) `
    -WorkingDirectory $projectPath `
    -WindowStyle Hidden `
    -RedirectStandardOutput $dbLogPath `
    -RedirectStandardError $dbErrorLogPath `
    -PassThru
  $dbDeadline = (Get-Date).AddSeconds(60)
  while (-not $dbProcess.HasExited -and (Get-Date) -lt $dbDeadline) {
    Start-Sleep -Milliseconds 250
    $dbProcess.Refresh()
  }
  if (-not $dbProcess.HasExited) {
    Stop-Process -Id $dbProcess.Id -Force -ErrorAction SilentlyContinue
    throw '開発用DBの起動がタイムアウトしました。'
  }
  $dbExitCode = $dbProcess.ExitCode
  if ($dbExitCode -ne 0) {
    throw "開発用DBの起動に失敗しました (終了コード: $dbExitCode)。"
  }

  Write-StartupLog 'Next.js開発サーバーをバックグラウンド起動しています。'
  $nextCliPath = Join-Path $projectPath 'node_modules/next/dist/bin/next'
  if (-not (Test-Path -LiteralPath $nextCliPath)) {
    throw "Next.jsのCLIが見つかりません: $nextCliPath"
  }
  Start-Process `
    -FilePath $nodeCommand.Source `
    -ArgumentList @($nextCliPath, 'dev') `
    -WorkingDirectory $projectPath `
    -WindowStyle Hidden `
    -RedirectStandardOutput $devLogPath `
    -RedirectStandardError $devErrorLogPath | Out-Null

  Write-StartupLog "起動処理を完了しました。http://localhost:$appPort"
}
catch {
  Write-StartupLog "起動に失敗しました: $($_.Exception.Message)"
  exit 1
}
