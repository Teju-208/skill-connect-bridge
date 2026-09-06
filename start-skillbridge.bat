@echo off
setlocal
cd /d "%~dp0"

echo ==========================================
echo        SKILLBRIDGE - STARTING SERVER
echo ==========================================

node -v >nul 2>&1
if errorlevel 1 goto :missing_node

if not exist node_modules (
  echo Installing required Node.js packages...
  call npm install
  if errorlevel 1 goto :install_failed
)

echo Starting SkillBridge...
start "SkillBridge Server" "%~dp0run-server.bat"
timeout /t 3 /nobreak >nul
start "" "http://localhost:3000"
goto :end

:missing_node
echo Node.js is not installed or is not available in PATH.
echo Install Node.js LTS from https://nodejs.org/ and run this file again.
pause
goto :end

:install_failed
echo npm install failed. Check your internet connection and try again.
pause

goto :end

:end
endlocal
