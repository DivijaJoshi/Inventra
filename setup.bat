@echo off
echo Setting up Inventra - Smart Inventory Management System
echo.

echo Installing Backend Dependencies...
cd backend
call npm install
echo Backend dependencies installed!
echo.

echo Installing Frontend Dependencies...
cd ..\frontend
call npm install
echo Frontend dependencies installed!
echo.

echo Setup Complete!
echo.
echo To start the application:
echo 1. Start MongoDB service
echo 2. Run 'npm run dev' in the backend folder
echo 3. Run 'npm run dev' in the frontend folder
echo 4. Open http://localhost:3000 in your browser
echo.
pause