import pool from '../config/db.js';

export const Organization = {
  // Raw query method for custom queries
  async query(sql, params) {
    const result = await pool.query(sql, params);
    return result;
  },

  // Create new organization
  async create(orgData) {
    const { id, name, email, password, sector, verified } = orgData;
    const result = await pool.query(
      `INSERT INTO organizations 
       (id, name, email, password, sector, verified) 
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, name, email, password, sector, verified || false]
    );
    return result.rows[0];
  },

  // Find organization by email
  async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM organizations WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  },

  // Find organization by ID
  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM organizations WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  // Get all organizations (without passwords)
  async findAll() {
    const result = await pool.query(
      'SELECT id, name, email, sector, verified, created_at FROM organizations ORDER BY name'
    );
    return result.rows;
  },

  // Update organization
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
      `UPDATE organizations SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows[0];
  },

  // Delete organization
  async delete(id) {
    const result = await pool.query(
      'DELETE FROM organizations WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  },

  // Find by reset code
  async findByResetCode(resetCode) {
    const result = await pool.query(
      'SELECT * FROM organizations WHERE reset_code = $1 AND reset_code_expires > NOW()',
      [resetCode]
    );
    return result.rows[0] || null;
  }
};
