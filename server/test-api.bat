@echo off
REM AidLink API Test Script for Windows
REM Make sure the server is running on http://localhost:5000

set API_URL=http://localhost:5000/api

echo 🧪 Testing AidLink API...
echo.

echo 1️⃣ Testing Health Check...
curl -s %API_URL%/health
echo.
echo ---
echo.

echo 2️⃣ Testing Organization Registration...
curl -s -X POST %API_URL%/auth/register -H "Content-Type: application/json" -d "{\"name\":\"UNHCR Kakuma\",\"email\":\"test@unhcr.org\",\"password\":\"secure123\",\"sector\":\"Protection\"}"
echo.
echo ---
echo.

echo 3️⃣ Testing Get Organizations (Public)...
curl -s %API_URL%/organizations
echo.
echo ---
echo.

echo 4️⃣ Testing Submit Report...
curl -s -X POST %API_URL%/reports -H "Content-Type: application/json" -d "{\"category\":\"water\",\"title\":\"Water supply issue\",\"description\":\"Water taps have been dry for two days in block C\",\"organizationId\":\"replace-with-actual-org-id\",\"urgency\":\"high\"}"
echo.
echo ---
echo.

echo ✅ Basic tests completed!
echo.
echo Note: For full tests with authentication, manually replace ORG_ID and TOKEN
pause
