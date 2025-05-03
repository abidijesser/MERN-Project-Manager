@echo off
echo ===================================================
echo Setting up and starting the Admin application with npm
echo ===================================================

echo Step 1: Cleaning up old installations...
if exist node_modules (
    echo Removing old node_modules folder...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    echo Removing old package-lock.json...
    del package-lock.json
)

echo Step 2: Installing dependencies...
call npm install

echo Step 3: Installing vite explicitly...
call npm install vite --save-dev

echo Step 4: Starting the application...
call npm start

pause
