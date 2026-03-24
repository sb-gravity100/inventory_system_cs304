@echo off
REM ── run_all.bat — launch backend + frontend in split Windows Terminal panes ──

REM Try Windows Terminal (wt) split-pane layout first
where wt >nul 2>&1
if not errorlevel 1 (
    echo [Il Vento] Opening split panes in Windows Terminal...
    wt new-tab --title "Backend" cmd /k "%~dp0run_backend.bat" ; split-pane -H --title "Frontend" cmd /k "%~dp0run_frontend.bat"
    exit /b 0
)

REM Fallback: open two separate console windows
echo [Il Vento] Windows Terminal not found. Opening two separate windows...
start "Il Vento — Backend"  cmd /k "%~dp0run_backend.bat"
start "Il Vento — Frontend" cmd /k "%~dp0run_frontend.bat"
