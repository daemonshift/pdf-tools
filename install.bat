@echo off
echo ============================================
echo    PDF Tools - Installation
echo ============================================
echo.

:: Verifier si Node.js est deja installe
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Node.js est deja installe.
    goto fin
)

echo [INFO] Telechargement de Node.js...
curl -o "%TEMP%\node-installer.msi" https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi

echo [INFO] Installation de Node.js...
msiexec /i "%TEMP%\node-installer.msi" /quiet /norestart

echo [OK] Node.js installe avec succes !

:fin
echo.
echo [OK] Installation terminee. Lancez launch.vbs pour demarrer l'application.
echo.
pause