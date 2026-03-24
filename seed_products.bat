@echo off
cd /d "%~dp0backend"
echo [Il Vento] Seeding products...
npm run seed-products
