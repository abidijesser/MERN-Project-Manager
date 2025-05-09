@echo off
echo ===================================================
echo Running Client on port 3000
echo ===================================================

:: Stop any processes running on port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Stopping process with PID: %%a on port 3000
    taskkill /F /PID %%a 2>nul
)

cd Client
npm install
npm start

pause
