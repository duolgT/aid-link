/**
 * Offline Synchronization Manager
 * Handles background sync of offline data when connection is restored
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
  getCachedServices,
  getCachedEmergencyGuides,
  getCachedOrganizations
} from './db';

let syncInProgress = false;
let syncInterval = null;

/**
 * Initialize offline sync manager
 * Sets up automatic sync when connection is restored
 */
export function initializeOfflineSync() {
  console.log('🔄 Initializing offline sync manager');

  // Listen for online/offline events
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Check if currently online and sync
  if (navigator.onLine) {
    console.log('✅ Device is online, starting initial sync');
    syncAllData();
  } else {
    console.log('📴 Device is offline, sync will start when online');
  }

  // Periodic sync every 5 minutes when online
  syncInterval = setInterval(() => {
    if (navigator.onLine && !syncInProgress) {
      syncAllData();
    }
  }, 5 * 60 * 1000);

  return () => {
    // Cleanup function
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    if (syncInterval) {
      clearInterval(syncInterval);
    }
  };
}

/**
 * Handle online event
 */
function handleOnline() {
  console.log('🌐 Connection restored, syncing offline data...');
  syncAllData();
}

/**
 * Handle offline event
 */
function handleOffline() {
  console.log('📴 Connection lost, app is now in offline mode');
}

/**
 * Sync all offline data
 */
export async function syncAllData() {
  if (syncInProgress) {
    console.log('⏳ Sync already in progress, skipping...');
    return;
  }

  syncInProgress = true;
  console.log('🔄 Starting full data sync...');

  try {
    // 1. Sync unsynced reports to backend
    await syncUnsyncedReports();

    // 2. Fetch and cache fresh data from backend
    await cacheBackendData();

    console.log('✅ Full sync completed successfully');
  } catch (error) {
    console.error('❌ Sync failed:', error);
  } finally {
    syncInProgress = false;
  }
}

/**
 * Sync unsynced reports to backend
 */
export async function syncUnsyncedReports() {
  try {
    const unsyncedReports = await getUnsyncedReports();
    
    if (unsyncedReports.length === 0) {
      console.log('✅ No unsynced reports to upload');
      return { success: true, synced: 0 };
    }

    console.log(`📤 Syncing ${unsyncedReports.length} unsynced reports...`);

    const results = {
      synced: 0,
      failed: 0,
      errors: []
    };

    // Try batch sync first
    if (unsyncedReports.length > 1) {
      try {
        const batchData = unsyncedReports.map(report => ({
          id: report.id,
          category: report.category,
          title: report.title,
          area: report.area,
          description: report.description,
          organizationId: report.organizationId,
          urgency: report.urgency || 'medium'
        }));

        const response = await API.batchSyncReports(batchData);
        
        if (response.success && response.data) {
          // Mark successfully synced reports
          for (const syncResult of response.data.synced) {
            await markReportAsSynced(
              syncResult.localId,
              syncResult.serverId,
              syncResult.report
            );
            results.synced++;
          }

          // Handle failed reports
          if (response.data.failed && response.data.failed.length > 0) {
            for (const failure of response.data.failed) {
              await updateReport(failure.localId, {
                syncStatus: 'failed',
                syncError: failure.errors.join(', ')
              });
              results.failed++;
              results.errors.push({ id: failure.localId, errors: failure.errors });
            }
          }

          console.log(`✅ Batch sync: ${results.synced} synced, ${results.failed} failed`);
          return results;
        }
      } catch (batchError) {
        console.warn('⚠️ Batch sync failed, falling back to individual sync:', batchError);
      }
    }

    // Fallback: Sync individually
    for (const report of unsyncedReports) {
      try {
        const reportData = {
          category: report.category,
          title: report.title,
          area: report.area,
          description: report.description,
          organizationId: report.organizationId,
          urgency: report.urgency || 'medium'
        };

        const response = await API.createReport(reportData);
        
        if (response.success && response.data) {
          await markReportAsSynced(report.id, response.data.id, response.data);
          results.synced++;
          console.log(`✅ Synced report: ${report.id} → ${response.data.id}`);
        }
      } catch (error) {
        console.error(`❌ Failed to sync report ${report.id}:`, error);
        await updateReport(report.id, {
          syncStatus: 'failed',
          syncError: error.message
        });
        results.failed++;
        results.errors.push({ id: report.id, error: error.message });
      }
    }

    console.log(`📊 Individual sync: ${results.synced} synced, ${results.failed} failed`);
    return results;

  } catch (error) {
    console.error('❌ Failed to sync unsynced reports:', error);
    throw error;
  }
}

/**
 * Fetch and cache fresh data from backend
 */
export async function cacheBackendData() {
  console.log('📥 Fetching fresh data from backend...');

  const results = {
    services: 0,
    guides: 0,
    organizations: 0,
    errors: []
  };

  // 1. Cache services
  try {
    const servicesResponse = await API.getServices();
    if (servicesResponse.success && servicesResponse.data) {
      await cacheServices(servicesResponse.data);
      results.services = servicesResponse.data.length;
      console.log(`✅ Cached ${results.services} services`);
    }
  } catch (error) {
    console.warn('⚠️ Failed to fetch services:', error);
    results.errors.push({ type: 'services', error: error.message });
  }

  // 2. Cache emergency guides
  try {
    const guidesResponse = await API.getEmergencyGuides();
    if (guidesResponse.success && guidesResponse.data) {
      await cacheEmergencyGuides(guidesResponse.data);
      results.guides = guidesResponse.data.length;
      console.log(`✅ Cached ${results.guides} emergency guides`);
    }
  } catch (error) {
    console.warn('⚠️ Failed to fetch emergency guides:', error);
    results.errors.push({ type: 'emergency_guides', error: error.message });
  }

  // 3. Cache organizations
  try {
    const orgsResponse = await API.getOrganizations();
    if (orgsResponse.success && orgsResponse.data) {
      await cacheOrganizations(orgsResponse.data);
      results.organizations = orgsResponse.data.length;
      console.log(`✅ Cached ${results.organizations} organizations`);
    }
  } catch (error) {
    console.warn('⚠️ Failed to fetch organizations:', error);
    results.errors.push({ type: 'organizations', error: error.message });
  }

  return results;
}

/**
 * Force manual sync
 * Returns sync results for user feedback
 */
export async function forceSyncNow() {
  if (!navigator.onLine) {
    throw new Error('Cannot sync while offline');
  }

  if (syncInProgress) {
    throw new Error('Sync already in progress');
  }

  console.log('🔄 Manual sync triggered');
  await syncAllData();
  
  return {
    success: true,
    message: 'Sync completed successfully'
  };
}

/**
 * Get sync status
 */
export async function getSyncStatus() {
  const unsyncedReports = await getUnsyncedReports();
  const pendingSyncs = await getPendingSyncItems();
  
  return {
    isOnline: navigator.onLine,
    syncInProgress,
    unsyncedReportsCount: unsyncedReports.length,
    pendingSyncsCount: pendingSyncs.length,
    hasUnsyncedData: unsyncedReports.length > 0 || pendingSyncs.length > 0
  };
}

/**
 * Get cached data for offline use
 */
export async function getOfflineData() {
  const [services, guides, organizations] = await Promise.all([
    getCachedServices(),
    getCachedEmergencyGuides(),
    getCachedOrganizations()
  ]);

  return {
    services,
    emergencyGuides: guides,
    organizations,
    hasData: services.length > 0 || guides.length > 0 || organizations.length > 0
  };
}

/**
 * Check if app can work offline
 */
export async function canWorkOffline() {
  const data = await getOfflineData();
  return data.hasData;
}

export default {
  initializeOfflineSync,
  syncAllData,
  syncUnsyncedReports,
  cacheBackendData,
  forceSyncNow,
  getSyncStatus,
  getOfflineData,
  canWorkOffline
};
