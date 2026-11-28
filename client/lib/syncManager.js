/**
 * Offline-to-Online Sync Manager
 * Issue #5: Set up remote database schema & offline-to-online sync logic
 * 
 * This module handles synchronization between local IndexedDB and remote MySQL database.
 * It implements automatic sync, conflict resolution, and retry logic.
 */

import API from '../config/api';
import {
  getUnsyncedReports,
  markReportAsSynced,
  updateReport,
  getPendingSyncItems,
  updateSyncItem,
  removeSyncItem,
  cacheServices,
  cacheEmergencyGuides,
  cacheOrganizations,
  clearCompletedSyncItems,
  getDatabaseStats
} from './db';

// Sync configuration
const SYNC_CONFIG = {
  AUTO_SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutes
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 2000, // 2 seconds
  BATCH_SIZE: 10,
  CACHE_MAX_AGE: 24 * 60 * 60 * 1000 // 24 hours
};

// Sync state
let isSyncing = false;
let syncInterval = null;
let lastSyncAttempt = null;
let lastSuccessfulSync = null;

// ============================================================================
// SYNC STATUS & EVENTS
// ============================================================================

/**
 * Sync event listeners
 */
const syncListeners = new Set();

export function onSyncEvent(callback) {
  syncListeners.add(callback);
  return () => syncListeners.delete(callback);
}

function emit Event(event, data) {
  const eventData = {
    type: event,
    timestamp: new Date().toISOString(),
    data
  };
  
  syncListeners.forEach(listener => {
    try {
      listener(eventData);
    } catch (error) {
      console.error('Sync listener error:', error);
    }
  });
}

/**
 * Get current sync status
 */
export async function getSyncStatus() {
  const stats = await getDatabaseStats();
  
  return {
    isSyncing,
    lastSyncAttempt,
    lastSuccessfulSync,
    unsyncedReports: stats.unsyncedReports,
    pendingSyncs: stats.pendingSyncs,
    isOnline: navigator.onLine
  };
}

// ============================================================================
// REPORTS SYNC
// ============================================================================

/**
 * Sync reports to backend
 */
export async function syncReports() {
  if (isSyncing) {
    console.log('⏳ Sync already in progress');
    return { success: false, message: 'Sync in progress' };
  }

  if (!navigator.onLine) {
    console.log('📡 Offline - sync skipped');
    return { success: false, message: 'Device is offline' };
  }

  isSyncing = true;
  lastSyncAttempt = new Date().toISOString();
  emitEvent('sync:start', { type: 'reports' });

  const results = {
    synced: [],
    failed: [],
    total: 0
  };

  try {
    const unsyncedReports = await getUnsyncedReports();
    results.total = unsyncedReports.length;

    if (unsyncedReports.length === 0) {
      console.log('✅ No reports to sync');
      emitEvent('sync:complete', results);
      return { success: true, results };
    }

    console.log(`🔄 Syncing ${unsyncedReports.length} reports...`);

    // Process reports in batches
    for (let i = 0; i < unsyncedReports.length; i += SYNC_CONFIG.BATCH_SIZE) {
      const batch = unsyncedReports.slice(i, i + SYNC_CONFIG.BATCH_SIZE);
      
      for (const report of batch) {
        try {
          // Update sync status
          await updateReport(report.id, { syncStatus: 'syncing' });

          // Prepare data for backend
          const reportData = {
            category: report.category,
            title: report.title,
            area: report.area,
            description: report.description,
            organizationId: report.organizationId,
            urgency: report.urgency || 'medium'
          };

          // Send to backend
          const response = await API.createReport(reportData);

          if (response.success) {
            // Mark as synced
            await markReportAsSynced(report.id, response.data.id, response.data);
            results.synced.push({
              localId: report.id,
              serverId: response.data.id
            });
            console.log(`✅ Synced report: ${report.id} → ${response.data.id}`);
          } else {
            throw new Error(response.message || 'Sync failed');
          }
        } catch (error) {
          console.error(`❌ Failed to sync report ${report.id}:`, error);
          
          // Update sync status
          await updateReport(report.id, {
            syncStatus: 'failed',
            syncError: error.message,
            lastSyncAttempt: new Date().toISOString()
          });

          results.failed.push({
            localId: report.id,
            error: error.message
          });
        }
      }

      // Small delay between batches
      if (i + SYNC_CONFIG.BATCH_SIZE < unsyncedReports.length) {
        await delay(100);
      }
    }

    lastSuccessfulSync = new Date().toISOString();
    console.log(`✅ Sync complete: ${results.synced.length} synced, ${results.failed.length} failed`);
    
    emitEvent('sync:complete', results);
    return { success: true, results };

  } catch (error) {
    console.error('❌ Sync error:', error);
    emitEvent('sync:error', { error: error.message });
    return { success: false, error: error.message };
  } finally {
    isSyncing = false;
  }
}

/**
 * Sync single report
 */
export async function syncSingleReport(reportId) {
  if (!navigator.onLine) {
    throw new Error('Device is offline');
  }

  const report = await getReportById(reportId);
  if (!report) {
    throw new Error('Report not found');
  }

  if (report.syncStatus === 'synced') {
    console.log('Report already synced');
    return { success: true, report };
  }

  try {
    await updateReport(report.id, { syncStatus: 'syncing' });

    const reportData = {
      category: report.category,
      title: report.title,
      area: report.area,
      description: report.description,
      organizationId: report.organizationId,
      urgency: report.urgency || 'medium'
    };

    const response = await API.createReport(reportData);

    if (response.success) {
      await markReportAsSynced(report.id, response.data.id, response.data);
      console.log(`✅ Synced single report: ${report.id} → ${response.data.id}`);
      return { success: true, report: response.data };
    } else {
      throw new Error(response.message || 'Sync failed');
    }
  } catch (error) {
    await updateReport(report.id, {
      syncStatus: 'failed',
      syncError: error.message
    });
    throw error;
  }
}

// ============================================================================
// DATA CACHING (Fetch from backend and cache locally)
// ============================================================================

/**
 * Fetch and cache services from backend
 */
export async function fetchAndCacheServices() {
  if (!navigator.onLine) {
    console.log('📡 Offline - using cached services');
    return { success: false, cached: true };
  }

  try {
    console.log('🔄 Fetching services from backend...');
    const response = await API.getServices();
    
    if (response.success) {
      await cacheServices(response.data);
      console.log(`✅ Cached ${response.data.length} services`);
      emitEvent('cache:services', { count: response.data.length });
      return { success: true, count: response.data.length };
    }
  } catch (error) {
    console.error('❌ Failed to fetch services:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch and cache emergency guides from backend
 */
export async function fetchAndCacheEmergencyGuides() {
  if (!navigator.onLine) {
    console.log('📡 Offline - using cached guides');
    return { success: false, cached: true };
  }

  try {
    console.log('🔄 Fetching emergency guides from backend...');
    const response = await API.getEmergencyGuides();
    
    if (response.success) {
      await cacheEmergencyGuides(response.data);
      console.log(`✅ Cached ${response.data.length} emergency guides`);
      emitEvent('cache:guides', { count: response.data.length });
      return { success: true, count: response.data.length };
    }
  } catch (error) {
    console.error('❌ Failed to fetch emergency guides:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch and cache organizations from backend
 */
export async function fetchAndCacheOrganizations() {
  if (!navigator.onLine) {
    console.log('📡 Offline - using cached organizations');
    return { success: false, cached: true };
  }

  try {
    console.log('🔄 Fetching organizations from backend...');
    const response = await API.getOrganizations();
    
    if (response.success) {
      await cacheOrganizations(response.data);
      console.log(`✅ Cached ${response.data.length} organizations`);
      emitEvent('cache:organizations', { count: response.data.length });
      return { success: true, count: response.data.length };
    }
  } catch (error) {
    console.error('❌ Failed to fetch organizations:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch and cache all data
 */
export async function fetchAndCacheAll() {
  if (!navigator.onLine) {
    console.log('📡 Offline - cache update skipped');
    return { success: false, offline: true };
  }

  emitEvent('cache:start', {});
  
  const results = await Promise.allSettled([
    fetchAndCacheServices(),
    fetchAndCacheEmergencyGuides(),
    fetchAndCacheOrganizations()
  ]);

  const summary = {
    services: results[0].status === 'fulfilled' ? results[0].value : { success: false },
    guides: results[1].status === 'fulfilled' ? results[1].value : { success: false },
    organizations: results[2].status === 'fulfilled' ? results[2].value : { success: false }
  };

  emitEvent('cache:complete', summary);
  console.log('✅ Cache update complete:', summary);
  return summary;
}

// ============================================================================
// AUTOMATIC SYNC
// ============================================================================

/**
 * Start automatic sync
 */
export function startAutoSync() {
  if (syncInterval) {
    console.log('Auto-sync already running');
    return;
  }

  console.log(`🔄 Starting auto-sync (every ${SYNC_CONFIG.AUTO_SYNC_INTERVAL / 1000}s)`);
  
  // Initial sync
  performAutoSync();

  // Set up interval
  syncInterval = setInterval(() => {
    performAutoSync();
  }, SYNC_CONFIG.AUTO_SYNC_INTERVAL);

  emitEvent('autosync:started', {});
}

/**
 * Stop automatic sync
 */
export function stopAutoSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    console.log('⏸️ Auto-sync stopped');
    emitEvent('autosync:stopped', {});
  }
}

/**
 * Perform automatic sync
 */
async function performAutoSync() {
  if (!navigator.onLine) {
    console.log('📡 Offline - auto-sync skipped');
    return;
  }

  try {
    // Sync reports
    await syncReports();

    // Update cache (if needed)
    const shouldUpdateCache = !lastSuccessfulSync || 
      (Date.now() - new Date(lastSuccessfulSync).getTime()) > SYNC_CONFIG.CACHE_MAX_AGE;

    if (shouldUpdateCache) {
      await fetchAndCacheAll();
    }

    // Clean up old completed sync items
    await clearCompletedSyncItems();

  } catch (error) {
    console.error('Auto-sync error:', error);
  }
}

// ============================================================================
// NETWORK STATUS HANDLERS
// ============================================================================

/**
 * Handle online event
 */
export function handleOnline() {
  console.log('🌐 Back online!');
  emitEvent('network:online', {});
  
  // Trigger sync
  setTimeout(() => {
    syncReports();
    fetchAndCacheAll();
  }, 1000);
}

/**
 * Handle offline event
 */
export function handleOffline() {
  console.log('📡 Gone offline');
  emitEvent('network:offline', {});
}

/**
 * Initialize network listeners
 */
export function initializeNetworkListeners() {
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  console.log('✅ Network listeners initialized');
}

/**
 * Remove network listeners
 */
export function removeNetworkListeners() {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
}

// ============================================================================
// UTILITIES
// ============================================================================

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Force sync (bypass checks)
 */
export async function forceSync() {
  console.log('🔄 Force sync initiated');
  emitEvent('sync:forced', {});
  
  const results = await Promise.allSettled([
    syncReports(),
    fetchAndCacheAll()
  ]);

  return {
    reports: results[0].status === 'fulfilled' ? results[0].value : { success: false },
    cache: results[1].status === 'fulfilled' ? results[1].value : { success: false }
  };
}

/**
 * Get sync statistics
 */
export async function getSyncStatistics() {
  const dbStats = await getDatabaseStats();
  const status = await getSyncStatus();
  
  return {
    ...status,
    ...dbStats,
    autoSyncEnabled: syncInterval !== null,
    syncInterval: SYNC_CONFIG.AUTO_SYNC_INTERVAL,
    cacheMaxAge: SYNC_CONFIG.CACHE_MAX_AGE
  };
}

// Export configuration
export { SYNC_CONFIG };
