import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Organization } from '../models/Organization.js';
import { validateOrganization } from '../utils/validation.js';
import { sendVerificationEmail, sendWelcomeEmail } from '../services/emailService.js';

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

    const existingOrg = await Organization.findByEmail(email.toLowerCase().trim());
    if (existingOrg) {
      return res.status(409).json({
        success: false,
        message: 'Organization with this email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token (expires in 24 hours)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const organization = await Organization.create({
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      sector,
      is_verified: false,
      verification_token: verificationToken,
      verification_token_expires: verificationTokenExpires
    });

    // Send verification email
    try {
      await sendVerificationEmail(organization.email, organization.name, verificationToken);
      console.log('✅ Verification email sent to:', organization.email);
    } catch (emailError) {
      console.error('⚠️ Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }

    // Generate JWT token
    const token = jwt.sign(
      { organizationId: organization.id, email: organization.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { password: _, verification_token: __, ...orgData } = organization;

    res.status(201).json({
      success: true,
      message: 'Organization registered successfully. Please check your email to verify your account.',
      data: {
        organization: orgData,
        token,
        emailSent: true
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

    const organization = await Organization.findByEmail(email.toLowerCase().trim());
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
    const organization = await Organization.findById(req.organizationId);

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

// @desc    Verify email with token
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // Find organization by verification token
    const [rows] = await Organization.query(
      'SELECT * FROM organizations WHERE verification_token = ? AND verification_token_expires > NOW()',
      [token]
    );

    const organization = rows[0];

    if (!organization) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    if (organization.is_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    // Update organization as verified
    await Organization.update(organization.id, {
      is_verified: true,
      verification_token: null,
      verification_token_expires: null
    });

    // Send welcome email
    try {
      await sendWelcomeEmail(organization.email, organization.name);
    } catch (emailError) {
      console.error('⚠️ Failed to send welcome email:', emailError);
    }

    res.json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
      data: {
        email: organization.email,
        name: organization.name
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const organization = await Organization.findByEmail(email.toLowerCase().trim());

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    if (organization.is_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await Organization.update(organization.id, {
      verification_token: verificationToken,
      verification_token_expires: verificationTokenExpires
    });

    // Send verification email
    await sendVerificationEmail(organization.email, organization.name, verificationToken);

    res.json({
      success: true,
      message: 'Verification email sent. Please check your inbox.'
    });
  } catch (error) {
    next(error);
  }
};
