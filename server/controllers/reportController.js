import { db } from '../config/db.js';
import { validateReport } from '../utils/validation.js';

// @desc    Submit anonymous community challenge report
// @route   POST /api/reports
// @access  Public
export const createReport = async (req, res, next) => {
  try {
    const { category, title, area, description, organizationId, urgency } = req.body;

    const validation = validateReport({ category, title, description, organizationId });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const organization = db.findOrganizationById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    const report = db.createReport({
      category,
      title: title.trim(),
      area: area || 'Not specified',
      description: description.trim(),
      organizationId,
      urgency: urgency || 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reports for authenticated organization
// @route   GET /api/org/reports
// @access  Private
export const getOrganizationReports = async (req, res, next) => {
  try {
    const { status, urgency } = req.query;

    let reports = db.getReportsByOrganization(req.organizationId);

    if (status) {
      reports = reports.filter(report => report.status === status);
    }

    if (urgency) {
      reports = reports.filter(report => report.urgency === urgency);
    }

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
// @route   PATCH /api/org/reports/:id
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

    const report = db.findReportById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (report.organizationId !== req.organizationId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this report'
      });
    }

    const updatedReport = db.updateReport(id, {
      status,
      ...(notes && { notes })
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

    const syncedReports = [];
    const errors = [];

    for (const reportData of reports) {
      const validation = validateReport(reportData);
      if (!validation.isValid) {
        errors.push({
          localId: reportData.id,
          errors: validation.errors
        });
        continue;
      }

      const report = db.createReport({
        category: reportData.category,
        title: reportData.title.trim(),
        area: reportData.area || 'Not specified',
        description: reportData.description.trim(),
        organizationId: reportData.organizationId,
        urgency: reportData.urgency || 'medium'
      });

      syncedReports.push({
        localId: reportData.id,
        serverId: report.id,
        report
      });
    }

    res.status(201).json({
      success: true,
      message: `Synced ${syncedReports.length} reports`,
      data: {
        synced: syncedReports,
        errors
      }
    });
  } catch (error) {
    next(error);
  }
};
