# AidLink Kakuma

**Progressive Web App for refugee community services, emergency guidance, and reporting**

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Backend](https://img.shields.io/badge/backend-complete-green.svg)]()
[![Database](https://img.shields.io/badge/database-mysql-blue.svg)]()
[![Frontend](https://img.shields.io/badge/frontend-integration_ready-yellow.svg)]()

---

## 🎯 Overview

AidLink connects refugee community members in Kakuma with essential services, emergency guidance, and provides a platform for reporting service challenges to humanitarian organizations.

**Key Features:**
- 📱 Progressive Web App (offline-first)
- 🏥 Essential services directory
- 🚨 Emergency guidance
- 📢 Community challenge reporting
- 🏢 Organization portal for managing reports
- 🌐 Bilingual support (ready)

---

## 🏗️ Project Structure

```
aid-link/
├── client/              # React frontend (Vite + PWA)
│   ├── components/      # UI components
│   ├── pages/           # Page components
│   ├── config/          # API client configuration
│   ├── lib/             # IndexedDB for offline storage
│   └── ...
│
├── server/              # Node.js backend (Express + MySQL)
│   ├── config/          # Database configuration
│   ├── models/          # MySQL models
│   ├── controllers/     # Business logic
│   ├── routes/          # API routes
│   ├── middleware/      # Auth & error handling
│   └── ...
│
└── Documentation/
    ├── API_DOCUMENTATION.md
    ├── MYSQL_SETUP.md
    ├── INTEGRATION_GUIDE.md
    └── PROJECT_STATUS.md
```

---

## ✅ What's Complete

### Backend ✅
- **20 API Endpoints**
  - Community reporting (anonymous)
  - Essential services directory
  - Emergency guidance
  - Organization authentication
  - Organization dashboard
- **MySQL Database Integration**
  - Auto-initialize tables
  - Connection pooling
  - Database seeding
- **Complete Documentation**

### Frontend 🔄
- **React PWA** with offline support
- **API Client** configured
- **IndexedDB** for offline storage
- **Components** ready
- **Integration** in progress

---

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- MySQL 5.7+ or 8.0+
- npm or yarn

### 1. Clone Repository

```bash
git clone https://github.com/duolgT/aid-link.git
cd aid-link
```

### 2. Setup Backend

```bash
# Navigate to server
cd server

# Install dependencies
npm install

# Configure MySQL
# Edit server/.env with your credentials
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=aidlink

# Start server (creates tables automatically)
npm run dev

# Optional: Seed sample data
npm run seed
```

### 3. Setup Frontend

```bash
# Navigate to client
cd client

# Install dependencies
npm install

# Start frontend
npm run dev
```

**Access:**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Routing:** React Router v7
- **Offline Storage:** IndexedDB (idb)
- **Maps:** Leaflet + React Leaflet
- **Icons:** Lucide React
- **PWA:** vite-plugin-pwa + Workbox

### Backend
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** MySQL with connection pooling
- **Authentication:** JWT + bcryptjs
- **API:** RESTful with JSON

---

## 📡 API Endpoints

### Public Endpoints (11)
- `POST /api/auth/register` - Register organization
- `POST /api/auth/login` - Login organization
- `GET /api/organizations` - List organizations
- `POST /api/reports` - Submit anonymous report
- `POST /api/reports/batch` - Batch sync reports
- `GET /api/services` - List services
- `GET /api/services/:id` - Get service details
- `GET /api/services/categories` - Service categories
- `GET /api/emergency-guides` - List guides
- `GET /api/emergency-guides/:id` - Get guide details
- `GET /api/emergency-guides/categories` - Guide categories

### Protected Endpoints (9)
- `GET /api/auth/me` - Get organization profile
- `GET /api/reports/org` - Get organization reports
- `PATCH /api/reports/org/:id` - Update report status
- `POST /api/services` - Create service
- `PATCH /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service
- `POST /api/emergency-guides` - Create guide
- `PATCH /api/emergency-guides/:id` - Update guide
- `DELETE /api/emergency-guides/:id` - Delete guide

---

## 📊 Database Schema

### Organizations
```sql
id, name, email, password (hashed), sector, verified, 
created_at, updated_at
```

### Reports
```sql
id, category, title, area, description, organization_id, 
urgency, status, is_anonymous, synced, notes, 
created_at, updated_at
```

### Services
```sql
id, name, category, area, description, services_offered (JSON), 
coordinates (JSON), phone, verified, is_demo, organization_id, 
created_at, updated_at
```

### Emergency Guides
```sql
id, title, category, summary, steps (JSON), reminder, 
locally_verified, organization_id, created_at, updated_at
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [API_DOCUMENTATION.md](Documentation/API_DOCUMENTATION.md) | Complete API reference with examples |
| [MYSQL_SETUP.md](Documentation/MYSQL_SETUP.md) | MySQL database setup guide |
| [INTEGRATION_GUIDE.md](Documentation/INTEGRATION_GUIDE.md) | Frontend-backend integration examples |
| [PROJECT_STATUS.md](Documentation/PROJECT_STATUS.md) | Current project status and roadmap |
| [QUICK_START.md](Documentation/QUICK_START.md) | 2-minute setup guide |

---

## 🧪 Testing

### Backend API Tests

```bash
cd server

# Test all endpoints
./test-api.sh           # Unix/Mac/Linux
test-api.bat            # Windows

# Test services & guides
./test-services-api.sh  # Unix/Mac/Linux
test-services-api.bat   # Windows
```

### Manual API Testing

```bash
# Health check
curl http://localhost:5000/api/health

# Get services
curl http://localhost:5000/api/services

# Get emergency guides
curl http://localhost:5000/api/emergency-guides
```

---

## 🌟 Features

### For Community Members
- ✅ Browse essential services (health, education, water, etc.)
- ✅ Access emergency guidance
- ✅ Submit anonymous challenge reports
- ✅ Offline-first (works without internet)
- ✅ Progressive Web App (install on phone)

### For Humanitarian Organizations
- ✅ Secure login portal
- ✅ View incoming reports
- ✅ Update report status
- ✅ Manage services and guides
- ✅ Dashboard with filtering

---

## 🔄 Development Workflow

### Branch Structure
- `main` - Production-ready code
- `bhang` - Backend development (current)
- `duol` - Frontend development
- `database` - Database migrations

### Completed Milestones
- ✅ Issue #7: Community Challenges Reporting API
- ✅ Issue #6: Essential Services & Emergency Guidance API
- ✅ MySQL Database Integration
- ✅ Project Restructure (client/server separation)

### In Progress
- 🔄 Frontend-Backend Integration
- 🔄 Organization Portal UI
- 🔄 Offline Sync Implementation

---

## 🤝 Team

- **Backend:** 21Bhang (Issues #6, #7 complete)
- **Frontend:** duol (Integration in progress)
- **Database:** Database team (Schema complete)

---

## 🚦 Getting Started (New Developers)

1. **Read Documentation**
   - Start with [QUICK_START.md](./QUICK_START.md)
   - Review [PROJECT_STATUS.md](./PROJECT_STATUS.md)

2. **Setup Development Environment**
   - Install MySQL
   - Follow [MYSQL_SETUP.md](./MYSQL_SETUP.md)

3. **Run Backend**
   ```bash
   cd server
   npm install
   npm run dev
   ```

4. **Run Frontend**
   ```bash
   cd client
   npm install
   npm run dev
   ```

5. **Review Integration Guide**
   - See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
   - Check code examples for each page

---

## 📝 Environment Variables

### Backend (server/.env)
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=aidlink
DB_PORT=3306
```

### Frontend (client/.env)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🔐 Security

- ✅ Passwords hashed with bcryptjs (10 rounds)
- ✅ JWT authentication with configurable expiration
- ✅ Protected routes with middleware
- ✅ Input validation on all endpoints
- ✅ SQL injection prevention (prepared statements)
- ✅ CORS configured

---

## 🚀 Deployment

### Backend (Recommended: Railway, Render, or AWS)
1. Set up MySQL database
2. Configure environment variables
3. Deploy backend
4. Run database migrations

### Frontend (Recommended: Vercel or Netlify)
1. Build frontend: `npm run build`
2. Configure API_URL to production backend
3. Deploy

---

## 📄 License

This project is part of a humanitarian aid initiative.

---

## 🙏 Acknowledgments

- Kakuma refugee community
- Humanitarian organizations (UNHCR, IRC, LWF, NRC)
- Open source community

---

## 📞 Support

For issues or questions:
- **GitHub Issues:** https://github.com/duolgT/aid-link/issues
- **Documentation:** See docs folder
- **Team:** Contact project maintainers

---

## 🎯 Roadmap

### Phase 1 (Complete) ✅
- [x] Backend API (20 endpoints)
- [x] MySQL integration
- [x] Documentation

### Phase 2 (In Progress) 🔄
- [ ] Frontend-backend integration
- [ ] Organization portal UI
- [ ] Offline sync

### Phase 3 (Planned) 📋
- [ ] Multi-language support
- [ ] SMS notifications
- [ ] Advanced analytics
- [ ] Mobile app (React Native)

---

**Made with ❤️ for the Kakuma refugee community**

**Repository:** https://github.com/duolgT/aid-link  
**Current Branch:** `bhang`  
**Status:** Backend Complete, Frontend Integration Ready
