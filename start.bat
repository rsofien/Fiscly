@echo off
setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     Fiscly Invoice Management - Full Stack Setup       ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check dependencies
echo Checking dependencies...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo ✗ Node.js is not installed
  exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js %NODE_VERSION%

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo ✗ npm is not installed
  exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✓ npm %NPM_VERSION%

where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo ⚠ Docker not found - will need PostgreSQL installed locally
  set HAS_DOCKER=false
) else (
  echo ✓ Docker is available
  set HAS_DOCKER=true
)

echo.
echo Starting services...
echo.

REM Create logs directory
if not exist logs mkdir logs

REM Start frontend
echo Starting Next.js Frontend on port 3000...
cd invoice-app
start "Fiscly Frontend" cmd /k npm run dev
cd ..
echo ✓ Frontend started

timeout /t 2 /nobreak

REM Start backend
echo Starting Strapi Backend on port 1337...
cd invoice-backend

if "%HAS_DOCKER%"=="true" (
  echo Starting PostgreSQL with Docker Compose...
  docker-compose up -d
  timeout /t 5 /nobreak
)

start "Fiscly Backend" cmd /k npm run develop
cd ..
echo ✓ Backend started

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║           Services are starting up...                  ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:1337
echo Admin:    http://localhost:1337/admin
echo.
echo Login credentials:
echo   Email:    admin@acme.com
echo   Password: password123
echo.
echo Press any key to continue...
pause >nul
