@echo off
REM Backend startup script for Windows
REM This script starts the FastAPI server with Supabase integration

setlocal enabledelayedexpansion

REM Check if .env file exists
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please copy .env.example to .env and fill in your Supabase credentials
    echo SUPABASE_URL=https://YOUR_PROJECT.supabase.co
    echo SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    pause
    exit /b 1
)

REM Load environment variables from .env
for /f "usebackq tokens=* delims=" %%a in (".env") do (
    set "%%a"
)

REM Set defaults if not in .env
if not defined PORT set PORT=8000
if not defined HOST set HOST=0.0.0.0

echo.
echo ================================
echo  Zayren App - Backend Server
echo ================================
echo.
echo Configuration:
echo   API_URL: %SUPABASE_URL%
echo   Service Role Key: %SUPABASE_SERVICE_ROLE_KEY:~0,20%...
echo   Server: http://%HOST%:%PORT%
echo.
echo Starting backend server...
echo.

REM Use main_diagnostic.py for detailed logging, or main_fixed.py for production
echo.
echo Starting with enhanced diagnostics (main_diagnostic.py)...
echo.

python -m uvicorn main_diagnostic:app --host %HOST% --port %PORT% --reload

if errorlevel 1 (
    echo.
    echo ERROR: Failed to start backend
    echo Please check:
    echo   1. Python is installed (pip --version)
    echo   2. Dependencies installed (pip install -r requirements.txt)
    echo   3. .env file has correct values
    echo.
    pause
    exit /b 1
)
