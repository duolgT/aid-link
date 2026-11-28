import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Share2,
} from "lucide-react";
import { getEmergencyGuideById, emergencyCategories } from "../data/emergencyGuides";

const STORAGE_KEY = "aidlink:saved-emergency-guides";

function EmergencyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const guide = getEmergencyGuideById(id);

  const [savedIds, setSavedIds] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  });

  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (!guide) {
      navigate("/emergency", { replace: true });
    }
  }, [guide, navigate]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds));
    } catch (error) {
      console.warn("Could not save bookmarks", error);
    }
  }, [savedIds]);

  function toggleBookmark() {
    if (!guide) return;
    setSavedIds((previous) =>
      previous.includes(guide.id)
        ? previous.filter((item) => item !== guide.id)
        : [...previous, guide.id]
    );
  }

  async function handleShare() {
    if (!guide) return;

    const shareData = {
      title: guide.title,
      text: guide.summary,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error.name !== "AbortError") {
          fallbackCopyLink();
        }
      }
    } else {
      fallbackCopyLink();
    }
  }

  function fallbackCopyLink() {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      })
      .catch(() => {
        alert("Could not copy link. Please copy it manually from your browser.");
      });
  }

  if (!guide) {
    return null;
  }

  const isSaved = savedIds.includes(guide.id);
  const categoryLabel = emergencyCategories.find(
    (cat) => cat.id === guide.category
  )?.label;

  return (
    <div className="emergency-detail-page container">
      <div className="emergency-detail-nav">
        <Link to="/emergency" className="back-link">
          <ArrowLeft size={20} />
          Back to Emergency Guides
        </Link>
      </div>

      <article className="emergency-detail">
        <header className="emergency-detail-header">
          <div className="emergency-detail-meta">
            <span className="guide-category-badge">{categoryLabel}</span>
            {!guide.locallyVerified && (
              <span className="guide-draft-badge">
                <AlertTriangle size={16} />
                Draft - Not Locally Verified
              </span>
            )}
          </div>

          <h1>{guide.title}</h1>

          <p className="emergency-detail-summary">{guide.summary}</p>

          <div className="emergency-detail-actions">
            <button
              type="button"
              className={`btn ${isSaved ? "btn-secondary" : "btn-outline"}`}
              onClick={toggleBookmark}
              aria-pressed={isSaved}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck size={20} />
                  Saved
                </>
              ) : (
                <>
                  <Bookmark size={20} />
                  Save Guide
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-outline"
              onClick={handleShare}
            >
              {shared ? (
                <>
                  <CheckCircle size={20} />
                  Link Copied!
                </>
              ) : (
                <>
                  <Share2 size={20} />
                  Share
                </>
              )}
            </button>
          </div>
        </header>

        <section className="emergency-detail-content">
          <div className="emergency-notice warning">
            <ShieldAlert size={24} />
            <div>
              <strong>Important Safety Notice</strong>
              <p>
                This guide provides general information only. Always follow local
                emergency procedures and contact appropriate authorities in your
                area. This information is not a substitute for professional advice.
              </p>
            </div>
          </div>

          <div className="emergency-steps">
            <h2>What to Do</h2>
            <ol className="emergency-steps-list">
              {guide.steps.map((step, index) => (
                <li key={index} className="emergency-step">
                  <span className="step-number">{index + 1}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </div>

          {guide.reminder && (
            <div className="emergency-reminder">
              <AlertTriangle size={20} />
              <div>
                <strong>Remember</strong>
                <p>{guide.reminder}</p>
              </div>
            </div>
          )}
        </section>

        <section className="emergency-detail-footer">
          <div className="emergency-verification-status">
            <h3>Verification Status</h3>
            <p>
              {guide.locallyVerified ? (
                <span className="status-verified">
                  <CheckCircle size={18} />
                  Verified for this location
                </span>
              ) : (
                <span className="status-draft">
                  <AlertTriangle size={18} />
                  Draft guidance - Local verification pending
                </span>
              )}
            </p>
            <p className="status-description">
              {guide.locallyVerified
                ? "This guide has been reviewed by local responders for accuracy in this area."
                : "This guide contains general information and has not been verified by local responders. Always confirm with local authorities."}
            </p>
          </div>

          <div className="emergency-actions-cta">
            <h3>Need More Help?</h3>
            <p>
              For immediate emergency assistance, contact local emergency services
              or visit the Services Directory for verified organizations in your
              area.
            </p>
            <Link to="/services" className="btn btn-primary">
              Browse Services Directory
            </Link>
          </div>
        </section>
      </article>
    </div>
  );
}

export default EmergencyDetailPage;
