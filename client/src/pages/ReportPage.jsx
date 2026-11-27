
import { useEffect, useState } from "react";
import {
  ClipboardList,
  Trash2,
  MapPin,
  Clock3,
  Database,
  Info,
} from "lucide-react";

import ReportForm from "../components/ReportForm";
import { getReports, deleteReport } from "../lib/db";
import { getReportCategoryLabel } from "../utils/constants";

function ReportPage() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadReports() {
      try {
        const savedReports = await getReports();

        if (!cancelled) {
          setReports(savedReports);
        }
      } catch (err) {
        console.error("Failed to load reports:", err);

        if (!cancelled) {
          setError("Unable to read saved reports.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleReportSaved(report) {
    // Check if report was successfully submitted to backend
    if (report.syncStatus === 'synced' || report.serverId) {
      setMessage("✅ Report submitted successfully to the organization!");
      setError("");
      // Don't add to local list if it was submitted to backend
    } else {
      setReports((previous) => [report, ...previous]);
      setMessage("⚠️ Report saved locally. It will be sent when you're online.");
      setError("");
    }
    
    // Clear message after 5 seconds
    setTimeout(() => setMessage(""), 5000);
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Permanently delete this locally saved report?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");
    setMessage("");

    try {
      await deleteReport(id);

      setReports((previous) =>
        previous.filter((report) => report.id !== id)
      );

      setMessage("Local report deleted.");
    } catch (err) {
      console.error("Unable to delete report:", err);
      setError("Could not delete the report.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="report-page container">
      <header className="report-page-header">
        <p className="eyebrow">
          <ClipboardList size={18} />
          Community reporting
        </p>

        <h1>Report a Community Challenge</h1>

        <p>
          Document general challenges affecting access
          to essential community services.
        </p>
      </header>

      <div className="report-warning" role="note">
        <Info size={23} aria-hidden="true" />
        <p>
          Submit community reports directly to humanitarian organizations.
          Your report will be reviewed and appropriate action will be taken.
          For urgent emergencies, please contact emergency services directly.
        </p>
      </div>

      {message && (
        <div className="report-success" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      <div className="report-layout">
        <div>
          <ReportForm onSaved={handleReportSaved} />
        </div>

        <aside className="report-sidebar">
          <div className="report-stat-card">
            <Database size={25} />
            <span>Pending Submissions</span>
            <strong>{reports.length}</strong>
            <p>Waiting to be sent</p>
          </div>

          <div className="report-info-card">
            <h3>How it works</h3>
            <p>
              Select an organization, describe the challenge, and submit your report.
              The organization will receive it and take appropriate action.
            </p>
            <p>
              Reports are submitted immediately when online, or saved locally
              to send later if you're offline.
            </p>
          </div>
        </aside>
      </div>

      <section className="saved-reports">
        <div className="saved-reports-heading">
          <h2>Pending Reports</h2>
          <span>{reports.length} waiting to be sent</span>
        </div>

        {isLoading ? (
          <p>Loading pending reports...</p>
        ) : reports.length === 0 ? (
          <div className="reports-empty">
            <ClipboardList size={38} />
            <h3>No pending reports</h3>
            <p>
              Reports are submitted immediately to organizations when you have an internet connection.
            </p>
          </div>
        ) : (
          <div className="report-list">
            {reports.map((report) => (
              <article
                className="saved-report-card"
                key={report.id}
              >
                <div className="saved-report-top">
                  <span className="report-category-tag">
                    {getReportCategoryLabel(
                      report.category
                    )}
                  </span>

                  <span className="report-local-status">
                    Pending submission
                  </span>
                </div>

                <h3>{report.title}</h3>
                <p className="saved-report-description">
                  {report.description}
                </p>

                <div className="saved-report-meta">
                  <span>
                    <MapPin size={16} />
                    {report.area}
                  </span>

                  <span>
                    <Clock3 size={16} />
                    {new Date(
                      report.createdAt
                    ).toLocaleString()}
                  </span>
                </div>

                <div className="saved-report-actions">
                  <button
                    type="button"
                    className="delete-report-btn"
                    disabled={deletingId === report.id}
                    onClick={() =>
                      handleDelete(report.id)
                    }
                  >
                    <Trash2 size={17} />
                    {deletingId === report.id
                      ? "Deleting..."
                      : "Delete Pending Report"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

export default ReportPage;
