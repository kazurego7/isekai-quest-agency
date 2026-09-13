$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $PSScriptRoot
$localPath = Join-Path $projectPath '.local'
New-Item -ItemType Directory -Force -Path $localPath | Out-Null
$startupLogPath = Join-Path $localPath 'app-startup.log'
try {
  $registeredPath = @([Environment]::GetEnvironmentVariable('Path', 'Machine'), [Environment]::GetEnvironmentVariable('Path', 'User')) -join ';'
  $env:Path = (@($env:Path, $registeredPath) -join ';' -split ';' | Where-Object { $_ } | Select-Object -Unique) -join ';'
  $existing = Get-NetTCPConnection -LocalPort 5177 -State Listen -ErrorAction SilentlyContinue
  if ($existing) {
    foreach ($listener in $existing) {
      $owner = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)"
      if (-not $owner.CommandLine.Contains($projectPath) -or -not $owner.CommandLine.Contains('tailscale-server.mjs')) { throw '別のサーバーが5177を使用しています。開発サーバーを停止してから起動してください。' }
    }
    Add-Content -LiteralPath $startupLogPath -Value "[$(Get-Date -Format s)] Sites版は起動済みです。"
    exit 0
  }
  $nodePath = (Get-Command node.exe -ErrorAction Stop).Source
  if (-not (Test-Path -LiteralPath (Join-Path $projectPath '.local/tailscale-build/runtime.json'))) {
    throw 'npm run build:tailscale を実行してから起動してください。'
  }
  $entryPath = Join-Path $PSScriptRoot 'tailscale-server.mjs'
  $server = Start-Process -FilePath $nodePath -ArgumentList @('"' + $entryPath + '"') -WorkingDirectory $projectPath -WindowStyle Hidden -RedirectStandardOutput (Join-Path $localPath 'app-dev.log') -RedirectStandardError (Join-Path $localPath 'app-dev-error.log') -PassThru
  $deadline = (Get-Date).AddSeconds(60)
  do {
    Start-Sleep -Milliseconds 500
    $server.Refresh()
    if ($server.HasExited) { throw 'Sites版の起動に失敗しました。app-dev-error.logを確認してください。' }
    $ready = Get-NetTCPConnection -LocalPort 5177 -State Listen -ErrorAction SilentlyContinue
  } while (-not $ready -and (Get-Date) -lt $deadline)
  if (-not $ready) { throw 'Sites版の起動待機がタイムアウトしました。' }
  Add-Content -LiteralPath $startupLogPath -Value "[$(Get-Date -Format s)] Sites版を起動しました: http://127.0.0.1:5177/isekai/"
} catch {
  Add-Content -LiteralPath $startupLogPath -Value "[$(Get-Date -Format s)] $($_.Exception.Message)"
  throw
}
