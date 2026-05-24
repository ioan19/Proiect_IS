@echo off
REM DroneMetrics Industrial Grade - Quick Start Setup (Windows)

echo.
echo ========================================
echo 🚀 DroneMetrics Industrial Grade Setup
echo ========================================
echo.

REM Check if Docker is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

echo ✅ Docker is running

echo.
echo 🗄️ Starting PostgreSQL database...
docker-compose up -d

echo ⏳ Waiting for database to be ready...
timeout /t 5 /nobreak

echo.
echo ✅ Database started!

echo.
echo 📦 Installing frontend dependencies...
cd frontend
call npm install

echo.
echo ========================================
echo ✅ Setup Complete!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Start development server:
echo    npm run dev
echo.
echo 2. Open browser:
echo    Frontend:  http://localhost:5173
echo    Backend:   http://localhost:8000
echo.
echo Database is running in Docker
echo ========================================
echo.
pause
