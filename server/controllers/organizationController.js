import { Organization } from '../models/Organization.js';

// @desc    Get all registered organizations (public endpoint for dropdown)
// @route   GET /api/organizations
// @access  Public
export const getOrganizations = async (req, res, next) => {
  try {
    const organizations = await Organization.findAll();

    const publicOrgs = organizations.map(({ id, name, sector, verified }) => ({
      id,
      name,
      sector,
      verified
    }));

    res.json({
      success: true,
      count: publicOrgs.length,
      data: publicOrgs
    });
  } catch (error) {
    next(error);
  }
};
