import { emergencyGuides, emergencyCategories } from '../data/emergencyGuides.js';
import { validateEmergencyGuide } from '../utils/serviceValidation.js';

// @desc    Get all emergency guides with optional filtering
// @route   GET /api/emergency-guides?category=medical
// @access  Public
export const getEmergencyGuides = async (req, res, next) => {
  try {
    const { category, search, verified } = req.query;

    let filteredGuides = [...emergencyGuides];

    // Filter by category
    if (category && category !== 'all') {
      filteredGuides = filteredGuides.filter(g => g.category === category);
    }

    // Filter by verified status
    if (verified !== undefined) {
      const isVerified = verified === 'true';
      filteredGuides = filteredGuides.filter(g => g.locallyVerified === isVerified);
    }

    // Search in title and summary
    if (search) {
      const searchLower = search.toLowerCase();
      filteredGuides = filteredGuides.filter(g =>
        g.title.toLowerCase().includes(searchLower) ||
        g.summary.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      count: filteredGuides.length,
      data: filteredGuides
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

    const guide = emergencyGuides.find(g => g.id === id);

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

    const newGuide = {
      id: `guide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      category,
      summary: summary.trim(),
      steps: steps.map(s => s.trim()),
      reminder: reminder?.trim() || null,
      locallyVerified: false,
      organizationId: req.organizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In production, save to database
    emergencyGuides.push(newGuide);

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

    const guideIndex = emergencyGuides.findIndex(g => g.id === id);

    if (guideIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Emergency guide not found'
      });
    }

    const guide = emergencyGuides[guideIndex];

    // Check if organization owns this guide
    if (guide.organizationId && guide.organizationId !== req.organizationId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this guide'
      });
    }

    // Update guide
    emergencyGuides[guideIndex] = {
      ...guide,
      ...updates,
      id: guide.id, // Prevent ID change
      organizationId: guide.organizationId, // Prevent org change
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Emergency guide updated successfully',
      data: emergencyGuides[guideIndex]
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

    const guideIndex = emergencyGuides.findIndex(g => g.id === id);

    if (guideIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Emergency guide not found'
      });
    }

    const guide = emergencyGuides[guideIndex];

    // Check if organization owns this guide
    if (guide.organizationId && guide.organizationId !== req.organizationId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this guide'
      });
    }

    emergencyGuides.splice(guideIndex, 1);

    res.json({
      success: true,
      message: 'Emergency guide deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
