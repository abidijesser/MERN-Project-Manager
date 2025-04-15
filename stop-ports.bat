@echo off
echo Stopping processes on ports 3000 and 5173...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Killing process with PID: %%a on port 3000
    taskkill /F /PID %%a
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    echo Killing process with PID: %%a on port 5173
    taskkill /F /PID %%a
)

echo All processes on ports 3000 and 5173 have been stopped.
pause
