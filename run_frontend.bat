@echo off
setlocal enabledelayedexpansion

REM ── 1. Check for connected Android device (3 attempts) ──────────────────────
set DEVICE_FOUND=0
for /l %%i in (1,1,3) do (
    if "!DEVICE_FOUND!"=="0" (
        echo [Il Vento] adb devices attempt %%i of 3...
        adb devices 2>nul | findstr /r "device$" >nul
        if not errorlevel 1 set DEVICE_FOUND=1
    )
)
if "!DEVICE_FOUND!"=="0" (
    echo.
    echo [Il Vento] ERROR: No Android device detected after 3 attempts.
    echo            Connect a device via USB with USB debugging enabled, then retry.
    echo.
    pause
    exit /b 1
)
echo [Il Vento] Android device found.

REM ── 2. Detect local 192.168.x.x IP ────────────────────────────────────────
set LOCAL_IP=
for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /i "IPv4" ^| findstr "192.168"') do (
    set LOCAL_IP=%%A
    goto :ip_found
)
:ip_found
set LOCAL_IP=%LOCAL_IP: =%

if "%LOCAL_IP%"=="" (
    echo [Il Vento] WARNING: Could not detect a 192.168.x.x address.
    echo            Keeping existing EXPO_PUBLIC_API_DEVURL in frontend\.env.
) else (
    echo [Il Vento] Local IP: %LOCAL_IP%
    echo [Il Vento] Writing EXPO_PUBLIC_API_DEVURL=http://%LOCAL_IP%:3000 to frontend\.env
    powershell -NoProfile -Command ^
        "(Get-Content '%~dp0frontend\.env') -replace '^EXPO_PUBLIC_API_DEVURL=.*', 'EXPO_PUBLIC_API_DEVURL=http://%LOCAL_IP%:3000' | Set-Content '%~dp0frontend\.env'"
)

REM ── 3. Start Expo on Android ───────────────────────────────────────────────
cd /d "%~dp0frontend"
echo [Il Vento] Starting frontend (Android)...
npm run android

endlocal
