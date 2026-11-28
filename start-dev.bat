@echo off
echo ========================================
echo   Starting AidLink Development Servers
echo ========================================
echo.

REM Check if node_modules exist
if not exist "server\node_modules\" (
    echo Installing backend dependencies...
    cd server
    call npm install
    cd ..
)

if not exist "client\node_modules\" (
    echo Installing frontend dependencies...
    cd client
    call npm install
    cd ..
)

echo.
echo Starting Backend Server on port 3000...
start "AidLink Backend" cmd /k "cd server && npm start"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server on port 5174...
start "AidLink Frontend" cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo   Servers Starting!
echo ========================================
echo   Backend:  http://localhost:3000
echo   Frontend: http://localhost:5174
echo ========================================
echo.
echo Press any key to close this window...
pause > nul
