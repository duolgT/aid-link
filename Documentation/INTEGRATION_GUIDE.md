# Frontend-Backend Integration Guide

Complete guide for connecting the React frontend to the Node.js backend with MySQL.

---

## 🎯 Overview

AidLink now has:
- **Backend:** Node.js + Express + MySQL
- **Frontend:** React + Vite + IndexedDB (offline)
- **Database:** MySQL with connection pooling

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Navigate to server
cd server

# Install dependencies
npm install

# Configure MySQL
# Edit server/.env with your MySQL credentials
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=aidlink
DB_PORT=3306

# Start server (creates tables automatically)
npm run dev

# Optional: Seed sample data
npm run seed
```

**Expected Output:**
```
✅ MySQL database connected successfully
✅ Database tables initialized successfully
🚀 AidLink API running on port 5000
💾 Database: MySQL (aidlink)
```

---

### 2. Frontend Setup

```bash
# Navigate to client
cd client

# Install dependencies (if not already)
npm install

# Start frontend
npm run dev
```

**Frontend runs on:** `http://localhost:5173`  
**Backend API runs on:** `http://localhost:5000`

---

## 🔌 Frontend Integration Examples

### 1. Fetch Organizations for Dropdown

**File:** `client/components/ReportForm.jsx`

```javascript
import { useEffect, useState } from 'react';
import API from '../config/api';

function ReportForm() {
  const [organizations, setOrganizations] = useState([]);
  const [form, setForm] = useState({
    category: '',
    title: '',
    area: '',
    description: '',
    organizationId: '',
    urgency: 'medium'
  });

  // Fetch organizations on mount
  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const response = await API.getOrganizations();
        setOrganizations(response.data);
      } catch (error) {
        console.error('Failed to fetch organizations:', error);
      }
    }
    fetchOrganizations();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      // Submit to backend
      const response = await API.createReport({
        category: form.category,
        title: form.title,
        area: form.area || 'Not specified',
        description: form.description,
        organizationId: form.organizationId,
        urgency: form.urgency
      });

      if (response.success) {
        alert('Report submitted successfully!');
        // Reset form
        setForm({ category: '', title: '', area: '', description: '', organizationId: '', urgency: 'medium' });
      }
    } catch (error) {
      console.error('Failed to submit report:', error);
      // Fallback: Save to IndexedDB for offline sync
      await saveReportLocally(form);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* ... other fields ... */}
      
      {/* Organization Dropdown */}
      <div className="form-group">
        <label htmlFor="organization">
          Select Organization <span>*</span>
        </label>
        <select
          id="organization"
          name="organizationId"
          value={form.organizationId}
          onChange={(e) => setForm({ ...form, organizationId: e.target.value })}
          required
        >
          <option value="">Choose an organization...</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name} - {org.sector}
            </option>
          ))}
        </select>
      </div>

      <button type="submit">Submit Report</button>
    </form>
  );
}

export default ReportForm;
```

---

### 2. Fetch Services from Backend

**File:** `client/pages/ServicesPage.jsx`

```javascript
import { useEffect, useState } from 'react';
import API from '../config/api';
import ServiceCard from '../components/ServiceCard';

function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true);
        const response = await API.getServices({ 
          category: category !== 'all' ? category : undefined 
        });
        setServices(response.data);
      } catch (error) {
        console.error('Failed to fetch services:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, [category]);

  if (loading) return <div>Loading services...</div>;

  return (
    <div className="services-page">
      <h1>Essential Services</h1>
      
      {/* Category Filter */}
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="all">All Services</option>
        <option value="health">Healthcare</option>
        <option value="education">Education</option>
        <option value="water">Water & Sanitation</option>
        <option value="protection">Protection</option>
        <option value="livelihoods">Livelihoods</option>
      </select>

      {/* Services List */}
      <div className="services-grid">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}

export default ServicesPage;
```

---

### 3. Fetch Emergency Guides

**File:** `client/pages/EmergencyPage.jsx`

```javascript
import { useEffect, useState } from 'react';
import API from '../config/api';
import EmergencyCard from '../components/EmergencyCard';

function EmergencyPage() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    async function fetchGuides() {
      try {
        setLoading(true);
        const response = await API.getEmergencyGuides({
          category: category !== 'all' ? category : undefined
        });
        setGuides(response.data);
      } catch (error) {
        console.error('Failed to fetch guides:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchGuides();
  }, [category]);

  if (loading) return <div>Loading emergency guides...</div>;

  return (
    <div className="emergency-page">
      <h1>Emergency Guidance</h1>
      
      {/* Category Filter */}
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="all">All Guides</option>
        <option value="medical">Medical</option>
        <option value="fire">Fire Safety</option>
        <option value="protection">Protection</option>
        <option value="water">Water Safety</option>
        <option value="weather">Weather</option>
        <option value="family">Family Support</option>
      </select>

      {/* Guides List */}
      <div className="guides-grid">
        {guides.map((guide) => (
          <EmergencyCard key={guide.id} guide={guide} />
        ))}
      </div>
    </div>
  );
}

export default EmergencyPage;
```

---

### 4. Offline Sync for Reports

**File:** `client/utils/syncManager.js`

```javascript
import API from '../config/api';
import { getUnsyncedReports, markReportAsSynced } from '../lib/db';

export async function syncReportsToBackend() {
  try {
    // Get all unsynced reports from IndexedDB
    const unsyncedReports = await getUnsyncedReports();
    
    if (unsyncedReports.length === 0) {
      console.log('No reports to sync');
      return { success: true, synced: 0 };
    }

    console.log(`Syncing ${unsyncedReports.length} reports...`);

    // Batch sync to backend
    const response = await API.batchSyncReports(unsyncedReports);

    // Update local records with server IDs
    for (const { localId, serverId } of response.data.synced) {
      await markReportAsSynced(localId, serverId);
    }

    console.log(`✅ Synced ${response.data.synced.length} reports`);
    return {
      success: true,
      synced: response.data.synced.length,
      errors: response.data.errors
    };
  } catch (error) {
    console.error('Sync failed:', error);
    return { success: false, error: error.message };
  }
}

// Auto-sync when online
window.addEventListener('online', () => {
  console.log('Back online! Syncing reports...');
  syncReportsToBackend();
});
```

---

### 5. Organization Login

**File:** `client/pages/OrgLoginPage.jsx`

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../config/api';

function OrgLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await API.login(email, password);
      
      if (response.success) {
        // Store token
        localStorage.setItem('orgToken', response.data.token);
        localStorage.setItem('organization', JSON.stringify(response.data.organization));
        
        // Redirect to dashboard
        navigate('/org/dashboard');
      }
    } catch (error) {
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <h1>Organization Login</h1>
      
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default OrgLoginPage;
```

---

### 6. Organization Dashboard

**File:** `client/pages/OrgDashboardPage.jsx`

```javascript
import { useEffect, useState } from 'react';
import API from '../config/api';

function OrgDashboardPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', urgency: '' });

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        const response = await API.getOrganizationReports(filter);
        setReports(response.data);
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [filter]);

  async function updateStatus(reportId, newStatus) {
    try {
      await API.updateReportStatus(reportId, newStatus);
      // Refresh reports
      setReports(reports.map(r => 
        r.id === reportId ? { ...r, status: newStatus } : r
      ));
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }

  if (loading) return <div>Loading reports...</div>;

  return (
    <div className="dashboard-page">
      <h1>Organization Dashboard</h1>
      
      {/* Filters */}
      <div className="filters">
        <select 
          value={filter.status} 
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select 
          value={filter.urgency} 
          onChange={(e) => setFilter({ ...filter, urgency: e.target.value })}
        >
          <option value="">All Urgency Levels</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Reports List */}
      <div className="reports-list">
        {reports.map((report) => (
          <div key={report.id} className="report-card">
            <h3>{report.title}</h3>
            <p><strong>Category:</strong> {report.category}</p>
            <p><strong>Area:</strong> {report.area}</p>
            <p><strong>Urgency:</strong> {report.urgency}</p>
            <p><strong>Status:</strong> {report.status}</p>
            <p>{report.description}</p>
            
            {/* Status Update Buttons */}
            <div className="actions">
              {report.status === 'pending' && (
                <button onClick={() => updateStatus(report.id, 'in_progress')}>
                  Start Working
                </button>
              )}
              {report.status === 'in_progress' && (
                <button onClick={() => updateStatus(report.id, 'resolved')}>
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrgDashboardPage;
```

---

## 🔄 Data Flow

### Community Report Submission

```
User fills form → Frontend validation → 
  ↓
  Online? 
  ↓ Yes                    ↓ No
POST to backend API    Save to IndexedDB
  ↓                         ↓
MySQL database         Sync when online
  ↓
Success response
```

### Services & Guides

```
User visits page → Fetch from backend API →
  ↓
MySQL database → Return data →
  ↓
Display in frontend
```

---

## 🧪 Testing Integration

### Test Backend API

```bash
cd server

# Test health
curl http://localhost:5000/api/health

# Test organizations
curl http://localhost:5000/api/organizations

# Test services
curl http://localhost:5000/api/services

# Test emergency guides
curl http://localhost:5000/api/emergency-guides
```

### Test Frontend

1. Open browser: `http://localhost:5173`
2. Navigate to Services page
3. Check if services are loaded from backend
4. Navigate to Emergency page
5. Check if guides are loaded from backend
6. Try submitting a report

---

## 🐛 Common Issues

### CORS Errors

If you see CORS errors in the browser console:

**Solution:** CORS is already enabled in the backend. Make sure:
1. Backend is running on port 5000
2. Frontend is making requests to `http://localhost:5000/api`

### Cannot Connect to MySQL

**Error:** `ER_ACCESS_DENIED_ERROR`

**Solution:**
1. Check MySQL credentials in `server/.env`
2. Verify MySQL is running
3. Create database: `CREATE DATABASE aidlink;`

### API Returns Empty Data

**Solution:**
1. Seed the database: `cd server && npm run seed`
2. Check MySQL tables have data

---

## ✅ Integration Checklist

Backend:
- [x] MySQL configured and running
- [x] Database tables created
- [x] Sample data seeded
- [x] API endpoints responding

Frontend:
- [ ] Update ReportForm to fetch organizations
- [ ] Update ServicesPage to fetch from API
- [ ] Update EmergencyPage to fetch from API
- [ ] Create OrgLoginPage
- [ ] Create OrgDashboardPage
- [ ] Implement offline sync

---

## 📚 Next Steps

1. **Update Frontend Components**
   - Modify existing pages to use API
   - Add organization authentication pages
   - Implement offline sync

2. **Testing**
   - Test all API endpoints
   - Test offline functionality
   - Test organization dashboard

3. **Deployment**
   - Deploy backend to cloud
   - Deploy frontend to Vercel/Netlify
   - Use production MySQL database

---

*Integration guide complete! Your frontend and backend are ready to connect.* 🎉
