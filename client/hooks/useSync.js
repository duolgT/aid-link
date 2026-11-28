/**
 * React Hook for Sync Management
 * Provides easy access to sync functionality in React components
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getSyncStatus,
  syncReports,
  forceSync,
  startAutoSync,
  stopAutoSync,
  onSyncEvent,
  getSyncStatistics
} from '../lib/syncManager';

/**
 * Hook for sync status and operations
 */
export function useSync() {
  const [status, setStatus] = useState({
    isSyncing: false,
    lastSyncAttempt: null,
    lastSuccessfulSync: null,
    unsyncedReports: 0,
    pendingSyncs: 0,
    isOnline: navigator.onLine
  });

  const [lastEvent, setLastEvent] = useState(null);

  // Update status
  const updateStatus = useCallback(async () => {
    const currentStatus = await getSyncStatus();
    setStatus(currentStatus);
  }, []);

  // Listen to sync events
  useEffect(() => {
    updateStatus();

    const unsubscribe = onSyncEvent((event) => {
      setLastEvent(event);
      updateStatus();
    });

    return unsubscribe;
  }, [updateStatus]);

  // Manual sync function
  const triggerSync = useCallback(async () => {
    return await syncReports();
  }, []);

  // Force sync function
  const triggerForceSync = useCallback(async () => {
    return await forceSync();
  }, []);

  return {
    status,
    lastEvent,
    triggerSync,
    triggerForceSync,
    refresh: updateStatus
  };
}

/**
 * Hook for auto-sync management
 */
export function useAutoSync(enabled = true) {
  useEffect(() => {
    if (enabled) {
      startAutoSync();
      return () => stopAutoSync();
    }
  }, [enabled]);
}

/**
 * Hook for online/offline status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Hook for sync statistics
 */
export function useSyncStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const statistics = await getSyncStatistics();
    setStats(statistics);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, loading, refresh };
}
