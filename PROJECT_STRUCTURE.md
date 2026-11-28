# AidLink Kakuma - Project Structure

## 🏗️ Project Architecture

This project is organized into **3 main sections** for clear separation of concerns:

```
aid-link/
├── 📱 client/           # Frontend (React PWA)
├── 🔧 server/           # Backend & Database (Express + MySQL)
└── 📚 Documentation/    # Project Documentation
```

---

## 1️⃣ Frontend (client/)

**Technology Stack:**
- React 18 with Vite
- IndexedDB for offline storage
- PWA capabilities
- Tailwind CSS

**Structure:**
```
client/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Route pages
│   ├── hooks/          # Custom React hooks (useSync, useOfflineData)
│   ├── lib/            # Core libraries (db.js, syncManager.js)
│   ├── context/        # React Context providers
│   ├── data/           # Static data files
│   └── utils/          # Helper functions
├── public/             # Static assets
└── .env                # Frontend environment variables
```

**Environment Variables (.env):**
```env
VITE_API_URL=http://localhost:3000/api
VITE_DATABASE_NAME=aidlink_kakuma
VITE_DATABASE_VERSION=2
```

**Key Features:**
- Offline-first architecture with IndexedDB
- Automatic sync when connection available
- 6 IndexedDB stores: reports, services, emergency_guides, organizations, sync_queue, user_settings
- PWA with service worker for offline capability

**Run Frontend:**
```bash
cd client
npm install
npm run dev
```

---

## 2️⃣ Backend & Database (server/)

**Technology Stack:**
- Node.js + Express.js
- MySQL 8.0+ with mysql2
- JWT authentication
- RESTful API design

**Structure:**
```
server/
├── config/
│   └── db.js           # MySQL connection pool & initialization
├── models/             # Data models (Organization, Report, Service, EmergencyGuide)
├── controllers/        # Business logic
├── routes/             # API endpoints
├── middleware/         # Auth & validation middleware
├── scripts/
│   └── seed.js         # Database seeding
├── server.js           # Express server entry point
└── .env                # Backend environment variables
```

**Environment Variables (.env):**
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=1ee5594773bf990f59a15b970623da75c4f1eb7bfcbe03b329695bb89a4c4ec7218c39e49a19ced8968efbf811fdc777d8d9156d6e2b930940acab8862a54937
JWT_EXPIRES_IN=3h

# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=1234
DB_NAME=aidlink_kakuma
DB_PORT=3306
```

**Database Schema:**
- **organizations** - NGOs and service providers
- **reports** - Community reports (linked to organizations)
- **services** - Available services in Kakuma
- **emergency_guides** - Emergency response guides

**API Endpoints (20 total):**

### Authentication (2 endpoints)
- `POST /api/auth/register` - Register new organization
- `POST /api/auth/login` - Login organization

### Organizations (4 endpoints)
- `GET /api/organizations` - List all organizations
- `GET /api/organizations/:id` - Get single organization
- `PUT /api/organizations/:id` - Update organization
- `DELETE /api/organizations/:id` - Delete organization

### Reports (7 endpoints)
- `GET /api/reports` - List all reports
- `GET /api/reports/:id` - Get single report
- `POST /api/reports` - Create new report
- `POST /api/reports/batch` - Batch create reports (offline sync)
- `PUT /api/reports/:id` - Update report
- `PATCH /api/reports/:id/status` - Update report status
- `DELETE /api/reports/:id` - Delete report

### Services (6 endpoints)
- `GET /api/services` - List all services
- `GET /api/services/by-category/:category` - Filter by category
- `GET /api/services/:id` - Get single service
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Emergency Guides (6 endpoints)
- `GET /api/emergency-guides` - List all guides
- `GET /api/emergency-guides/by-category/:category` - Filter by category
- `GET /api/emergency-guides/:id` - Get single guide
- `POST /api/emergency-guides` - Create new guide
- `PUT /api/emergency-guides/:id` - Update guide
- `DELETE /api/emergency-guides/:id` - Delete guide

**Run Backend:**
```bash
cd server
npm install
npm run dev
```

**Seed Database:**
```bash
cd server
npm run seed
```

---

## 3️⃣ Documentation (Documentation/)

**Available Documentation:**

| File | Description |
|------|-------------|
| `API_DOCUMENTATION.md` | Complete API endpoint reference |
| `BACKEND_SUMMARY.md` | Backend architecture overview |
| `INTEGRATION_GUIDE.md` | Frontend-Backend integration guide |
| `MYSQL_SETUP.md` | MySQL database setup instructions |
| `PROJECT_STATUS.md` | Current project status and progress |
| `QUICK_START.md` | Quick start guide for developers |

**Root Documentation:**
- `README.md` - Main project README
- `DATABASE_DOCUMENTATION.md` - IndexedDB schema and sync logic
- `PROJECT_STRUCTURE.md` - This file (project structure overview)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Setup Steps

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd aid-link
   ```

2. **Setup MySQL Database**
   ```bash
   mysql -u root -p
   CREATE DATABASE aidlink_kakuma;
   exit
   ```

3. **Install & Run Backend**
   ```bash
   cd server
   npm install
   cp .env.example .env  # Update with your credentials
   npm run dev
   ```

4. **Install & Run Frontend**
   ```bash
   cd client
   npm install
   cp .env.example .env
   npm run dev
   ```

5. **Seed Database (Optional)**
   ```bash
   cd server
   npm run seed
   ```

### Access Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api

---

## 📊 Database Configuration

### MySQL (Backend)
- **Database Name:** `aidlink_kakuma`
- **Tables:** 4 (organizations, reports, services, emergency_guides)
- **Port:** 3306

### IndexedDB (Frontend)
- **Database Name:** `aidlink_kakuma`
- **Version:** 2
- **Stores:** 6 (reports, services, emergency_guides, organizations, sync_queue, user_settings)

---

## 🌿 Git Branches

- **main** - Production-ready code
- **bhang** - Backend development
- **database** - Database and offline sync features
- **frontend** - Frontend development

---

## 🔄 Offline-First Architecture

The application supports full offline functionality:

1. **User creates report offline** → Saved to IndexedDB with `syncStatus: "pending"`
2. **Internet connection restored** → SyncManager detects connection
3. **Automatic sync** → Batch uploads pending reports to backend
4. **Backend response** → Updates local IndexedDB with server IDs
5. **Conflict resolution** → Handles duplicate prevention and retry logic

**Sync Features:**
- ✅ Automatic 5-minute interval sync
- ✅ Batch processing (10 items per batch)
- ✅ Retry mechanism (3 attempts with exponential backoff)
- ✅ 24-hour cache expiry
- ✅ React hooks for sync status monitoring

---

## 👥 Team Collaboration

**Backend Developer** → Works in `server/` folder, pushes to `bhang` branch  
**Frontend Developer** → Works in `client/` folder, pushes to `frontend` branch  
**Database Developer** → Works on IndexedDB/sync, pushes to `database` branch

---

## 📝 Notes

- Both frontend and backend use the same database name: **aidlink_kakuma**
- MySQL (server-side) and IndexedDB (client-side) are separate databases
- Always run backend before frontend for full functionality
- Use `npm run seed` to populate demo data for testing

---

**Last Updated:** November 27, 2026
