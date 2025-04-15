@echo off
echo Checking if Yarn is installed...

yarn --version > nul 2>&1
if %errorlevel% neq 0 (
    echo Yarn is not installed. Installing Yarn...
    npm install -g yarn
    if %errorlevel% neq 0 (
        echo Failed to install Yarn. Please install it manually by running 'npm install -g yarn'.
        pause
        exit /b 1
    )
    echo Yarn installed successfully!
) else (
    echo Yarn is already installed.
)

echo You can now run the install-dependencies.bat script to install all dependencies.
pause
