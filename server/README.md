# AidLink Backend API

Clean and minimal Node.js/Express backend for Community Challenges reporting system.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

## 📋 API Endpoints

### Health Check
```
GET /api/health
```

### Authentication (Humanitarian Organizations)

#### Register Organization
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "UNHCR Kakuma",
  "email": "kakuma@unhcr.org",
  "password": "securepass123",
  "sector": "Protection"
}

Response: 201 Created
{
  "success": true,
  "message": "Organization registered successfully",
  "data": {
    "organization": { ... },
    "token": "jwt-token-here"
  }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "kakuma@unhcr.org",
  "password": "securepass123"
}

Response: 200 OK
{
  "success": true,
  "message": "Login successful",
  "data": {
    "organization": { ... },
    "token": "jwt-token-here"
  }
}
```

#### Get Current Organization Profile
```
GET /api/auth/me
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "UNHCR Kakuma",
    "email": "kakuma@unhcr.org",
    "sector": "Protection",
    "verified": false
  }
}
```

### Organizations (Public)

#### Get All Organizations
```
GET /api/organizations

Response: 200 OK
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "uuid",
      "name": "UNHCR",
      "sector": "Protection",
      "verified": true
    }
  ]
}
```

### Reports

#### Submit Anonymous Report (Public)
```
POST /api/reports
Content-Type: application/json

{
  "category": "water",
  "title": "Water supply interruption",
  "area": "Kakuma 1",
  "description": "Water taps in block C have been dry for 2 days",
  "organizationId": "uuid-of-target-org",
  "urgency": "high"
}

Response: 201 Created
{
  "success": true,
  "message": "Report submitted successfully",
  "data": {
    "id": "uuid",
    "category": "water",
    "status": "pending",
    "createdAt": "2026-11-27T10:30:00.000Z"
  }
}
```

#### Batch Sync Offline Reports
```
POST /api/reports/batch
Content-Type: application/json

{
  "reports": [
    {
      "id": "local-uuid-1",
      "category": "health",
      "title": "...",
      "description": "...",
      "organizationId": "uuid"
    }
  ]
}

Response: 201 Created
{
  "success": true,
  "message": "Synced 5 reports",
  "data": {
    "synced": [...],
    "errors": []
  }
}
```

#### Get Organization Reports (Protected)
```
GET /api/reports/org?status=pending&urgency=high
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "count": 12,
  "data": [
    {
      "id": "uuid",
      "category": "water",
      "title": "...",
      "status": "pending",
      "urgency": "high",
      "createdAt": "..."
    }
  ]
}
```

#### Update Report Status (Protected)
```
PATCH /api/reports/org/{reportId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "in_progress",
  "notes": "Team dispatched to investigate"
}

Response: 200 OK
{
  "success": true,
  "message": "Report updated successfully",
  "data": { ... }
}
```

## 🔐 Authentication

Protected routes require JWT token in Authorization header:
```
Authorization: Bearer your-jwt-token
```

## 📊 Data Models

### Organization
```javascript
{
  id: "uuid",
  name: "UNHCR",
  email: "org@example.com",
  sector: "Protection",
  verified: false,
  createdAt: "ISO-8601"
}
```

### Report
```javascript
{
  id: "uuid",
  category: "water|health|education|accessibility|shelter|other",
  title: "string",
  area: "string",
  description: "string",
  organizationId: "uuid",
  urgency: "low|medium|high",
  status: "pending|in_progress|resolved|closed",
  isAnonymous: true,
  synced: true,
  createdAt: "ISO-8601",
  updatedAt: "ISO-8601"
}
```

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Auth**: JWT + bcryptjs
- **Storage**: In-memory (replace with MongoDB/PostgreSQL for production)

## 📝 Notes

- Current implementation uses in-memory storage for development
- Replace `config/db.js` with real database before production
- Set strong `JWT_SECRET` in production environment
- Enable HTTPS in production deployment
