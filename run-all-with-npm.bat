@echo off
echo ===================================================
echo Running all applications with npm
echo ===================================================

:: Stop any processes running on ports 3000, 3001, and 5173
echo Stopping any existing processes on ports 3000, 3001, and 5173...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Stopping process with PID: %%a on port 3000
    taskkill /F /PID %%a 2>nul
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo Stopping process with PID: %%a on port 3001
    taskkill /F /PID %%a 2>nul
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    echo Stopping process with PID: %%a on port 5173
    taskkill /F /PID %%a 2>nul
)

echo Starting Server on port 3001...
start cmd /k "cd Server && npm install && npm run dev"

echo Starting Client on port 3000...
start cmd /k "cd Client && npm install && npm start"

echo Starting Admin on port 5173...
start cmd /k "cd Admin\mantis-free-react-admin-template-master && call fix-dependencies.bat"

echo All applications started!
echo Server: http://192.168.33.10:3001
echo Client: http://192.168.33.10:3000
echo Admin: http://192.168.33.10:5173

pause
