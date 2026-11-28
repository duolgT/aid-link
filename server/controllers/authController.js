import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Organization } from '../models/Organization.js';
import { PendingRegistration } from '../models/PendingRegistration.js';
import { validateOrganization } from '../utils/validation.js';
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from '../services/emailService.js';

// @desc    Register humanitarian organization (Stage 1 - Pending)
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

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists in organizations (verified accounts)
    const existingOrg = await Organization.findByEmail(normalizedEmail);
    if (existingOrg) {
      return res.status(409).json({
        success: false,
        message: 'Organization with this email already exists'
      });
    }

    // Check if email already has a pending registration
    const existingPending = await PendingRegistration.findByEmail(normalizedEmail);
    if (existingPending) {
      // Delete old pending registration and create new one
      await PendingRegistration.delete(normalizedEmail);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Store in pending_registrations table (NOT in organizations yet)
    const pendingReg = await PendingRegistration.create({
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      sector,
      verification_code: verificationCode,
      verification_token: verificationToken,
      verification_expires: verificationExpires
    });

    // Send verification email with code
    try {
      await sendVerificationEmail(normalizedEmail, name.trim(), verificationCode);
      console.log('✅ Verification email sent to:', normalizedEmail);
    } catch (emailError) {
      console.error('⚠️ Failed to send verification email:', emailError.message);
      // Log code in development for debugging (server console only)
      console.log('🔐 DEV MODE - Verification Code:', verificationCode);
    }

    res.status(201).json({
      success: true,
      message: 'Registration initiated. Please check your email for the verification code. The code expires in 10 minutes.',
      data: {
        email: normalizedEmail,
        name: name.trim(),
        emailSent: true,
        expiresIn: '10 minutes'
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

// @desc    Verify email with 6-digit code (Stage 2 - Create Account)
// @route   POST /api/auth/verify-code
// @access  Public
export const verifyCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find pending registration by email and code
    const pendingReg = await PendingRegistration.findByEmailAndCode(normalizedEmail, code);

    if (!pendingReg) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code. Please request a new code.'
      });
    }

    // Check if organization already exists (edge case)
    const existingOrg = await Organization.findByEmail(normalizedEmail);
    if (existingOrg) {
      // Clean up pending registration
      await PendingRegistration.delete(normalizedEmail);
      
      return res.status(409).json({
        success: false,
        message: 'Organization with this email already exists. Please login.'
      });
    }

    // NOW create the actual organization account (verified immediately)
    const organization = await Organization.create({
      id: pendingReg.id,
      name: pendingReg.name,
      email: pendingReg.email,
      password: pendingReg.password, // Already hashed
      sector: pendingReg.sector,
      is_verified: true, // Verified immediately upon code confirmation
      verification_token: null,
      verification_code: null,
      verification_token_expires: null
    });

    // Delete pending registration
    await PendingRegistration.delete(normalizedEmail);

    // Send welcome email
    try {
      await sendWelcomeEmail(organization.email, organization.name);
    } catch (emailError) {
      console.error('⚠️ Failed to send welcome email:', emailError);
    }

    console.log('✅ Account created and verified:', organization.email);

    res.json({
      success: true,
      message: 'Email verified successfully! Your account has been created. You can now log in.',
      data: {
        email: organization.email,
        name: organization.name
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email with token (backward compatibility)
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
      verification_code: null,
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

// @desc    Resend verification code
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

    const normalizedEmail = email.toLowerCase().trim();

    // Check if organization already exists and is verified
    const existingOrg = await Organization.findByEmail(normalizedEmail);
    if (existingOrg && existingOrg.is_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified. Please login.'
      });
    }

    // Find pending registration
    const pendingReg = await PendingRegistration.findByEmail(normalizedEmail);

    if (!pendingReg) {
      return res.status(404).json({
        success: false,
        message: 'No pending registration found for this email. Please register first.'
      });
    }

    // Generate new 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await PendingRegistration.update(normalizedEmail, {
      verification_code: verificationCode,
      verification_token: verificationToken,
      verification_expires: verificationExpires
    });

    // Send verification email with new code
    try {
      await sendVerificationEmail(normalizedEmail, pendingReg.name, verificationCode);
      console.log('✅ New verification code sent to:', normalizedEmail);
    } catch (emailError) {
      console.error('⚠️ Failed to resend verification email:', emailError.message);
      // Log code in development for debugging (server console only)
      console.log('🔐 DEV MODE - Verification Code:', verificationCode);
    }

    res.json({
      success: true,
      message: 'Verification code sent. Please check your email. The code expires in 10 minutes.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request password reset (send code to email)
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find organization
    const organization = await Organization.findByEmail(normalizedEmail);

    if (!organization) {
      // Don't reveal if email exists or not (security)
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset code.'
      });
    }

    if (!organization.is_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email not verified. Please complete registration first.'
      });
    }

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update organization with reset code
    await Organization.update(organization.id, {
      reset_code: resetCode,
      reset_code_expires: resetCodeExpires
    });

    // Send password reset email
    try {
      await sendPasswordResetEmail(normalizedEmail, organization.name, resetCode);
      console.log('✅ Password reset code sent to:', normalizedEmail);
    } catch (emailError) {
      console.error('⚠️ Failed to send password reset email:', emailError.message);
      // Log code in development for debugging (server console only)
      console.log('🔐 DEV MODE - Password Reset Code:', resetCode);
    }

    res.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset code.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password with code
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, code, and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find organization with valid reset code
    const [rows] = await Organization.query(
      'SELECT * FROM organizations WHERE email = ? AND reset_code = ? AND reset_code_expires > NOW()',
      [normalizedEmail, code]
    );

    const organization = rows[0];

    if (!organization) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset code'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset code
    await Organization.update(organization.id, {
      password: hashedPassword,
      reset_code: null,
      reset_code_expires: null
    });

    console.log('✅ Password reset successfully for:', normalizedEmail);

    res.json({
      success: true,
      message: 'Password reset successfully! You can now login with your new password.'
    });
  } catch (error) {
    next(error);
  }
};
