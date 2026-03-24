@echo off
cd /d "%~dp0"
echo [Il Vento] Running pending commits from temp_commit.json...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$json = Get-Content 'temp_commit.json' -Raw | ConvertFrom-Json; " ^
  "$pending = $json | Where-Object { $_.status -eq 'pending' } | Sort-Object id; " ^
  "if ($pending.Count -eq 0) { Write-Host 'Nothing to commit.' -ForegroundColor Yellow; exit 0 } " ^
  "foreach ($entry in $pending) { " ^
    "Write-Host ('--- Commit ' + $entry.id + ': ' + $entry.command) -ForegroundColor Cyan; " ^
    "foreach ($file in $entry.files) { " ^
      "if (Test-Path $file) { git add $file } " ^
      "else { git rm --cached $file 2>$null } " ^
    "} " ^
    "Invoke-Expression $entry.command; " ^
    "if ($LASTEXITCODE -eq 0) { " ^
      "$entry.status = 'done'; " ^
      "Write-Host 'OK' -ForegroundColor Green " ^
    "} else { " ^
      "Write-Host 'FAILED — stopping.' -ForegroundColor Red; " ^
      "$json | ConvertTo-Json -Depth 10 | Set-Content 'temp_commit.json'; " ^
      "exit 1 " ^
    "} " ^
  "} " ^
  "$json | ConvertTo-Json -Depth 10 | Set-Content 'temp_commit.json'; " ^
  "Write-Host '' ; Write-Host 'All commits done.' -ForegroundColor Green"

echo.
pause
