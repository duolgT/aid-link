import { services, categories } from '../data/services.js';
import { validateService } from '../utils/serviceValidation.js';

// @desc    Get all services with optional filtering
// @route   GET /api/services?category=health&area=Kakuma&verified=true
// @access  Public
export const getServices = async (req, res, next) => {
  try {
    const { category, area, verified, search } = req.query;

    let filteredServices = [...services];

    // Filter by category
    if (category && category !== 'all') {
      filteredServices = filteredServices.filter(s => s.category === category);
    }

    // Filter by area
    if (area) {
      filteredServices = filteredServices.filter(s => 
        s.area?.toLowerCase().includes(area.toLowerCase())
      );
    }

    // Filter by verified status
    if (verified !== undefined) {
      const isVerified = verified === 'true';
      filteredServices = filteredServices.filter(s => s.verified === isVerified);
    }

    // Search in name and description
    if (search) {
      const searchLower = search.toLowerCase();
      filteredServices = filteredServices.filter(s =>
        s.name.toLowerCase().includes(searchLower) ||
        s.description.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      count: filteredServices.length,
      data: filteredServices
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

    const service = services.find(s => s.id === id);

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

    const newService = {
      id: `service-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      category,
      area: area?.trim() || 'Not specified',
      description: description.trim(),
      servicesOffered: servicesOffered.map(s => s.trim()),
      coordinates: coordinates || null,
      phone: phone?.trim() || null,
      verified: false,
      isDemo: false,
      organizationId: req.organizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In production, save to database
    services.push(newService);

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

    const serviceIndex = services.findIndex(s => s.id === id);

    if (serviceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    const service = services[serviceIndex];

    // Check if organization owns this service
    if (service.organizationId && service.organizationId !== req.organizationId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this service'
      });
    }

    // Update service
    services[serviceIndex] = {
      ...service,
      ...updates,
      id: service.id, // Prevent ID change
      organizationId: service.organizationId, // Prevent org change
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: services[serviceIndex]
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

    const serviceIndex = services.findIndex(s => s.id === id);

    if (serviceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    const service = services[serviceIndex];

    // Check if organization owns this service
    if (service.organizationId && service.organizationId !== req.organizationId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this service'
      });
    }

    services.splice(serviceIndex, 1);

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
