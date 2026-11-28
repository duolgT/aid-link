import express from 'express';
import { Organization } from '../models/Organization.js';

const router = express.Router();

// @desc    Manually verify an organization (for testing/admin)
// @route   POST /api/admin/verify-organization
// @access  Public (should be protected in production with admin auth)
router.post('/verify-organization', async (req, res) => {
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

    if (organization.verified) {
      return res.json({
        success: true,
        message: 'Organization is already verified',
        data: {
          email: organization.email,
          name: organization.name,
          verified: true
        }
      });
    }

    // Update to verified
    await Organization.update(organization.id, { verified: true });

    console.log(`✅ Organization verified manually: ${organization.email}`);

    res.json({
      success: true,
      message: 'Organization verified successfully',
      data: {
        email: organization.email,
        name: organization.name,
        verified: true
      }
    });

  } catch (error) {
    console.error('Error verifying organization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify organization',
      error: error.message
    });
  }
});

// @desc    Get all organizations with verification status
// @route   GET /api/admin/organizations
// @access  Public (should be protected in production with admin auth)
router.get('/organizations', async (req, res) => {
  try {
    const organizations = await Organization.findAll();

    res.json({
      success: true,
      count: organizations.length,
      data: organizations.map(org => ({
        id: org.id,
        name: org.name,
        email: org.email,
        sector: org.sector,
        verified: org.verified,
        created_at: org.created_at
      }))
    });

  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organizations',
      error: error.message
    });
  }
});

export default router;
