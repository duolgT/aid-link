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

    const result = await pool.query(
      `INSERT INTO emergency_guides 
       (id, title, category, summary, steps, reminder, locally_verified, organization_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
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

    const guide = result.rows[0];
    guide.steps = JSON.parse(guide.steps);
    
    return guide;
  },

  // Find guide by ID
  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM emergency_guides WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) return null;

    const guide = result.rows[0];
    guide.steps = JSON.parse(guide.steps);
    
    return guide;
  },

  // Get all guides with filters
  async findAll(filters = {}) {
    let query = 'SELECT * FROM emergency_guides WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.category && filters.category !== 'all') {
      query += ` AND category = $${paramIndex}`;
      params.push(filters.category);
      paramIndex++;
    }

    if (filters.verified !== undefined) {
      query += ` AND locally_verified = $${paramIndex}`;
      params.push(filters.verified);
      paramIndex++;
    }

    if (filters.search) {
      query += ` AND (title ILIKE $${paramIndex} OR summary ILIKE $${paramIndex + 1})`;
      params.push(`%${filters.search}%`, `%${filters.search}%`);
      paramIndex += 2;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    
    return result.rows.map(guide => ({
      ...guide,
      steps: JSON.parse(guide.steps)
    }));
  },

  // Update guide
  async update(id, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at') {
        if (key === 'steps') {
          fields.push(`${key} = $${paramIndex}`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${key} = $${paramIndex}`);
          values.push(value);
        }
        paramIndex++;
      }
    });

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const result = await pool.query(
      `UPDATE emergency_guides SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    const guide = result.rows[0];
    guide.steps = JSON.parse(guide.steps);
    
    return guide;
  },

  // Delete guide
  async delete(id) {
    const result = await pool.query(
      'DELETE FROM emergency_guides WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  }
};
