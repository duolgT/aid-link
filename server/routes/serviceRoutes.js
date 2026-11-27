import express from 'express';
import {
  getServices,
  getServiceById,
  getCategories,
  createService,
  updateService,
  deleteService
} from '../controllers/serviceController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/categories', getCategories);
router.get('/:id', getServiceById);
router.get('/', getServices);

// Protected routes (require authentication)
router.post('/', authenticate, createService);
router.patch('/:id', authenticate, updateService);
router.delete('/:id', authenticate, deleteService);

export default router;
