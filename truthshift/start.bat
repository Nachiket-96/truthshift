@echo off
REM TruthShift - double-click to start the app on Windows.
REM Needs Python 3.10+ and Node.js 20+ installed.
cd /d "%~dp0"

where python >nul 2>nul || (echo Python is not installed. Get it from https://www.python.org/downloads/ & pause & exit /b 1)
where npm >nul 2>nul || (echo Node.js is not installed. Get it from https://nodejs.org/ & pause & exit /b 1)

echo Installing backend packages, first run takes a minute...
python -m pip install -q -r backend\requirements.txt

if not exist frontend\node_modules (
  echo Installing app packages, first run takes a minute...
  pushd frontend
  call npm install
  popd
)

start "TruthShift backend" cmd /k "cd /d "%~dp0backend" && python -m uvicorn app.main:app --port 8000"
start "TruthShift app" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo TruthShift is starting in two new windows. Keep them open.
echo.
echo   Laptop: https://localhost:5173
echo   Phone : look in the "TruthShift app" window for the line "Network: https://..."
echo           and open that address on your phone (same Wi-Fi).
echo.
echo Your browser will warn "Your connection is not private". This is expected:
echo click Advanced, then Proceed.
echo.
timeout /t 6 >nul
start "" https://localhost:5173
pause
