
import { useState, useEffect } from "react";
import { WifiOff, RefreshCw, CheckCircle } from "lucide-react";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { getSyncStatus, forceSyncNow } from "../lib/offlineSync";

function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const [syncStatus, setSyncStatus] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Check sync status periodically
    const checkStatus = async () => {
      try {
        const status = await getSyncStatus();
        setSyncStatus(status);
      } catch (error) {
        console.error('Failed to get sync status:', error);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [isOnline]);

  const handleManualSync = async () => {
    if (isSyncing || !isOnline) return;

    setIsSyncing(true);
    try {
      await forceSyncNow();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Refresh sync status
      const status = await getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Show offline banner when offline
  if (!isOnline) {
    return (
      <div className="offline-banner" role="status" style={{
        position: 'fixed',
        top: '80px',
        left: '0',
        right: '0',
        zIndex: '90',
        background: '#dc2626',
        color: 'white',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <WifiOff size={21} aria-hidden="true" />

        <p style={{ flex: 1, margin: 0, fontSize: '14px' }}>
          <strong>Offline Mode</strong> - You can still submit reports. 
          They will sync automatically when connection is restored.
          {syncStatus?.unsyncedReportsCount > 0 && (
            <span style={{ marginLeft: '8px', opacity: 0.9 }}>
              ({syncStatus.unsyncedReportsCount} pending)
            </span>
          )}
        </p>
      </div>
    );
  }

  // Show sync indicator when online but has unsynced data
  if (syncStatus?.hasUnsyncedData && !showSuccess) {
    return (
      <div className="sync-banner" role="status" style={{
        position: 'fixed',
        top: '80px',
        left: '0',
        right: '0',
        zIndex: '90',
        background: '#f59e0b',
        color: 'white',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <RefreshCw 
          size={18} 
          aria-hidden="true" 
          className={isSyncing ? 'spinning' : ''}
          style={{
            animation: isSyncing ? 'spin 1s linear infinite' : 'none'
          }}
        />

        <p style={{ flex: 1, margin: 0, fontSize: '13px' }}>
          {isSyncing ? (
            <span>Syncing {syncStatus.unsyncedReportsCount} offline reports...</span>
          ) : (
            <span>
              You have {syncStatus.unsyncedReportsCount} offline reports waiting to sync.
            </span>
          )}
        </p>

        {!isSyncing && (
          <button
            onClick={handleManualSync}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={14} />
            Sync Now
          </button>
        )}
      </div>
    );
  }

  // Show success message briefly
  if (showSuccess) {
    return (
      <div className="sync-success" role="status" style={{
        position: 'fixed',
        top: '80px',
        left: '0',
        right: '0',
        zIndex: '90',
        background: '#10b981',
        color: 'white',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <CheckCircle size={18} aria-hidden="true" />
        <p style={{ flex: 1, margin: 0, fontSize: '13px', fontWeight: '600' }}>
          ✅ All reports synced successfully!
        </p>
      </div>
    );
  }

  return null;
}

export default OfflineBanner;

