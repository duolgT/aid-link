# Database Documentation

Complete guide for IndexedDB schema and offline-to-online synchronization.

**Issues:** #4 (IndexedDB Schema) & #5 (Sync Logic)

---

## 📋 Overview

AidLink implements a comprehensive offline-first database solution using:
- **IndexedDB** for local offline storage
- **MySQL** for remote backend storage
- **Automatic synchronization** between local and remote

---

## 🗄️ IndexedDB Schema (Issue #4)

### Database Structure

**Database Name:** `aidlink-kakuma-db`  
**Version:** 2  
**Stores:** 6

### 1. Reports Store

Stores community challenge reports (created offline, synced online).

**Schema:**
```javascript
{
  id: "uuid",                    // Primary key
  category: "water",             // Report category
  title: "Water supply issue",   // Report title
  area: "Kakuma 1",             // Location
  description: "Details...",     // Description
  organizationId: "org-uuid",    // Target organization
  urgency: "high",              // low, medium, high
  status: "local-draft",        // local-draft, synced
  syncStatus: "pending",        // pending, syncing, synced, failed
  createdAt: "2026-11-27...",   // ISO timestamp
  updatedAt: "2026-11-27...",   // ISO timestamp
  syncedAt: "2026-11-27...",    // When synced (if synced)
  serverId: "server-uuid",      // Backend ID (after sync)
  localId: "local-uuid",        // Original local ID
  localOnly: true,              // Not yet on server
  syncError: "error message"    // Last sync error (if any)
}
```

**Indexes:**
- `createdAt` - Sort by creation date
- `status` - Filter by status
- `category` - Filter by category
- `organizationId` - Filter by organization
- `syncStatus` - Find pending syncs

---

### 2. Services Store

Caches essential services from backend for offline access.

**Schema:**
```javascript
{
  id: "uuid",
  name: "Health Center",
  category: "health",
  area: "Kakuma 2",
  description: "Details...",
  servicesOffered: ["consultation", "vaccination"],
  coordinates: { lat: 3.123, lng: 35.456 },
  phone: "+254...",
  verified: true,
  isDemo: false,
  lastFetched: "2026-11-27..."  // Cache timestamp
}
```

**Indexes:**
- `category` - Filter by category
- `verified` - Filter by verification status
- `lastFetched` - Cache expiration

---

### 3. Emergency Guides Store

Caches emergency guides from backend for offline access.

**Schema:**
```javascript
{
  id: "uuid",
  title: "Fire Safety",
  category: "fire",
  summary: "What to do during fire",
  steps: ["Step 1", "Step 2", "Step 3"],
  reminder: "Important note",
  locallyVerified: false,
  lastFetched: "2026-11-27..."
}
```

**Indexes:**
- `category` - Filter by category
- `lastFetched` - Cache expiration

---

### 4. Organizations Store

Caches organizations for offline dropdown selection.

**Schema:**
```javascript
{
  id: "uuid",
  name: "UNHCR",
  sector: "Protection",
  verified: true,
  lastFetched: "2026-11-27..."
}
```

**Indexes:**
- `name` - Alphabetical sorting
- `lastFetched` - Cache expiration

---

### 5. Sync Queue Store

Tracks pending synchronization operations.

**Schema:**
```javascript
{
  id: 1,  // Auto-increment
  type: "report",           // Type of sync
  action: "create",         // create, update, delete
  data: {...},             // Data to sync
  entityId: "uuid",        // Related entity ID
  status: "pending",       // pending, processing, completed, failed
  createdAt: "2026-11-27...",
  retryCount: 0,           // Number of retry attempts
  lastAttempt: "2026-11-27...",
  error: "error message"   // Last error (if failed)
}
```

**Indexes:**
- `type` - Filter by sync type
- `status` - Find pending syncs
- `createdAt` - Process in order
- `retryCount` - Retry logic

---

### 6. User Settings Store

Stores user preferences and app settings.

**Schema:**
```javascript
{
  key: "language",         // Setting key
  value: "en",            // Setting value
  updatedAt: "2026-11-27..."
}
```

---

## 🔄 Offline-to-Online Sync (Issue #5)

### Sync Architecture

```
┌─────────────────┐
│  User Action    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     Online?    ┌──────────────────┐
│   IndexedDB     │────────Yes──────│  MySQL Backend   │
│  (Local Store)  │                 │  (Remote Store)  │
└────────┬────────┘◄──────No────────┘                  │
         │                                              │
         │        Auto-sync when online ────────────────┘
         ▼
┌─────────────────┐
│  Sync Manager   │
└─────────────────┘
```

### Sync Flow

1. **User submits report offline**
   - Save to IndexedDB with status `pending`
   - Add to sync queue
   - Return success to user immediately

2. **Device comes online**
   - Detect online event
   - Trigger automatic sync

3. **Sync Manager processes queue**
   - Get all pending reports
   - Upload to backend in batches
   - Update local records with server IDs
   - Mark as `synced`

4. **Handle failures**
   - Retry up to 3 times
   - Mark as `failed` if still unsuccessful
   - User can manually retry

---

## 🛠️ API Reference

### Database Operations

#### Reports

```javascript
import { 
  saveReport, 
  getReports, 
  getUnsyncedReports,
  markReportAsSynced 
} from './lib/db';

// Save report offline
const report = await saveReport({
  category: 'water',
  title: 'Water issue',
  description: 'Details...',
  organizationId: 'org-123',
  urgency: 'high'
});

// Get all reports
const reports = await getReports();

// Get unsynced reports
const unsynced = await getUnsyncedReports();

// Mark as synced
await markReportAsSynced(localId, serverId, serverData);
```

#### Services (Caching)

```javascript
import { 
  cacheServices, 
  getCachedServices 
} from './lib/db';

// Cache from backend
await cacheServices(servicesArray);

// Get cached services
const services = await getCachedServices({ category: 'health' });
```

### Sync Manager

```javascript
import { 
  syncReports, 
  startAutoSync, 
  getSyncStatus,
  fetchAndCacheAll 
} from './lib/syncManager';

// Manual sync
const result = await syncReports();

// Start automatic sync (every 5 minutes)
startAutoSync();

// Get sync status
const status = await getSyncStatus();

// Fetch and cache all data
await fetchAndCacheAll();
```

### React Hooks

```javascript
import { useSync, useOfflineData, useOnlineStatus } from './hooks';

// Sync hook
function MyComponent() {
  const { status, triggerSync, lastEvent } = useSync();
  
  return (
    <div>
      <p>Unsynced: {status.unsyncedReports}</p>
      <button onClick={triggerSync}>Sync Now</button>
    </div>
  );
}

// Offline data hook
function ServicesPage() {
  const { services, loading, source } = useOfflineData.useServices();
  
  return (
    <div>
      <p>Source: {source}</p> {/* 'api' or 'cache' */}
      {services.map(s => <div key={s.id}>{s.name}</div>)}
    </div>
  );
}

// Online status hook
function OfflineBanner() {
  const isOnline = useOnlineStatus();
  
  if (!isOnline) {
    return <div>You are offline</div>;
  }
  return null;
}
```

---

## 🔧 Configuration

### Sync Settings

```javascript
const SYNC_CONFIG = {
  AUTO_SYNC_INTERVAL: 5 * 60 * 1000,     // 5 minutes
  MAX_RETRY_ATTEMPTS: 3,                  // Retry failed syncs
  RETRY_DELAY: 2000,                      // 2 seconds between retries
  BATCH_SIZE: 10,                         // Sync 10 items at a time
  CACHE_MAX_AGE: 24 * 60 * 60 * 1000    // 24 hours cache expiry
};
```

### Environment Variables

```env
# client/.env
VITE_DATABASE_NAME=aidlink-kakuma-db
VITE_DATABASE_VERSION=2
VITE_API_URL=http://localhost:5000/api
```

---

## 📊 Sync Events

The sync manager emits events for monitoring:

```javascript
import { onSyncEvent } from './lib/syncManager';

// Listen to sync events
const unsubscribe = onSyncEvent((event) => {
  console.log('Sync event:', event);
  // event.type: 'sync:start', 'sync:complete', 'sync:error'
  // event.data: event-specific data
  // event.timestamp: ISO timestamp
});

// Cleanup
unsubscribe();
```

**Event Types:**
- `sync:start` - Sync process started
- `sync:complete` - Sync finished successfully
- `sync:error` - Sync failed
- `cache:start` - Cache update started
- `cache:complete` - Cache update finished
- `cache:services` - Services cached
- `cache:guides` - Guides cached
- `cache:organizations` - Organizations cached
- `network:online` - Device online
- `network:offline` - Device offline
- `autosync:started` - Auto-sync enabled
- `autosync:stopped` - Auto-sync disabled

---

## 🧪 Testing

### Manual Testing

```javascript
import { 
  getDatabaseStats, 
  exportDatabase,
  clearAllData 
} from './lib/db';

// Get database stats
const stats = await getDatabaseStats();
console.log(stats);
// { reports: 5, services: 20, unsyncedReports: 2, ... }

// Export database (for backup)
const backup = await exportDatabase();

// Clear all data (for testing)
await clearAllData();
```

### Browser DevTools

1. Open Chrome DevTools
2. Go to Application tab
3. Click IndexedDB → aidlink-kakuma-db
4. Inspect each store

---

## 🐛 Troubleshooting

### Reports Not Syncing

**Check:**
1. Device is online: `navigator.onLine`
2. Sync status: `await getSyncStatus()`
3. Pending syncs: `await getUnsyncedReports()`
4. Sync errors in console

**Solution:**
```javascript
import { forceSync } from './lib/syncManager';

// Force immediate sync
await forceSync();
```

### Cache Not Updating

**Check:**
1. Cache age: Check `lastFetched` timestamp
2. Online status
3. API responses

**Solution:**
```javascript
import { fetchAndCacheAll } from './lib/syncManager';

// Force cache refresh
await fetchAndCacheAll();
```

### Database Quota Exceeded

**Solution:**
```javascript
import { clearOldServices, clearCompletedSyncItems } from './lib/db';

// Clear old cached data
await clearOldServices(7 * 24 * 60 * 60 * 1000); // 7 days
await clearCompletedSyncItems(7 * 24 * 60 * 60 * 1000);
```

---

## 🚀 Usage Examples

### Example 1: Submit Report Offline

```javascript
import { saveReport } from './lib/db';
import { syncReports } from './lib/syncManager';

// User submits report (works offline)
const report = await saveReport({
  category: 'water',
  title: 'Water supply interruption',
  area: 'Kakuma 1',
  description: 'No water for 2 days',
  organizationId: 'unhcr-id',
  urgency: 'high'
});

console.log('Report saved locally:', report.id);

// When online, sync automatically runs
// Or trigger manually:
if (navigator.onLine) {
  await syncReports();
}
```

### Example 2: Load Services (Online or Offline)

```javascript
import { getCachedServices } from './lib/db';
import { fetchAndCacheServices } from './lib/syncManager';

async function loadServices() {
  if (navigator.onLine) {
    // Try fetching fresh data
    await fetchAndCacheServices();
  }
  
  // Always load from cache
  const services = await getCachedServices({ category: 'health' });
  return services;
}
```

### Example 3: React Component with Sync

```javascript
import { useSync, useAutoSync } from './hooks/useSync';

function SyncStatus() {
  const { status, triggerSync } = useSync();
  useAutoSync(true); // Enable auto-sync
  
  return (
    <div>
      <p>Status: {status.isSyncing ? 'Syncing...' : 'Idle'}</p>
      <p>Unsynced reports: {status.unsyncedReports}</p>
      <p>Last sync: {status.lastSuccessfulSync || 'Never'}</p>
      <button onClick={triggerSync} disabled={status.isSyncing}>
        Sync Now
      </button>
    </div>
  );
}
```

---

## 📈 Performance Considerations

### Batch Processing
- Syncs upload 10 reports at a time
- Prevents overwhelming the backend
- Reduces battery usage

### Cache Expiration
- Cached data expires after 24 hours
- Auto-refresh when online
- Manual refresh available

### Storage Limits
- IndexedDB typically allows 50MB+
- Monitor with `getDatabaseStats()`
- Clear old data periodically

---

## ✅ Implementation Checklist

Backend (MySQL):
- [x] Organizations table
- [x] Reports table
- [x] Services table
- [x] Emergency Guides table

Frontend (IndexedDB):
- [x] Reports store
- [x] Services cache store
- [x] Emergency Guides cache store
- [x] Organizations cache store
- [x] Sync queue store
- [x] User settings store

Sync Logic:
- [x] Save reports offline
- [x] Sync to backend when online
- [x] Batch upload
- [x] Retry failed syncs
- [x] Cache backend data
- [x] Auto-sync every 5 minutes
- [x] Network event listeners
- [x] Conflict resolution

React Integration:
- [x] useSync hook
- [x] useOfflineData hook
- [x] useOnlineStatus hook
- [x] Sync event system

---

## 🎉 Summary

**IndexedDB Schema (Issue #4):** ✅ Complete
- 6 stores with proper indexes
- Support for reports, services, guides, organizations
- Sync queue and user settings

**Offline-to-Online Sync (Issue #5):** ✅ Complete
- Automatic synchronization
- Batch processing
- Retry logic
- Cache management
- React hooks for easy integration

**Ready for production!** 🚀
