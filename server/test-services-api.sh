#!/bin/bash

# AidLink Services & Emergency Guides API Test Script
# Make sure the server is running on http://localhost:5000

API_URL="http://localhost:5000/api"
TOKEN=""

echo "🧪 Testing Services & Emergency Guides API..."
echo ""

# ESSENTIAL SERVICES TESTS

echo "=== ESSENTIAL SERVICES API ==="
echo ""

# 1. Get all services
echo "1️⃣ Testing Get All Services..."
curl -s "$API_URL/services" | jq
echo ""
echo "---"

# 2. Get service categories
echo "2️⃣ Testing Get Service Categories..."
curl -s "$API_URL/services/categories" | jq
echo ""
echo "---"

# 3. Get healthcare services
echo "3️⃣ Testing Get Healthcare Services..."
curl -s "$API_URL/services?category=health" | jq
echo ""
echo "---"

# 4. Search services
echo "4️⃣ Testing Search Services..."
curl -s "$API_URL/services?search=health" | jq
echo ""
echo "---"

# 5. Get specific service
echo "5️⃣ Testing Get Service by ID..."
curl -s "$API_URL/services/demo-health-01" | jq
echo ""
echo "---"

# 6. Test authenticated endpoints (need token from previous registration)
if [ ! -z "$TOKEN" ]; then
  echo "6️⃣ Testing Create Service (Protected)..."
  curl -s -X POST "$API_URL/services" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Test Health Center",
      "category": "health",
      "area": "Kakuma 1",
      "description": "A test health center providing basic services",
      "servicesOffered": ["Consultations", "Vaccinations", "Health education"]
    }' | jq
  echo ""
  echo "---"
fi

# EMERGENCY GUIDES TESTS

echo ""
echo "=== EMERGENCY GUIDES API ==="
echo ""

# 7. Get all emergency guides
echo "7️⃣ Testing Get All Emergency Guides..."
curl -s "$API_URL/emergency-guides" | jq
echo ""
echo "---"

# 8. Get emergency categories
echo "8️⃣ Testing Get Emergency Categories..."
curl -s "$API_URL/emergency-guides/categories" | jq
echo ""
echo "---"

# 9. Get medical guides
echo "9️⃣ Testing Get Medical Emergency Guides..."
curl -s "$API_URL/emergency-guides?category=medical" | jq
echo ""
echo "---"

# 10. Search guides
echo "🔟 Testing Search Emergency Guides..."
curl -s "$API_URL/emergency-guides?search=fire" | jq
echo ""
echo "---"

# 11. Get specific guide
echo "1️⃣1️⃣ Testing Get Emergency Guide by ID..."
curl -s "$API_URL/emergency-guides/fire-safety" | jq
echo ""
echo "---"

# 12. Test authenticated endpoints
if [ ! -z "$TOKEN" ]; then
  echo "1️⃣2️⃣ Testing Create Emergency Guide (Protected)..."
  curl -s -X POST "$API_URL/emergency-guides" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Test Storm Safety",
      "category": "weather",
      "summary": "Steps to take during severe storms",
      "steps": [
        "Move to safe shelter",
        "Stay away from windows",
        "Monitor weather updates"
      ],
      "reminder": "Always follow official warnings"
    }' | jq
  echo ""
  echo "---"
fi

echo ""
echo "✅ All services & emergency guides tests completed!"
echo ""
echo "💡 To test protected endpoints, first run the main test script to get a token:"
echo "   ./test-api.sh"
echo "   Then set TOKEN variable and run this script again."
