import express from 'express';
import {
  createReport,
  getOrganizationReports,
  updateReportStatus,
  batchSyncReports
} from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/', createReport);
router.post('/batch', batchSyncReports);

// Protected routes
router.get('/org', authenticate, getOrganizationReports);
router.patch('/org/:id', authenticate, updateReportStatus);

export default router;
