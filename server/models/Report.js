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

    const [result] = await pool.query(
      `INSERT INTO reports 
       (id, category, title, area, description, organization_id, urgency, status, is_anonymous, synced, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, category, title, area, description, organization_id, urgency, status, is_anonymous, synced, notes]
    );

    return this.findById(id);
  },

  // Find report by ID
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM reports WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  // Get reports by organization
  async findByOrganization(organizationId, filters = {}) {
    let query = 'SELECT * FROM reports WHERE organization_id = ?';
    const params = [organizationId];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.urgency) {
      query += ' AND urgency = ?';
      params.push(filters.urgency);
    }

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);
    return rows;
  },

  // Get all reports
  async findAll(filters = {}) {
    let query = 'SELECT * FROM reports WHERE 1=1';
    const params = [];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);
    return rows;
  },

  // Update report
  async update(id, updates) {
    const fields = [];
    const values = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await pool.query(
      `UPDATE reports SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  },

  // Delete report
  async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM reports WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
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
