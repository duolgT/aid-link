# Essential Services & Emergency Guidance API Documentation

Complete API reference for Essential Services and Emergency Guidance endpoints.

---

## 📋 Table of Contents

1. [Essential Services API](#essential-services-api)
2. [Emergency Guidance API](#emergency-guidance-api)
3. [Data Models](#data-models)
4. [Testing Examples](#testing-examples)

---

## Essential Services API

### 1. Get All Services

**GET** `/api/services`

Retrieve all essential services with optional filtering.

**Query Parameters:**
- `category` (optional) - Filter by category (health, education, water, protection, livelihoods)
- `area` (optional) - Filter by area/location
- `verified` (optional) - Filter by verification status (true/false)
- `search` (optional) - Search in name and description

**Examples:**
```bash
# Get all services
GET /api/services

# Get healthcare services
GET /api/services?category=health

# Get verified services in Kakuma
GET /api/services?verified=true&area=Kakuma

# Search for water-related services
GET /api/services?search=water
```

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "id": "demo-health-01",
      "name": "Sample Community Health Centre",
      "category": "health",
      "area": "Kakuma — example only",
      "description": "Illustrates how residents could find information...",
      "servicesOffered": [
        "General consultations",
        "Health information",
        "Referral guidance"
      ],
      "coordinates": null,
      "phone": null,
      "verified": false,
      "isDemo": true,
      "createdAt": "2026-11-01T00:00:00.000Z",
      "updatedAt": "2026-11-01T00:00:00.000Z"
    }
  ]
}
```

---

### 2. Get Service by ID

**GET** `/api/services/:id`

Retrieve a single service by its ID.

**Example:**
```bash
GET /api/services/demo-health-01
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "demo-health-01",
    "name": "Sample Community Health Centre",
    "category": "health",
    "area": "Kakuma — example only",
    "description": "Illustrates how residents could find information...",
    "servicesOffered": [
      "General consultations",
      "Health information",
      "Referral guidance"
    ],
    "coordinates": null,
    "phone": null,
    "verified": false,
    "isDemo": true,
    "createdAt": "2026-11-01T00:00:00.000Z",
    "updatedAt": "2026-11-01T00:00:00.000Z"
  }
}
```

**Error Response:** `404 Not Found`
```json
{
  "success": false,
  "message": "Service not found"
}
```

---

### 3. Get Service Categories

**GET** `/api/services/categories`

Retrieve all available service categories.

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 6,
  "data": [
    { "id": "all", "label": "All Services" },
    { "id": "health", "label": "Healthcare" },
    { "id": "education", "label": "Education" },
    { "id": "water", "label": "Water & Sanitation" },
    { "id": "protection", "label": "Protection" },
    { "id": "livelihoods", "label": "Livelihoods" }
  ]
}
```

---

### 4. Create Service (Protected)

**POST** `/api/services`

Create a new essential service. Requires authentication.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Community Health Clinic",
  "category": "health",
  "area": "Kakuma 2",
  "description": "Provides primary healthcare services and health education",
  "servicesOffered": [
    "General consultations",
    "Vaccinations",
    "Health screenings"
  ],
  "coordinates": {
    "lat": 3.1234,
    "lng": 35.5678
  },
  "phone": "+254700000000"
}
```

**Validation Rules:**
- `name` - Required, min 3 characters
- `category` - Required
- `description` - Required, min 10 characters
- `servicesOffered` - Required, array with at least 1 item
- `area` - Optional
- `coordinates` - Optional, object with lat/lng
- `phone` - Optional

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Service created successfully",
  "data": {
    "id": "service-1732712400000-abc123",
    "name": "Community Health Clinic",
    "category": "health",
    "area": "Kakuma 2",
    "description": "Provides primary healthcare services...",
    "servicesOffered": [
      "General consultations",
      "Vaccinations",
      "Health screenings"
    ],
    "coordinates": {
      "lat": 3.1234,
      "lng": 35.5678
    },
    "phone": "+254700000000",
    "verified": false,
    "isDemo": false,
    "organizationId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2026-11-27T13:00:00.000Z",
    "updatedAt": "2026-11-27T13:00:00.000Z"
  }
}
```

---

### 5. Update Service (Protected)

**PATCH** `/api/services/:id`

Update an existing service. Organizations can only update their own services.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:** (send only fields to update)
```json
{
  "phone": "+254711111111",
  "servicesOffered": [
    "General consultations",
    "Vaccinations",
    "Health screenings",
    "Emergency care"
  ]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Service updated successfully",
  "data": {
    "id": "service-1732712400000-abc123",
    "phone": "+254711111111",
    "servicesOffered": [
      "General consultations",
      "Vaccinations",
      "Health screenings",
      "Emergency care"
    ],
    "updatedAt": "2026-11-27T14:00:00.000Z",
    ...
  }
}
```

---

### 6. Delete Service (Protected)

**DELETE** `/api/services/:id`

Delete a service. Organizations can only delete their own services.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Service deleted successfully"
}
```

---

## Emergency Guidance API

### 7. Get All Emergency Guides

**GET** `/api/emergency-guides`

Retrieve all emergency guides with optional filtering.

**Query Parameters:**
- `category` (optional) - Filter by category (medical, fire, protection, water, weather, family)
- `verified` (optional) - Filter by local verification status (true/false)
- `search` (optional) - Search in title and summary

**Examples:**
```bash
# Get all guides
GET /api/emergency-guides

# Get medical guides
GET /api/emergency-guides?category=medical

# Get verified guides
GET /api/emergency-guides?verified=true

# Search for fire safety
GET /api/emergency-guides?search=fire
```

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "id": "medical-help",
      "title": "Finding Emergency Medical Help",
      "category": "medical",
      "summary": "Learn how to seek professional medical assistance.",
      "steps": [
        "Check that the surrounding area is safe.",
        "Seek qualified medical assistance promptly.",
        "Explain what happened to healthcare personnel.",
        "Follow instructions from qualified responders."
      ],
      "reminder": "This information does not replace medical treatment.",
      "locallyVerified": false,
      "createdAt": "2026-11-01T00:00:00.000Z",
      "updatedAt": "2026-11-01T00:00:00.000Z"
    }
  ]
}
```

---

### 8. Get Emergency Guide by ID

**GET** `/api/emergency-guides/:id`

Retrieve a single emergency guide by its ID.

**Example:**
```bash
GET /api/emergency-guides/fire-safety
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "fire-safety",
    "title": "Fire Safety",
    "category": "fire",
    "summary": "General precautions when a fire occurs.",
    "steps": [
      "Move away from the fire and warn others nearby.",
      "Avoid entering burning structures.",
      "Keep away from smoke and other hazards.",
      "Contact appropriate local emergency responders."
    ],
    "reminder": "Never re-enter a burning building for belongings.",
    "locallyVerified": false,
    "createdAt": "2026-11-01T00:00:00.000Z",
    "updatedAt": "2026-11-01T00:00:00.000Z"
  }
}
```

---

### 9. Get Emergency Categories

**GET** `/api/emergency-guides/categories`

Retrieve all available emergency guide categories.

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 7,
  "data": [
    { "id": "all", "label": "All Guides" },
    { "id": "medical", "label": "Medical" },
    { "id": "fire", "label": "Fire Safety" },
    { "id": "protection", "label": "Protection" },
    { "id": "water", "label": "Water Safety" },
    { "id": "weather", "label": "Weather" },
    { "id": "family", "label": "Family Support" }
  ]
}
```

---

### 10. Create Emergency Guide (Protected)

**POST** `/api/emergency-guides`

Create a new emergency guide. Requires authentication.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Severe Storm Safety",
  "category": "weather",
  "summary": "Steps to take during severe storms and high winds",
  "steps": [
    "Move indoors to a sturdy building",
    "Stay away from windows and doors",
    "Avoid open areas and tall structures",
    "Wait for official all-clear signal"
  ],
  "reminder": "Always follow local weather warnings"
}
```

**Validation Rules:**
- `title` - Required, min 3 characters
- `category` - Required
- `summary` - Required, min 10 characters
- `steps` - Required, array with at least 2 items
- `reminder` - Optional

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Emergency guide created successfully",
  "data": {
    "id": "guide-1732712400000-xyz789",
    "title": "Severe Storm Safety",
    "category": "weather",
    "summary": "Steps to take during severe storms and high winds",
    "steps": [
      "Move indoors to a sturdy building",
      "Stay away from windows and doors",
      "Avoid open areas and tall structures",
      "Wait for official all-clear signal"
    ],
    "reminder": "Always follow local weather warnings",
    "locallyVerified": false,
    "organizationId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2026-11-27T13:00:00.000Z",
    "updatedAt": "2026-11-27T13:00:00.000Z"
  }
}
```

---

### 11. Update Emergency Guide (Protected)

**PATCH** `/api/emergency-guides/:id`

Update an existing emergency guide. Organizations can only update their own guides.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:** (send only fields to update)
```json
{
  "steps": [
    "Move indoors to a sturdy building immediately",
    "Stay away from windows and doors",
    "Avoid open areas and tall structures",
    "Monitor local emergency broadcasts",
    "Wait for official all-clear signal"
  ],
  "locallyVerified": true
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Emergency guide updated successfully",
  "data": {
    "id": "guide-1732712400000-xyz789",
    "steps": [...],
    "locallyVerified": true,
    "updatedAt": "2026-11-27T14:00:00.000Z",
    ...
  }
}
```

---

### 12. Delete Emergency Guide (Protected)

**DELETE** `/api/emergency-guides/:id`

Delete an emergency guide. Organizations can only delete their own guides.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Emergency guide deleted successfully"
}
```

---

## Data Models

### Service Model
```typescript
{
  id: string
  name: string
  category: 'health' | 'education' | 'water' | 'protection' | 'livelihoods'
  area: string
  description: string
  servicesOffered: string[]
  coordinates: { lat: number, lng: number } | null
  phone: string | null
  verified: boolean
  isDemo: boolean
  organizationId?: string
  createdAt: string (ISO-8601)
  updatedAt: string (ISO-8601)
}
```

### Emergency Guide Model
```typescript
{
  id: string
  title: string
  category: 'medical' | 'fire' | 'protection' | 'water' | 'weather' | 'family'
  summary: string
  steps: string[]
  reminder: string | null
  locallyVerified: boolean
  organizationId?: string
  createdAt: string (ISO-8601)
  updatedAt: string (ISO-8601)
}
```

---

## Testing Examples

### Using curl

```bash
# 1. Get all services
curl http://localhost:5000/api/services

# 2. Get healthcare services
curl http://localhost:5000/api/services?category=health

# 3. Get service categories
curl http://localhost:5000/api/services/categories

# 4. Get specific service
curl http://localhost:5000/api/services/demo-health-01

# 5. Create service (requires token)
curl -X POST http://localhost:5000/api/services \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Health Center",
    "category": "health",
    "description": "Provides healthcare services",
    "servicesOffered": ["Consultations", "Vaccinations"]
  }'

# 6. Get all emergency guides
curl http://localhost:5000/api/emergency-guides

# 7. Get medical emergency guides
curl http://localhost:5000/api/emergency-guides?category=medical

# 8. Get emergency categories
curl http://localhost:5000/api/emergency-guides/categories

# 9. Get specific guide
curl http://localhost:5000/api/emergency-guides/fire-safety

# 10. Create emergency guide (requires token)
curl -X POST http://localhost:5000/api/emergency-guides \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Storm Safety",
    "category": "weather",
    "summary": "What to do during storms",
    "steps": ["Stay indoors", "Avoid windows"],
    "reminder": "Follow weather alerts"
  }'
```

---

## Summary

### Public Endpoints (No Auth Required)
- `GET /api/services` - List all services
- `GET /api/services/:id` - Get service by ID
- `GET /api/services/categories` - Get service categories
- `GET /api/emergency-guides` - List all guides
- `GET /api/emergency-guides/:id` - Get guide by ID
- `GET /api/emergency-guides/categories` - Get guide categories

### Protected Endpoints (Require JWT Token)
- `POST /api/services` - Create service
- `PATCH /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service
- `POST /api/emergency-guides` - Create guide
- `PATCH /api/emergency-guides/:id` - Update guide
- `DELETE /api/emergency-guides/:id` - Delete guide

---

**Total New Endpoints:** 12  
**Public:** 6  
**Protected:** 6
