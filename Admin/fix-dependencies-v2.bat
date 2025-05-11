@echo off
echo ===================================================
echo Fixing dependencies for Admin application
echo ===================================================

echo Removing node_modules and package-lock.json...
if exist node_modules (
    rmdir /s /q node_modules
)
if exist package-lock.json (
    del package-lock.json
)

echo Installing specific versions of framer-motion and motion-dom...
npm install framer-motion@11.16.0 motion-dom@11.16.0 --save-exact

echo Installing other dependencies...
npm install

echo Dependencies fixed! Now starting the application...
npm start

pause
