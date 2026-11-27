import express from 'express';
import {
  getEmergencyGuides,
  getEmergencyGuideById,
  getEmergencyCategories,
  createEmergencyGuide,
  updateEmergencyGuide,
  deleteEmergencyGuide
} from '../controllers/emergencyGuideController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/categories', getEmergencyCategories);
router.get('/:id', getEmergencyGuideById);
router.get('/', getEmergencyGuides);

// Protected routes (require authentication)
router.post('/', authenticate, createEmergencyGuide);
router.patch('/:id', authenticate, updateEmergencyGuide);
router.delete('/:id', authenticate, deleteEmergencyGuide);

export default router;
