import { Service } from '../models/Service.js';
import { categories } from '../data/services.js';
import { validateService } from '../utils/serviceValidation.js';

// @desc    Get all services with optional filtering
// @route   GET /api/services?category=health&area=Kakuma&verified=true
// @access  Public
export const getServices = async (req, res, next) => {
  try {
    const { category, area, verified, search } = req.query;

    const filters = {};
    if (category) filters.category = category;
    if (area) filters.area = area;
    if (verified !== undefined) filters.verified = verified === 'true';
    if (search) filters.search = search;

    const services = await Service.findAll(filters);

    res.json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service by ID
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all service categories
// @route   GET /api/services/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new service (Protected - Organization only)
// @route   POST /api/services
// @access  Private
export const createService = async (req, res, next) => {
  try {
    const { name, category, area, description, servicesOffered, coordinates, phone } = req.body;

    const validation = validateService({ name, category, description, servicesOffered });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const newService = await Service.create({
      id: `service-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      category,
      area: area?.trim() || 'Not specified',
      description: description.trim(),
      services_offered: servicesOffered.map(s => s.trim()),
      coordinates: coordinates || null,
      phone: phone?.trim() || null,
      verified: false,
      is_demo: false,
      organization_id: req.organizationId
    });

    // In production, save to database
    // services.push(newService);

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: newService
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update service (Protected - Organization only)
// @route   PATCH /api/services/:id
// @access  Private
export const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if organization owns this service
    if (service.organization_id && service.organization_id !== req.organizationId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this service'
      });
    }

    // Update service
    const updatedService = await Service.update(id, updates);

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: updatedService
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete service (Protected - Organization only)
// @route   DELETE /api/services/:id
// @access  Private
export const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if organization owns this service
    if (service.organization_id && service.organization_id !== req.organizationId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this service'
      });
    }

    await Service.delete(id);

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
