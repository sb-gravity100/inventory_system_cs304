@echo off
cd /d "%~dp0backend"
echo [Il Vento] Resetting database...
npm run reset-db
pause
