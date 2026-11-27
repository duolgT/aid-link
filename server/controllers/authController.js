import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { validateOrganization } from '../utils/validation.js';

// @desc    Register humanitarian organization
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, sector } = req.body;

    const validation = validateOrganization({ name, email, password, sector });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const existingOrg = db.findOrganizationByEmail(email);
    if (existingOrg) {
      return res.status(409).json({
        success: false,
        message: 'Organization with this email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const organization = db.createOrganization({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      sector
    });

    const token = jwt.sign(
      { organizationId: organization.id, email: organization.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { password: _, ...orgData } = organization;

    res.status(201).json({
      success: true,
      message: 'Organization registered successfully',
      data: {
        organization: orgData,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login humanitarian organization
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const organization = db.findOrganizationByEmail(email.toLowerCase().trim());
    if (!organization) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, organization.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { organizationId: organization.id, email: organization.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { password: _, ...orgData } = organization;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        organization: orgData,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current organization profile
// @route   GET /api/auth/me
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const organization = db.findOrganizationById(req.organizationId);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    const { password: _, ...orgData } = organization;

    res.json({
      success: true,
      data: orgData
    });
  } catch (error) {
    next(error);
  }
};
