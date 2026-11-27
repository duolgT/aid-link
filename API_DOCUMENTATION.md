# AidLink Backend API - Complete Documentation

## 🎯 Overview

Backend API for AidLink Kakuma platform. Provides:
- **Community Challenges Reporting** - Anonymous report submission and organization dashboard
- **Essential Services Directory** - Healthcare, education, water, protection, and livelihood services
- **Emergency Guidance** - Safety guides for medical, fire, protection, water, weather, and family emergencies

## 🏗️ Architecture

```
├── server/
│   ├── config/db.js              # Database layer (in-memory for dev)
│   ├── controllers/              # Business logic
│   │   ├── authController.js     # Organization authentication
│   │   ├── organizationController.js
│   │   └── reportController.js   # Report management
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   └── errorHandler.js       # Global error handling
│   ├── routes/                   # API route definitions
│   ├── utils/validation.js       # Input validation
│   └── server.js                 # Express app entry point
```

## 🚀 Getting Started

### Installation

```bash
cd server
npm install
npm run dev
```

The server will start on `http://localhost:5000`

### Environment Variables

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Quick Reference
- **Authentication:** `/api/auth/*` (3 endpoints)
- **Organizations:** `/api/organizations` (1 endpoint)
- **Reports:** `/api/reports/*` (4 endpoints)
- **Services:** `/api/services/*` (6 endpoints) 🆕
- **Emergency Guides:** `/api/emergency-guides/*` (6 endpoints) 🆕

**Total:** 20 endpoints

---

## Authentication & Organizations

### 1. Register Organization

**POST** `/auth/register`

Register a new humanitarian organization.

**Request Body:**
```json
{
  "name": "UNHCR Kakuma",
  "email": "kakuma@unhcr.org",
  "password": "securePassword123",
  "sector": "Protection"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Organization registered successfully",
  "data": {
    "organization": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "UNHCR Kakuma",
      "email": "kakuma@unhcr.org",
      "sector": "Protection",
      "verified": false,
      "createdAt": "2026-11-27T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Validation Rules:**
- Name: min 2 characters
- Email: valid email format
- Password: min 6 characters
- Sector: required

---

### 2. Login

**POST** `/auth/login`

Authenticate an organization.

**Request Body:**
```json
{
  "email": "kakuma@unhcr.org",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "organization": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Get Current Organization Profile

**GET** `/auth/me`

Get authenticated organization's profile.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "UNHCR Kakuma",
    "email": "kakuma@unhcr.org",
    "sector": "Protection",
    "verified": false,
    "createdAt": "2026-11-27T10:30:00.000Z"
  }
}
```

---

### 4. Get All Organizations (Public)

**GET** `/organizations`

Get list of all registered organizations (for dropdown selection).

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "UNHCR",
      "sector": "Protection",
      "verified": true
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "IRC",
      "sector": "Health",
      "verified": true
    }
  ]
}
```

---

## Reports

### 5. Submit Anonymous Report

**POST** `/reports`

Submit a community challenge report (public endpoint, no auth required).

**Request Body:**
```json
{
  "category": "water",
  "title": "Water supply interruption",
  "area": "Kakuma 1",
  "description": "Water taps in block C have been dry for two days affecting many residents",
  "organizationId": "550e8400-e29b-41d4-a716-446655440000",
  "urgency": "high"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Report submitted successfully",
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "category": "water",
    "title": "Water supply interruption",
    "area": "Kakuma 1",
    "description": "Water taps in block C have been dry for two days...",
    "organizationId": "550e8400-e29b-41d4-a716-446655440000",
    "urgency": "high",
    "status": "pending",
    "isAnonymous": true,
    "synced": true,
    "createdAt": "2026-11-27T10:35:00.000Z",
    "updatedAt": "2026-11-27T10:35:00.000Z"
  }
}
```

**Validation Rules:**
- Category: required, must be valid category
- Title: min 6 characters, max 80
- Description: min 20 characters, max 500
- Organization ID: required, must exist
- Urgency: optional (low/medium/high), defaults to "medium"

**Categories:**
- `water` - Water & Sanitation
- `health` - Healthcare Access
- `education` - Education
- `accessibility` - Accessibility
- `shelter` - Shelter & Infrastructure
- `other` - Other Service Challenges

---

### 6. Get Organization Reports (Protected)

**GET** `/reports/org?status=pending&urgency=high`

Get reports assigned to authenticated organization.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (optional): Filter by status (pending, in_progress, resolved, closed)
- `urgency` (optional): Filter by urgency (low, medium, high)

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "category": "water",
      "title": "Water supply interruption",
      "area": "Kakuma 1",
      "description": "Water taps in block C have been dry...",
      "organizationId": "550e8400-e29b-41d4-a716-446655440000",
      "urgency": "high",
      "status": "pending",
      "isAnonymous": true,
      "createdAt": "2026-11-27T10:35:00.000Z",
      "updatedAt": "2026-11-27T10:35:00.000Z"
    }
  ]
}
```

---

### 7. Update Report Status (Protected)

**PATCH** `/reports/org/:id`

Update status of a report (organization can only update their own reports).

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "status": "in_progress",
  "notes": "Team dispatched to investigate the issue"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Report updated successfully",
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "status": "in_progress",
    "notes": "Team dispatched to investigate the issue",
    "updatedAt": "2026-11-27T11:00:00.000Z",
    ...
  }
}
```

**Valid Status Values:**
- `pending` - Initial state
- `in_progress` - Organization is working on it
- `resolved` - Issue has been resolved
- `closed` - Report closed

---

### 8. Batch Sync Offline Reports

**POST** `/reports/batch`

Sync multiple reports from offline storage to server.

**Request Body:**
```json
{
  "reports": [
    {
      "id": "local-uuid-1",
      "category": "health",
      "title": "Medical clinic closure",
      "description": "Clinic closed unexpectedly affecting many residents",
      "organizationId": "550e8400-e29b-41d4-a716-446655440000",
      "urgency": "medium"
    },
    {
      "id": "local-uuid-2",
      "category": "education",
      "title": "School supplies shortage",
      "description": "Students need notebooks and pens for upcoming term",
      "organizationId": "550e8400-e29b-41d4-a716-446655440000",
      "urgency": "low"
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Synced 2 reports",
  "data": {
    "synced": [
      {
        "localId": "local-uuid-1",
        "serverId": "880e8400-e29b-41d4-a716-446655440003",
        "report": { ... }
      },
      {
        "localId": "local-uuid-2",
        "serverId": "990e8400-e29b-41d4-a716-446655440004",
        "report": { ... }
      }
    ],
    "errors": []
  }
}
```

---

## 🔐 Authentication

Protected endpoints require JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Protected Endpoints:
- `GET /api/auth/me`
- `GET /api/reports/org`
- `PATCH /api/reports/org/:id`

### Public Endpoints:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/organizations`
- `POST /api/reports`
- `POST /api/reports/batch`

---

## ⚠️ Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

**Common Status Codes:**
- `400` - Bad Request (validation failed)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (not authorized to access resource)
- `404` - Not Found
- `409` - Conflict (e.g., email already exists)
- `500` - Internal Server Error

---

## 🧪 Testing

### Using curl:

```bash
# Health check
curl http://localhost:5000/api/health

# Register organization
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "UNHCR",
    "email": "test@unhcr.org",
    "password": "secure123",
    "sector": "Protection"
  }'

# Submit report
curl -X POST http://localhost:5000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "category": "water",
    "title": "Water issue",
    "description": "Detailed description here minimum 20 chars",
    "organizationId": "org-id",
    "urgency": "high"
  }'
```

### Using the test script:

```bash
cd server
chmod +x test-api.sh
./test-api.sh
```

---

## 📦 Data Models

### Organization
```typescript
{
  id: string (UUID)
  name: string
  email: string (unique)
  password: string (hashed)
  sector: string
  verified: boolean
  createdAt: string (ISO-8601)
}
```

### Report
```typescript
{
  id: string (UUID)
  category: 'water' | 'health' | 'education' | 'accessibility' | 'shelter' | 'other'
  title: string
  area: string
  description: string
  organizationId: string (UUID)
  urgency: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'resolved' | 'closed'
  isAnonymous: boolean
  synced: boolean
  notes?: string
  createdAt: string (ISO-8601)
  updatedAt: string (ISO-8601)
}
```

---

## 🔄 Next Steps for Production

1. **Database Migration**
   - Replace `config/db.js` with MongoDB or PostgreSQL
   - Set up connection pooling
   - Add database indexes

2. **Security Enhancements**
   - Add rate limiting (express-rate-limit)
   - Implement refresh tokens
   - Add email verification
   - Set up HTTPS
   - Add request validation middleware (express-validator)

3. **Features**
   - File/image attachments
   - Email notifications
   - Report analytics dashboard
   - Export reports to CSV/PDF

4. **DevOps**
   - Set up CI/CD pipeline
   - Add logging (Winston/Pino)
   - Add monitoring (Prometheus/Grafana)
   - Deploy to cloud (Vercel, Railway, or AWS)

---

## 📞 Support

For issues or questions, refer to:
- `server/README.md` - Setup instructions
- `server/SETUP.md` - Detailed testing guide
- GitHub Issues - Bug reports and feature requests


---

## 🆕 Essential Services & Emergency Guides (Issue #6)

### Services API

For complete details, see **`server/SERVICES_API_DOCS.md`**

**Public Endpoints:**
- `GET /api/services` - List all services (with filtering)
- `GET /api/services/:id` - Get service details
- `GET /api/services/categories` - Get service categories

**Protected Endpoints:**
- `POST /api/services` - Create service
- `PATCH /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

**Service Categories:**
- Healthcare
- Education
- Water & Sanitation
- Protection
- Livelihoods

**Example:**
```bash
# Get all healthcare services
curl http://localhost:5000/api/services?category=health

# Get service by ID
curl http://localhost:5000/api/services/demo-health-01
```

---

### Emergency Guides API

For complete details, see **`server/SERVICES_API_DOCS.md`**

**Public Endpoints:**
- `GET /api/emergency-guides` - List all guides (with filtering)
- `GET /api/emergency-guides/:id` - Get guide details
- `GET /api/emergency-guides/categories` - Get guide categories

**Protected Endpoints:**
- `POST /api/emergency-guides` - Create guide
- `PATCH /api/emergency-guides/:id` - Update guide
- `DELETE /api/emergency-guides/:id` - Delete guide

**Guide Categories:**
- Medical
- Fire Safety
- Protection
- Water Safety
- Weather
- Family Support

**Example:**
```bash
# Get all medical emergency guides
curl http://localhost:5000/api/emergency-guides?category=medical

# Get guide by ID
curl http://localhost:5000/api/emergency-guides/fire-safety
```

---

## 📊 Complete API Summary

| Feature | Public | Protected | Total |
|---------|--------|-----------|-------|
| Authentication | 2 | 1 | 3 |
| Organizations | 1 | 0 | 1 |
| Reports | 2 | 2 | 4 |
| Services 🆕 | 3 | 3 | 6 |
| Emergency Guides 🆕 | 3 | 3 | 6 |
| **Total** | **11** | **9** | **20** |

---

## 🧪 Testing All Endpoints

### Main API Test
```bash
cd server
./test-api.sh           # Unix/Mac/Linux
test-api.bat            # Windows
```

### Services & Guides Test 🆕
```bash
cd server
./test-services-api.sh  # Unix/Mac/Linux
test-services-api.bat   # Windows
```

