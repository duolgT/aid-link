import pool from '../config/db.js';

export const Organization = {
  // Raw query method for custom queries
  async query(sql, params) {
    return await pool.query(sql, params);
  },

  // Create new organization
  async create(orgData) {
    const { id, name, email, password, sector, is_verified, verification_token, verification_token_expires } = orgData;
    const [result] = await pool.query(
      `INSERT INTO organizations 
       (id, name, email, password, sector, is_verified, verification_token, verification_token_expires) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, email, password, sector, is_verified || false, verification_token || null, verification_token_expires || null]
    );
    return this.findById(id);
  },

  // Find organization by email
  async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM organizations WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },

  // Find organization by ID
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM organizations WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  // Get all organizations (without passwords)
  async findAll() {
    const [rows] = await pool.query(
      'SELECT id, name, email, sector, verified, created_at FROM organizations ORDER BY name'
    );
    return rows;
  },

  // Update organization
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
      `UPDATE organizations SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  },

  // Delete organization
  async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM organizations WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
};
