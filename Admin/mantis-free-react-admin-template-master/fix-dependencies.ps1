# Fix dependencies for Admin application
Write-Host "===================================================
Fixing dependencies for Admin application
==================================================="

Write-Host "Removing node_modules and package-lock.json..."
if (Test-Path node_modules) {
    Remove-Item -Recurse -Force node_modules
}
if (Test-Path package-lock.json) {
    Remove-Item -Force package-lock.json
}

Write-Host "Installing specific versions of framer-motion and motion-dom..."
npm install framer-motion@10.16.4 motion-dom@10.16.4 --save-exact

Write-Host "Installing other dependencies..."
npm install

Write-Host "Dependencies fixed! Now starting the application..."
npm start

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
