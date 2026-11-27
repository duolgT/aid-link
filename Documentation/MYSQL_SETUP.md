# MySQL Database Setup Guide

Complete guide for setting up MySQL database for AidLink backend.

---

## 📋 Prerequisites

- MySQL 5.7+ or MySQL 8.0+ installed
- MySQL server running
- Database credentials

---

## 🚀 Quick Setup

### 1. Create Database

```sql
CREATE DATABASE aidlink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configure Environment

Edit `server/.env`:

```env
# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=aidlink
DB_PORT=3306
```

### 3. Install Dependencies

```bash
cd server
npm install
```

### 4. Initialize Database

The database tables will be created automatically when you start the server:

```bash
npm run dev
```

Or you can seed sample data:

```bash
npm run seed
```

---

## 📊 Database Schema

### Tables Created

1. **organizations**
   - `id` (VARCHAR 36, PRIMARY KEY)
   - `name` (VARCHAR 255)
   - `email` (VARCHAR 255, UNIQUE)
   - `password` (VARCHAR 255, hashed)
   - `sector` (VARCHAR 100)
   - `verified` (BOOLEAN)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

2. **reports**
   - `id` (VARCHAR 36, PRIMARY KEY)
   - `category` (VARCHAR 50)
   - `title` (VARCHAR 255)
   - `area` (VARCHAR 255)
   - `description` (TEXT)
   - `organization_id` (VARCHAR 36, FOREIGN KEY)
   - `urgency` (ENUM: low, medium, high)
   - `status` (ENUM: pending, in_progress, resolved, closed)
   - `is_anonymous` (BOOLEAN)
   - `synced` (BOOLEAN)
   - `notes` (TEXT)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

3. **services**
   - `id` (VARCHAR 36, PRIMARY KEY)
   - `name` (VARCHAR 255)
   - `category` (VARCHAR 50)
   - `area` (VARCHAR 255)
   - `description` (TEXT)
   - `services_offered` (JSON)
   - `coordinates` (JSON)
   - `phone` (VARCHAR 50)
   - `verified` (BOOLEAN)
   - `is_demo` (BOOLEAN)
   - `organization_id` (VARCHAR 36, FOREIGN KEY)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

4. **emergency_guides**
   - `id` (VARCHAR 36, PRIMARY KEY)
   - `title` (VARCHAR 255)
   - `category` (VARCHAR 50)
   - `summary` (TEXT)
   - `steps` (JSON)
   - `reminder` (TEXT)
   - `locally_verified` (BOOLEAN)
   - `organization_id` (VARCHAR 36, FOREIGN KEY)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

---

## 🔧 Manual Database Setup

If you prefer to create the database manually:

```sql
-- Create database
CREATE DATABASE aidlink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aidlink;

-- Organizations table
CREATE TABLE organizations (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  sector VARCHAR(100) NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reports table
CREATE TABLE reports (
  id VARCHAR(36) PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  area VARCHAR(255),
  description TEXT NOT NULL,
  organization_id VARCHAR(36) NOT NULL,
  urgency ENUM('low', 'medium', 'high') DEFAULT 'medium',
  status ENUM('pending', 'in_progress', 'resolved', 'closed') DEFAULT 'pending',
  is_anonymous BOOLEAN DEFAULT TRUE,
  synced BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  INDEX idx_organization (organization_id),
  INDEX idx_status (status),
  INDEX idx_category (category),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Services table
CREATE TABLE services (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  area VARCHAR(255),
  description TEXT NOT NULL,
  services_offered JSON NOT NULL,
  coordinates JSON,
  phone VARCHAR(50),
  verified BOOLEAN DEFAULT FALSE,
  is_demo BOOLEAN DEFAULT FALSE,
  organization_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL,
  INDEX idx_category (category),
  INDEX idx_verified (verified),
  INDEX idx_organization (organization_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Emergency Guides table
CREATE TABLE emergency_guides (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  summary TEXT NOT NULL,
  steps JSON NOT NULL,
  reminder TEXT,
  locally_verified BOOLEAN DEFAULT FALSE,
  organization_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL,
  INDEX idx_category (category),
  INDEX idx_verified (locally_verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🌱 Seed Sample Data

Seed the database with demo services and emergency guides:

```bash
cd server
npm run seed
```

This will add:
- 6 demo services (health, education, water, protection, livelihoods)
- 6 emergency guides (medical, fire, protection, water, weather, family)

---

## ✅ Verify Setup

1. **Check Connection:**
   ```bash
   cd server
   npm run dev
   ```
   
   You should see:
   ```
   ✅ MySQL database connected successfully
   ✅ Database tables initialized successfully
   🚀 AidLink API running on port 5000
   ```

2. **Test API:**
   ```bash
   curl http://localhost:5000/api/health
   ```

3. **Check Tables:**
   ```sql
   USE aidlink;
   SHOW TABLES;
   ```

---

## 🔄 Reset Database

If you need to start fresh:

```sql
DROP DATABASE aidlink;
CREATE DATABASE aidlink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then restart the server to recreate tables.

---

## 🛠️ Troubleshooting

### Cannot Connect to MySQL

**Error:** `ER_ACCESS_DENIED_ERROR`

**Solution:**
1. Check MySQL credentials in `server/.env`
2. Verify MySQL is running: `mysql -u root -p`
3. Grant permissions if needed:
   ```sql
   GRANT ALL PRIVILEGES ON aidlink.* TO 'root'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Tables Not Created

**Solution:**
- Delete `aidlink` database and restart server
- Or manually run the SQL schema above

### Connection Refused

**Solution:**
- Start MySQL server
- Check if MySQL is running on correct port (default: 3306)

---

## 📚 Next Steps

After database setup:

1. ✅ Start backend: `cd server && npm run dev`
2. ✅ Seed data: `npm run seed`
3. ✅ Start frontend: `cd client && npm run dev`
4. ✅ Test API endpoints with the test scripts

---

## 💡 Production Tips

For production deployment:

1. **Use Environment Variables:**
   - Never commit passwords
   - Use strong passwords
   - Use SSL/TLS connections

2. **Optimize:**
   - Add database indexes
   - Enable query caching
   - Use connection pooling (already configured)

3. **Backup:**
   - Regular database backups
   - Use replication for high availability

4. **Security:**
   - Use prepared statements (already implemented)
   - Enable MySQL SSL
   - Limit user permissions

---

*Setup complete! Your MySQL database is ready for AidLink.* 🎉
