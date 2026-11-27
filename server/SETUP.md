# Backend Setup Guide

## Installation

1. **Navigate to server directory**
```bash
cd server
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
# The .env file is already created with development defaults
# For production, update JWT_SECRET with a strong random value
```

4. **Start the server**
```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

5. **Test the API**
```bash
# Health check
curl http://localhost:5000/api/health
```

## Project Structure

```
server/
├── config/
│   └── db.js              # In-memory database (replace with real DB)
├── controllers/
│   ├── authController.js  # Organization auth logic
│   ├── organizationController.js
│   └── reportController.js # Report CRUD operations
├── middleware/
│   ├── auth.js            # JWT authentication
│   └── errorHandler.js    # Global error handling
├── routes/
│   ├── authRoutes.js
│   ├── organizationRoutes.js
│   └── reportRoutes.js
├── utils/
│   └── validation.js      # Input validation
├── server.js              # App entry point
└── package.json
```

## API Testing Examples

### Register Organization
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "UNHCR Kakuma",
    "email": "kakuma@unhcr.org",
    "password": "secure123",
    "sector": "Protection"
  }'
```

### Submit Anonymous Report
```bash
curl -X POST http://localhost:5000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "category": "water",
    "title": "Water supply issue",
    "area": "Kakuma 1",
    "description": "Water taps have been dry for two days in Block C",
    "organizationId": "org-id-from-registration",
    "urgency": "high"
  }'
```

## Next Steps

- Replace in-memory database with MongoDB or PostgreSQL
- Add rate limiting for API endpoints
- Implement email verification for organizations
- Add report attachments/images support
- Set up logging with Winston or Pino
- Configure HTTPS for production
