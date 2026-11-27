/**
 * IndexedDB Configuration for Offline-First Storage
 * Issue #4: Configure IndexedDB schema for offline-first storage
 * 
 * This module provides a complete offline-first database solution using IndexedDB.
 * It supports multiple stores for different data types with proper indexing.
 */

import { openDB } from "idb";

// Database Configuration
const DATABASE_NAME = import.meta.env.VITE_DATABASE_NAME || "aidlink-kakuma-db";
const DATABASE_VERSION = 2; // Incremented for new schema
const STORES = {
  REPORTS: "reports",
  SERVICES: "services",
  EMERGENCY_GUIDES: "emergency_guides",
  ORGANIZATIONS: "organizations",
  SYNC_QUEUE: "sync_queue",
  USER_SETTINGS: "user_settings"
};

/**
 * Initialize IndexedDB with complete schema
 */
const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(db, oldVersion, newVersion, transaction) {
    console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`);

    // Reports Store
    if (!db.objectStoreNames.contains(STORES.REPORTS)) {
      const reportsStore = db.createObjectStore(STORES.REPORTS, {
        keyPath: "id",
      });
      reportsStore.createIndex("createdAt", "createdAt");
      reportsStore.createIndex("status", "status");
      reportsStore.createIndex("category", "category");
      reportsStore.createIndex("organizationId", "organizationId");
      reportsStore.createIndex("syncStatus", "syncStatus");
      console.log("✅ Created reports store");
    }

    // Services Store (cached from backend)
    if (!db.objectStoreNames.contains(STORES.SERVICES)) {
      const servicesStore = db.createObjectStore(STORES.SERVICES, {
        keyPath: "id",
      });
      servicesStore.createIndex("category", "category");
      servicesStore.createIndex("verified", "verified");
      servicesStore.createIndex("lastFetched", "lastFetched");
      console.log("✅ Created services store");
    }

    // Emergency Guides Store (cached from backend)
    if (!db.objectStoreNames.contains(STORES.EMERGENCY_GUIDES)) {
      const guidesStore = db.createObjectStore(STORES.EMERGENCY_GUIDES, {
        keyPath: "id",
      });
      guidesStore.createIndex("category", "category");
      guidesStore.createIndex("lastFetched", "lastFetched");
      console.log("✅ Created emergency_guides store");
    }

    // Organizations Store (cached for offline dropdown)
    if (!db.objectStoreNames.contains(STORES.ORGANIZATIONS)) {
      const orgsStore = db.createObjectStore(STORES.ORGANIZATIONS, {
        keyPath: "id",
      });
      orgsStore.createIndex("name", "name");
      orgsStore.createIndex("lastFetched", "lastFetched");
      console.log("✅ Created organizations store");
    }

    // Sync Queue Store (tracks pending syncs)
    if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
      const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, {
        keyPath: "id",
        autoIncrement: true
      });
      syncStore.createIndex("type", "type");
      syncStore.createIndex("status", "status");
      syncStore.createIndex("createdAt", "createdAt");
      syncStore.createIndex("retryCount", "retryCount");
      console.log("✅ Created sync_queue store");
    }

    // User Settings Store
    if (!db.objectStoreNames.contains(STORES.USER_SETTINGS)) {
      const settingsStore = db.createObjectStore(STORES.USER_SETTINGS, {
        keyPath: "key",
      });
      console.log("✅ Created user_settings store");
    }

    console.log("Database upgrade complete");
  },
});

// ============================================================================
// REPORTS OPERATIONS
// ============================================================================

/**
 * Save report to local IndexedDB
 * Status: 'local-draft' (not yet synced) or 'synced' (confirmed by server)
 */
export async function saveReport(reportData) {
  const db = await dbPromise;
  const report = {
    id: crypto.randomUUID(),
    ...reportData,
    status: "local-draft",
    syncStatus: "pending", // pending, syncing, synced, failed
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    localOnly: true
  };
  
  await db.put(STORES.REPORTS, report);
  
  // Add to sync queue
  await addToSyncQueue({
    type: "report",
    action: "create",
    data: report,
    entityId: report.id
  });
  
  console.log("📝 Report saved locally:", report.id);
  return report;
}

/**
 * Get all reports
 */
export async function getReports() {
  const db = await dbPromise;
  const reports = await db.getAll(STORES.REPORTS);
  return reports.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

/**
 * Get report by ID
 */
export async function getReportById(id) {
  const db = await dbPromise;
  return await db.get(STORES.REPORTS, id);
}

/**
 * Get unsynced reports (pending upload to server)
 */
export async function getUnsyncedReports() {
  const db = await dbPromise;
  const allReports = await db.getAll(STORES.REPORTS);
  return allReports.filter(report => report.syncStatus === "pending" || report.syncStatus === "failed");
}

/**
 * Update report
 */
export async function updateReport(id, updates) {
  const db = await dbPromise;
  const report = await db.get(STORES.REPORTS, id);
  if (!report) return null;
  
  const updatedReport = {
    ...report,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  await db.put(STORES.REPORTS, updatedReport);
  return updatedReport;
}

/**
 * Mark report as synced with server
 */
export async function markReportAsSynced(localId, serverId, serverData) {
  const db = await dbPromise;
  const report = await db.get(STORES.REPORTS, localId);
  if (!report) return null;
  
  const syncedReport = {
    ...report,
    ...serverData,
    id: serverId,
    serverId,
    localId,
    syncStatus: "synced",
    localOnly: false,
    syncedAt: new Date().toISOString()
  };
  
  // Delete old local-only record
  if (localId !== serverId) {
    await db.delete(STORES.REPORTS, localId);
  }
  
  // Save with server ID
  await db.put(STORES.REPORTS, syncedReport);
  
  console.log("✅ Report synced:", localId, "→", serverId);
  return syncedReport;
}

/**
 * Delete report
 */
export async function deleteReport(id) {
  const db = await dbPromise;
  await db.delete(STORES.REPORTS, id);
  console.log("🗑️ Report deleted:", id);
}

// ============================================================================
// SERVICES OPERATIONS (Cached from backend)
// ============================================================================

/**
 * Cache services from backend
 */
export async function cacheServices(services) {
  const db = await dbPromise;
  const timestamp = new Date().toISOString();
  
  for (const service of services) {
    await db.put(STORES.SERVICES, {
      ...service,
      lastFetched: timestamp
    });
  }
  
  console.log(`💾 Cached ${services.length} services`);
}

/**
 * Get cached services
 */
export async function getCachedServices(filters = {}) {
  const db = await dbPromise;
  let services = await db.getAll(STORES.SERVICES);
  
  // Apply filters
  if (filters.category) {
    services = services.filter(s => s.category === filters.category);
  }
  if (filters.verified !== undefined) {
    services = services.filter(s => s.verified === filters.verified);
  }
  
  return services;
}

/**
 * Get single cached service
 */
export async function getCachedServiceById(id) {
  const db = await dbPromise;
  return await db.get(STORES.SERVICES, id);
}

/**
 * Clear old cached services
 */
export async function clearOldServices(maxAge = 24 * 60 * 60 * 1000) {
  const db = await dbPromise;
  const services = await db.getAll(STORES.SERVICES);
  const now = Date.now();
  let cleared = 0;
  
  for (const service of services) {
    const age = now - new Date(service.lastFetched).getTime();
    if (age > maxAge) {
      await db.delete(STORES.SERVICES, service.id);
      cleared++;
    }
  }
  
  if (cleared > 0) {
    console.log(`🧹 Cleared ${cleared} old services`);
  }
}

// ============================================================================
// EMERGENCY GUIDES OPERATIONS (Cached from backend)
// ============================================================================

/**
 * Cache emergency guides from backend
 */
export async function cacheEmergencyGuides(guides) {
  const db = await dbPromise;
  const timestamp = new Date().toISOString();
  
  for (const guide of guides) {
    await db.put(STORES.EMERGENCY_GUIDES, {
      ...guide,
      lastFetched: timestamp
    });
  }
  
  console.log(`💾 Cached ${guides.length} emergency guides`);
}

/**
 * Get cached emergency guides
 */
export async function getCachedEmergencyGuides(filters = {}) {
  const db = await dbPromise;
  let guides = await db.getAll(STORES.EMERGENCY_GUIDES);
  
  // Apply filters
  if (filters.category) {
    guides = guides.filter(g => g.category === filters.category);
  }
  
  return guides;
}

/**
 * Get single cached guide
 */
export async function getCachedGuideById(id) {
  const db = await dbPromise;
  return await db.get(STORES.EMERGENCY_GUIDES, id);
}

// ============================================================================
// ORGANIZATIONS OPERATIONS (Cached for offline dropdown)
// ============================================================================

/**
 * Cache organizations from backend
 */
export async function cacheOrganizations(organizations) {
  const db = await dbPromise;
  const timestamp = new Date().toISOString();
  
  for (const org of organizations) {
    await db.put(STORES.ORGANIZATIONS, {
      ...org,
      lastFetched: timestamp
    });
  }
  
  console.log(`💾 Cached ${organizations.length} organizations`);
}

/**
 * Get cached organizations
 */
export async function getCachedOrganizations() {
  const db = await dbPromise;
  const orgs = await db.getAll(STORES.ORGANIZATIONS);
  return orgs.sort((a, b) => a.name.localeCompare(b.name));
}

// ============================================================================
// SYNC QUEUE OPERATIONS
// ============================================================================

/**
 * Add item to sync queue
 */
export async function addToSyncQueue(item) {
  const db = await dbPromise;
  const queueItem = {
    ...item,
    status: "pending", // pending, processing, completed, failed
    createdAt: new Date().toISOString(),
    retryCount: 0,
    lastAttempt: null,
    error: null
  };
  
  const id = await db.add(STORES.SYNC_QUEUE, queueItem);
  console.log("📋 Added to sync queue:", id);
  return id;
}

/**
 * Get pending sync items
 */
export async function getPendingSyncItems() {
  const db = await dbPromise;
  const allItems = await db.getAll(STORES.SYNC_QUEUE);
  return allItems.filter(item => 
    item.status === "pending" || (item.status === "failed" && item.retryCount < 3)
  );
}

/**
 * Update sync item status
 */
export async function updateSyncItem(id, updates) {
  const db = await dbPromise;
  const item = await db.get(STORES.SYNC_QUEUE, id);
  if (!item) return null;
  
  const updatedItem = {
    ...item,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  await db.put(STORES.SYNC_QUEUE, updatedItem);
  return updatedItem;
}

/**
 * Remove sync item
 */
export async function removeSyncItem(id) {
  const db = await dbPromise;
  await db.delete(STORES.SYNC_QUEUE, id);
}

/**
 * Clear completed sync items older than specified time
 */
export async function clearCompletedSyncItems(maxAge = 7 * 24 * 60 * 60 * 1000) {
  const db = await dbPromise;
  const items = await db.getAll(STORES.SYNC_QUEUE);
  const now = Date.now();
  let cleared = 0;
  
  for (const item of items) {
    if (item.status === "completed") {
      const age = now - new Date(item.createdAt).getTime();
      if (age > maxAge) {
        await db.delete(STORES.SYNC_QUEUE, item.id);
        cleared++;
      }
    }
  }
  
  if (cleared > 0) {
    console.log(`🧹 Cleared ${cleared} completed sync items`);
  }
}

// ============================================================================
// USER SETTINGS OPERATIONS
// ============================================================================

/**
 * Save user setting
 */
export async function saveSetting(key, value) {
  const db = await dbPromise;
  await db.put(STORES.USER_SETTINGS, { key, value, updatedAt: new Date().toISOString() });
}

/**
 * Get user setting
 */
export async function getSetting(key, defaultValue = null) {
  const db = await dbPromise;
  const setting = await db.get(STORES.USER_SETTINGS, key);
  return setting ? setting.value : defaultValue;
}

/**
 * Delete user setting
 */
export async function deleteSetting(key) {
  const db = await dbPromise;
  await db.delete(STORES.USER_SETTINGS, key);
}

// ============================================================================
// DATABASE MAINTENANCE
// ============================================================================

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  const db = await dbPromise;
  
  const stats = {
    reports: (await db.getAll(STORES.REPORTS)).length,
    services: (await db.getAll(STORES.SERVICES)).length,
    emergencyGuides: (await db.getAll(STORES.EMERGENCY_GUIDES)).length,
    organizations: (await db.getAll(STORES.ORGANIZATIONS)).length,
    syncQueue: (await db.getAll(STORES.SYNC_QUEUE)).length,
    unsyncedReports: (await getUnsyncedReports()).length,
    pendingSyncs: (await getPendingSyncItems()).length
  };
  
  console.log("📊 Database stats:", stats);
  return stats;
}

/**
 * Clear all data (for testing or logout)
 */
export async function clearAllData() {
  const db = await dbPromise;
  
  await db.clear(STORES.REPORTS);
  await db.clear(STORES.SERVICES);
  await db.clear(STORES.EMERGENCY_GUIDES);
  await db.clear(STORES.ORGANIZATIONS);
  await db.clear(STORES.SYNC_QUEUE);
  await db.clear(STORES.USER_SETTINGS);
  
  console.log("🗑️ All data cleared");
}

/**
 * Export database (for backup)
 */
export async function exportDatabase() {
  const db = await dbPromise;
  
  const data = {
    reports: await db.getAll(STORES.REPORTS),
    services: await db.getAll(STORES.SERVICES),
    emergencyGuides: await db.getAll(STORES.EMERGENCY_GUIDES),
    organizations: await db.getAll(STORES.ORGANIZATIONS),
    settings: await db.getAll(STORES.USER_SETTINGS),
    exportedAt: new Date().toISOString()
  };
  
  return data;
}

// Export stores for external use
export { STORES, DATABASE_NAME, DATABASE_VERSION };
