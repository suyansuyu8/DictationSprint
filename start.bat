@echo off
set PORT=%1
if "%PORT%"=="" set PORT=8000
set HERE=%~dp0
cd /d "%HERE%"
start "" "http://localhost:%PORT%/app/"
where python >nul 2>&1
if %errorlevel%==0 (
  start "server" cmd /k python -m http.server %PORT%
) else (
  where py >nul 2>&1
  if %errorlevel%==0 (
    start "server" cmd /k py -m http.server %PORT%
  ) else (
    echo Python 3 not found. Install from https://www.python.org/
    pause
  )
)
