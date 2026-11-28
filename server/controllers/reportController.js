import { Report } from '../models/Report.js';
import { Organization } from '../models/Organization.js';
import { validateReport } from '../utils/validation.js';

// Track recent submissions to prevent duplicates (5 minute window)
const recentSubmissions = new Map();

function getSubmissionKey(organizationId, title, description) {
  // Create a hash of the report content
  return `${organizationId}-${title.substring(0, 20)}-${description.substring(0, 30)}`;
}

function isDuplicate(key) {
  const now = Date.now();
  const lastSubmission = recentSubmissions.get(key);
  
  // Check if submitted in last 5 minutes
  if (lastSubmission && (now - lastSubmission) < 300000) {
    return true;
  }
  
  // Clean up old entries (older than 10 minutes)
  for (const [oldKey, timestamp] of recentSubmissions.entries()) {
    if (now - timestamp > 600000) {
      recentSubmissions.delete(oldKey);
    }
  }
  
  return false;
}

function markSubmission(key) {
  recentSubmissions.set(key, Date.now());
}

// @desc    Submit anonymous community challenge report
// @route   POST /api/reports
// @access  Public
export const createReport = async (req, res, next) => {
  try {
    const { category, title, area, description, organizationId, urgency } = req.body;

    // Backend validation (never trust frontend)
    const validation = validateReport({ category, title, description, organizationId });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Verify organization exists and is verified
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    if (!organization.verified) {
      return res.status(403).json({
        success: false,
        message: 'Organization account must be verified to receive reports'
      });
    }

    // Check for duplicate submission
    const submissionKey = getSubmissionKey(organizationId, title, description);
    if (isDuplicate(submissionKey)) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate submission detected. Please wait before resubmitting the same report.'
      });
    }

    // Sanitize input (prevent XSS and injection)
    const sanitizedTitle = title.trim().substring(0, 80);
    const sanitizedDescription = description.trim().substring(0, 500);
    const sanitizedArea = area ? area.trim().substring(0, 100) : 'Not specified';

    // Validate urgency level
    const validUrgency = ['low', 'medium', 'high'].includes(urgency) ? urgency : 'medium';

    // Create report
    const report = await Report.create({
      id: crypto.randomUUID(),
      category,
      title: sanitizedTitle,
      area: sanitizedArea,
      description: sanitizedDescription,
      organization_id: organizationId,
      urgency: validUrgency,
      status: 'pending',
      is_anonymous: true,
      synced: true
    });

    // Mark this submission to prevent duplicates
    markSubmission(submissionKey);

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully to ' + organization.name,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reports for authenticated organization
// @route   GET /api/reports/org
// @access  Private
export const getOrganizationReports = async (req, res, next) => {
  try {
    const { status, urgency, category } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (urgency) filters.urgency = urgency;
    if (category) filters.category = category;

    const reports = await Report.findByOrganization(req.organizationId, filters);

    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update report status
// @route   PATCH /api/reports/org/:id
// @access  Private
export const updateReportStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['pending', 'in_progress', 'resolved', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Verify organization owns this report
    if (report.organization_id !== req.organizationId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this report'
      });
    }

    const updatedReport = await Report.update(id, {
      status,
      ...(notes && { notes: notes.trim().substring(0, 500) })
    });

    res.json({
      success: true,
      message: 'Report updated successfully',
      data: updatedReport
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Batch sync offline reports
// @route   POST /api/reports/batch
// @access  Public
export const batchSyncReports = async (req, res, next) => {
  try {
    const { reports } = req.body;

    if (!Array.isArray(reports) || reports.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reports array is required'
      });
    }

    if (reports.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 50 reports per batch'
      });
    }

    const syncedReports = [];
    const errors = [];

    for (const reportData of reports) {
      try {
        // Validate each report
        const validation = validateReport(reportData);
        if (!validation.isValid) {
          errors.push({
            localId: reportData.id,
            errors: validation.errors
          });
          continue;
        }

        // Check if organization exists and is verified
        const organization = await Organization.findById(reportData.organizationId);
        if (!organization || !organization.verified) {
          errors.push({
            localId: reportData.id,
            errors: ['Organization not found or not verified']
          });
          continue;
        }

        // Check for duplicate
        const submissionKey = getSubmissionKey(
          reportData.organizationId, 
          reportData.title, 
          reportData.description
        );
        
        if (isDuplicate(submissionKey)) {
          errors.push({
            localId: reportData.id,
            errors: ['Duplicate submission detected']
          });
          continue;
        }

        // Create report
        const report = await Report.create({
          id: crypto.randomUUID(),
          category: reportData.category,
          title: reportData.title.trim().substring(0, 80),
          area: reportData.area || 'Not specified',
          description: reportData.description.trim().substring(0, 500),
          organization_id: reportData.organizationId,
          urgency: reportData.urgency || 'medium',
          status: 'pending',
          is_anonymous: true,
          synced: true
        });

        markSubmission(submissionKey);

        syncedReports.push({
          localId: reportData.id,
          serverId: report.id,
          report
        });
      } catch (error) {
        errors.push({
          localId: reportData.id,
          errors: [error.message]
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Synced ${syncedReports.length} of ${reports.length} reports`,
      data: {
        synced: syncedReports,
        failed: errors,
        total: reports.length,
        successCount: syncedReports.length,
        errorCount: errors.length
      }
    });
  } catch (error) {
    next(error);
  }
};
