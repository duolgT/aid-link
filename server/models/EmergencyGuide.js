import pool from '../config/db.js';

export const EmergencyGuide = {
  // Create new emergency guide
  async create(guideData) {
    const {
      id,
      title,
      category,
      summary,
      steps,
      reminder = null,
      locally_verified = false,
      organization_id = null
    } = guideData;

    const [result] = await pool.query(
      `INSERT INTO emergency_guides 
       (id, title, category, summary, steps, reminder, locally_verified, organization_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        title,
        category,
        summary,
        JSON.stringify(steps),
        reminder,
        locally_verified,
        organization_id
      ]
    );

    return this.findById(id);
  },

  // Find guide by ID
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM emergency_guides WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) return null;

    const guide = rows[0];
    guide.steps = JSON.parse(guide.steps);
    
    return guide;
  },

  // Get all guides with filters
  async findAll(filters = {}) {
    let query = 'SELECT * FROM emergency_guides WHERE 1=1';
    const params = [];

    if (filters.category && filters.category !== 'all') {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.verified !== undefined) {
      query += ' AND locally_verified = ?';
      params.push(filters.verified);
    }

    if (filters.search) {
      query += ' AND (title LIKE ? OR summary LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);
    
    return rows.map(guide => ({
      ...guide,
      steps: JSON.parse(guide.steps)
    }));
  },

  // Update guide
  async update(id, updates) {
    const fields = [];
    const values = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at') {
        if (key === 'steps') {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }
    });

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await pool.query(
      `UPDATE emergency_guides SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  },

  // Delete guide
  async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM emergency_guides WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
};
