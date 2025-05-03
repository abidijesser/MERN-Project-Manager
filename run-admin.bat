@echo off
echo ===================================================
echo Running Admin on port 5173
echo ===================================================

:: Stop any processes running on port 5173
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    echo Stopping process with PID: %%a on port 5173
    taskkill /F /PID %%a 2>nul
)

cd Admin\mantis-free-react-admin-template-master
call fix-dependencies.bat

pause
