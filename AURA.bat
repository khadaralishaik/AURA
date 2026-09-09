@echo off
setlocal
set "ROOT=%~dp0"

echo Starting AURA backend...
start "AURA Backend" cmd /k "cd /d "%ROOT%backend" && .venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

echo Starting AURA frontend...
start "AURA Frontend" cmd /k "cd /d "%ROOT%frontend" && npm run dev"

timeout /t 4 /nobreak >nul
start "" http://localhost:5173

echo AURA is opening at http://localhost:5173
endlocal
