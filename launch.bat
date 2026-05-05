@echo off
cd /d "%~dp0"
start /B node server.cjs
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000/index.html"
exit