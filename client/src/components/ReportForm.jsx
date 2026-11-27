import { useRef, useState, useEffect } from "react";
import { Save, Info, Building } from "lucide-react";
import { saveReport } from "../lib/db";
import { REPORT_CATEGORIES, REPORT_AREAS } from "../utils/constants";
import { getCachedOrganizations } from "../lib/db";
import API from "../config/api";

const initialValues = {
  category: "",
  title: "",
  area: "",
  description: "",
  organizationId: ""
};

function ReportForm({ onSaved }) {
  const [form, setForm] = useState(initialValues);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [organizations, setOrganizations] = useState([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);

  const savingRef = useRef(false);

  useEffect(() => {
    loadOrganizations();
  }, []);

  async function loadOrganizations() {
    try {
      setLoadingOrgs(true);
      // Try to fetch from API first
      const response = await API.getOrganizations();
      if (response.success && response.data) {
        setOrganizations(response.data);
      } else {
        // Fallback to cached data
        const cached = await getCachedOrganizations();
        setOrganizations(cached);
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);
      // Try cached as fallback
      try {
        const cached = await getCachedOrganizations();
        setOrganizations(cached);
      } catch (e) {
        console.error('Failed to load cached organizations:', e);
      }
    } finally {
      setLoadingOrgs(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (savingRef.current) return;

    const title = form.title.trim();
    const description = form.description.trim();

    const validCategory = REPORT_CATEGORIES.some(
      (category) => category.id === form.category
    );

    if (!validCategory || title.length < 6 || description.length < 20) {
      setError(
        "Select a category, enter a title of at least 6 characters, and a description of at least 20 characters."
      );
      return;
    }

    if (!form.organizationId) {
      setError("Please select an organization to receive this report.");
      return;
    }

    savingRef.current = true;
    setIsSaving(true);
    setError("");

    try {
      const savedReport = await saveReport({
        category: form.category,
        title,
        area: form.area || "Not specified",
        description,
        organizationId: form.organizationId,
      });

      setForm({ ...initialValues });
      onSaved?.(savedReport);
    } catch (err) {
      console.error("Report save failed:", err);
      setError(
        "Unable to save this report. Check your browser storage settings and try again."
      );
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  }

  return (
    <form className="report-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <h2>Create a Community Report</h2>
        <p>
          Describe a service-related challenge using general,
          non-identifying information.
        </p>
      </div>

      <div className="privacy-notice">
        <Info size={20} aria-hidden="true" />
        <p>
          Do not include names, phone numbers, medical details,
          survivor information, or exact addresses. This
          prototype stores reports only in this browser.
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="report-organization" className="form-label">
          <Building size={16} />
          Send Report To <span aria-hidden="true">*</span>
        </label>

        <select
          id="report-organization"
          name="organizationId"
          value={form.organizationId}
          onChange={handleChange}
          required
          className="form-input"
          disabled={loadingOrgs}
        >
          <option value="">
            {loadingOrgs ? 'Loading organizations...' : 'Select an organization'}
          </option>

          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name} - {org.sector}
            </option>
          ))}
        </select>
        
        {organizations.length === 0 && !loadingOrgs && (
          <small style={{color: '#ea580c'}}>
            No organizations available. Organizations must register first.
          </small>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="report-category">
          Report Category <span aria-hidden="true">*</span>
        </label>

        <select
          id="report-category"
          name="category"
          value={form.category}
          onChange={handleChange}
          required
        >
          <option value="">Select a category</option>

          {REPORT_CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="report-title">
          Report Title <span aria-hidden="true">*</span>
        </label>

        <input
          id="report-title"
          name="title"
          type="text"
          placeholder="e.g. Water supply interruption"
          value={form.title}
          onChange={handleChange}
          minLength={6}
          maxLength={80}
          required
        />

        <small>{form.title.length}/80 characters</small>
      </div>

      <div className="form-group">
        <label htmlFor="report-area">
          General Area (Optional)
        </label>

        <select
          id="report-area"
          name="area"
          value={form.area}
          onChange={handleChange}
        >
          <option value="">Select a general area</option>

          {REPORT_AREAS.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="report-description">
          Description <span aria-hidden="true">*</span>
        </label>

        <textarea
          id="report-description"
          name="description"
          rows={6}
          placeholder="Describe the general service challenge without sharing personal information..."
          value={form.description}
          onChange={handleChange}
          minLength={20}
          maxLength={500}
          required
        />

        <small>
          {form.description.length}/500 characters
        </small>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="btn btn-primary report-submit"
        disabled={isSaving}
      >
        <Save size={19} />
        {isSaving ? "Saving..." : "Save Report Locally"}
      </button>

      <p className="form-disclaimer">
        Saving a report does not submit it to an organization
        or trigger an emergency response.
      </p>
    </form>
  );
}

export default ReportForm;
