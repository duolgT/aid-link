import pool from '../config/db.js';

export const Report = {
  // Create new report
  async create(reportData) {
    const {
      id,
      category,
      title,
      area,
      description,
      organization_id,
      urgency = 'medium',
      status = 'pending',
      is_anonymous = true,
      synced = true,
      notes = null
    } = reportData;

    const result = await pool.query(
      `INSERT INTO reports 
       (id, category, title, area, description, organization_id, urgency, status, is_anonymous, synced, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [id, category, title, area, description, organization_id, urgency, status, is_anonymous, synced, notes]
    );

    return result.rows[0];
  },

  // Find report by ID
  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM reports WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  // Get reports by organization
  async findByOrganization(organizationId, filters = {}) {
    let query = 'SELECT * FROM reports WHERE organization_id = $1';
    const params = [organizationId];
    let paramIndex = 2;

    if (filters.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.urgency) {
      query += ` AND urgency = $${paramIndex}`;
      params.push(filters.urgency);
      paramIndex++;
    }

    if (filters.category) {
      query += ` AND category = $${paramIndex}`;
      params.push(filters.category);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  },

  // Get all reports
  async findAll(filters = {}) {
    let query = 'SELECT * FROM reports WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.category) {
      query += ` AND category = $${paramIndex}`;
      params.push(filters.category);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  },

  // Update report
  async update(id, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const result = await pool.query(
      `UPDATE reports SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows[0];
  },

  // Delete report
  async delete(id) {
    const result = await pool.query(
      'DELETE FROM reports WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  },

  // Batch create reports
  async createBatch(reportsData) {
    const results = [];
    const errors = [];

    for (const reportData of reportsData) {
      try {
        const report = await this.create(reportData);
        results.push(report);
      } catch (error) {
        errors.push({
          data: reportData,
          error: error.message
        });
      }
    }

    return { results, errors };
  }
};
