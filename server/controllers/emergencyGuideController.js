import { EmergencyGuide } from '../models/EmergencyGuide.js';
import { emergencyCategories } from '../data/emergencyGuides.js';
import { validateEmergencyGuide } from '../utils/serviceValidation.js';

// @desc    Get all emergency guides with optional filtering
// @route   GET /api/emergency-guides?category=medical
// @access  Public
export const getEmergencyGuides = async (req, res, next) => {
  try {
    const { category, search, verified } = req.query;

    const filters = {};
    if (category) filters.category = category;
    if (verified !== undefined) filters.verified = verified === 'true';
    if (search) filters.search = search;

    const guides = await EmergencyGuide.findAll(filters);

    res.json({
      success: true,
      count: guides.length,
      data: guides
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single emergency guide by ID
// @route   GET /api/emergency-guides/:id
// @access  Public
export const getEmergencyGuideById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const guide = await EmergencyGuide.findById(id);

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Emergency guide not found'
      });
    }

    res.json({
      success: true,
      data: guide
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all emergency categories
// @route   GET /api/emergency-guides/categories
// @access  Public
export const getEmergencyCategories = async (req, res, next) => {
  try {
    res.json({
      success: true,
      count: emergencyCategories.length,
      data: emergencyCategories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new emergency guide (Protected - Organization only)
// @route   POST /api/emergency-guides
// @access  Private
export const createEmergencyGuide = async (req, res, next) => {
  try {
    const { title, category, summary, steps, reminder } = req.body;

    const validation = validateEmergencyGuide({ title, category, summary, steps });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const newGuide = await EmergencyGuide.create({
      id: `guide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      category,
      summary: summary.trim(),
      steps: steps.map(s => s.trim()),
      reminder: reminder?.trim() || null,
      locally_verified: false,
      organization_id: req.organizationId
    });

    // In production, save to database
    // emergencyGuides.push(newGuide);

    res.status(201).json({
      success: true,
      message: 'Emergency guide created successfully',
      data: newGuide
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update emergency guide (Protected - Organization only)
// @route   PATCH /api/emergency-guides/:id
// @access  Private
export const updateEmergencyGuide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const guide = await EmergencyGuide.findById(id);

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Emergency guide not found'
      });
    }

    // Check if organization owns this guide
    if (guide.organization_id && guide.organization_id !== req.organizationId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this guide'
      });
    }

    // Update guide
    const updatedGuide = await EmergencyGuide.update(id, updates);

    res.json({
      success: true,
      message: 'Emergency guide updated successfully',
      data: updatedGuide
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete emergency guide (Protected - Organization only)
// @route   DELETE /api/emergency-guides/:id
// @access  Private
export const deleteEmergencyGuide = async (req, res, next) => {
  try {
    const { id } = req.params;

    const guide = await EmergencyGuide.findById(id);

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Emergency guide not found'
      });
    }

    // Check if organization owns this guide
    if (guide.organization_id && guide.organization_id !== req.organizationId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this guide'
      });
    }

    await EmergencyGuide.delete(id);

    res.json({
      success: true,
      message: 'Emergency guide deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
