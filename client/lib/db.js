import { openDB } from "idb";

const DATABASE_NAME = import.meta.env.VITE_DATABASE_NAME
const DATABASE_VERSION = Number(import.meta.env.VITE_DATABASE_VERSION)
const REPORTS_STORE = import.meta.env.VITE_REPORTS_STORE

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(REPORTS_STORE)) {
      const store = db.createObjectStore(REPORTS_STORE, {
        keyPath: "id",
      });
      store.createIndex("createdAt", "createdAt");
      store.createIndex("status", "status");
    }
  },
});

export async function saveReport(reportData) {
  const db = await dbPromise;
  const report = {
    id: crypto.randomUUID(),
    ...reportData,
    status: "local-draft",
    createdAt: new Date().toISOString(),
  };
  await db.put(REPORTS_STORE, report);
  return report;
}

export async function getReports() {
  const db = await dbPromise;
  const reports = await db.getAll(REPORTS_STORE);
  return reports.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

export async function getReportById(id) {
  const db = await dbPromise;
  return await db.get(REPORTS_STORE, id);
}

export async function updateReport(id, updates) {
  const db = await dbPromise;
  const report = await db.get(REPORTS_STORE, id);
  if (!report) return null;
  
  const updatedReport = { ...report, ...updates };
  await db.put(REPORTS_STORE, updatedReport);
  return updatedReport;
}

export async function deleteReport(id) {
  const db = await dbPromise;
  await db.delete(REPORTS_STORE, id);
}

export async function getUnsyncedReports() {
  const db = await dbPromise;
  const allReports = await db.getAll(REPORTS_STORE);
  return allReports.filter(report => report.status === "local-draft");
}

export async function markReportAsSynced(localId, serverId) {
  const db = await dbPromise;
  const report = await db.get(REPORTS_STORE, localId);
  if (!report) return null;
  
  const updatedReport = {
    ...report,
    id: serverId,
    serverId,
    localId,
    status: "synced",
    syncedAt: new Date().toISOString()
  };
  
  await db.delete(REPORTS_STORE, localId);
  await db.put(REPORTS_STORE, updatedReport);
  return updatedReport;
}
