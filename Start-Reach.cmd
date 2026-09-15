@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required to run this local copy. See README.md.
  pause
  exit /b 1
)
if not exist node_modules call npm ci
if not exist node_modules exit /b 1
if not exist dist\index.html call npm run build
if not exist dist\index.html exit /b 1
echo Open http://localhost:4173 in your browser. Keep this window open.
node node_modules\vite\bin\vite.js preview --host 127.0.0.1 --port 4173 --strictPort
pause
