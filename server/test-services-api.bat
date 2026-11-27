@echo off
REM AidLink Services & Emergency Guides API Test Script for Windows
REM Make sure the server is running on http://localhost:5000

set API_URL=http://localhost:5000/api

echo 🧪 Testing Services & Emergency Guides API...
echo.

echo === ESSENTIAL SERVICES API ===
echo.

echo 1️⃣ Testing Get All Services...
curl -s %API_URL%/services
echo.
echo ---
echo.

echo 2️⃣ Testing Get Service Categories...
curl -s %API_URL%/services/categories
echo.
echo ---
echo.

echo 3️⃣ Testing Get Healthcare Services...
curl -s %API_URL%/services?category=health
echo.
echo ---
echo.

echo 4️⃣ Testing Get Service by ID...
curl -s %API_URL%/services/demo-health-01
echo.
echo ---
echo.

echo.
echo === EMERGENCY GUIDES API ===
echo.

echo 5️⃣ Testing Get All Emergency Guides...
curl -s %API_URL%/emergency-guides
echo.
echo ---
echo.

echo 6️⃣ Testing Get Emergency Categories...
curl -s %API_URL%/emergency-guides/categories
echo.
echo ---
echo.

echo 7️⃣ Testing Get Medical Emergency Guides...
curl -s %API_URL%/emergency-guides?category=medical
echo.
echo ---
echo.

echo 8️⃣ Testing Get Emergency Guide by ID...
curl -s %API_URL%/emergency-guides/fire-safety
echo.
echo ---
echo.

echo ✅ All tests completed!
echo.
pause
