#!/bin/bash

# AidLink API Test Script
# Make sure the server is running on http://localhost:5000

API_URL="http://localhost:5000/api"
TOKEN=""
ORG_ID=""
REPORT_ID=""

echo "🧪 Testing AidLink API..."
echo ""

# 1. Health Check
echo "1️⃣ Testing Health Check..."
curl -s "$API_URL/health" | jq
echo ""
echo "---"

# 2. Register Organization
echo "2️⃣ Testing Organization Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "UNHCR Kakuma",
    "email": "test@unhcr.org",
    "password": "secure123",
    "sector": "Protection"
  }')

echo $REGISTER_RESPONSE | jq
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.token')
ORG_ID=$(echo $REGISTER_RESPONSE | jq -r '.data.organization.id')
echo "Token: $TOKEN"
echo "Org ID: $ORG_ID"
echo ""
echo "---"

# 3. Login
echo "3️⃣ Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@unhcr.org",
    "password": "secure123"
  }')
echo $LOGIN_RESPONSE | jq
echo ""
echo "---"

# 4. Get Current Organization Profile
echo "4️⃣ Testing Get Profile (Protected)..."
curl -s "$API_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""
echo "---"

# 5. Get All Organizations (Public)
echo "5️⃣ Testing Get Organizations (Public)..."
curl -s "$API_URL/organizations" | jq
echo ""
echo "---"

# 6. Submit Anonymous Report
echo "6️⃣ Testing Anonymous Report Submission..."
REPORT_RESPONSE=$(curl -s -X POST "$API_URL/reports" \
  -H "Content-Type: application/json" \
  -d "{
    \"category\": \"water\",
    \"title\": \"Water supply interruption\",
    \"area\": \"Kakuma 1\",
    \"description\": \"Water taps in block C have been dry for two days affecting residents\",
    \"organizationId\": \"$ORG_ID\",
    \"urgency\": \"high\"
  }")
echo $REPORT_RESPONSE | jq
REPORT_ID=$(echo $REPORT_RESPONSE | jq -r '.data.id')
echo "Report ID: $REPORT_ID"
echo ""
echo "---"

# 7. Get Organization Reports
echo "7️⃣ Testing Get Organization Reports (Protected)..."
curl -s "$API_URL/reports/org" \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""
echo "---"

# 8. Update Report Status
echo "8️⃣ Testing Update Report Status (Protected)..."
curl -s -X PATCH "$API_URL/reports/org/$REPORT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "notes": "Team dispatched to investigate the issue"
  }' | jq
echo ""
echo "---"

# 9. Batch Sync Reports
echo "9️⃣ Testing Batch Sync..."
curl -s -X POST "$API_URL/reports/batch" \
  -H "Content-Type: application/json" \
  -d "{
    \"reports\": [
      {
        \"id\": \"local-1\",
        \"category\": \"health\",
        \"title\": \"Medical clinic closure\",
        \"description\": \"Clinic closed unexpectedly affecting many residents\",
        \"organizationId\": \"$ORG_ID\",
        \"urgency\": \"medium\"
      },
      {
        \"id\": \"local-2\",
        \"category\": \"education\",
        \"title\": \"School supplies shortage\",
        \"description\": \"Students need notebooks and pens for upcoming term\",
        \"organizationId\": \"$ORG_ID\",
        \"urgency\": \"low\"
      }
    ]
  }" | jq
echo ""
echo "---"

echo "✅ All tests completed!"
