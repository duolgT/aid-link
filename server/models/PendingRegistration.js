import pool from '../config/db.js';

export class PendingRegistration {
  static async create(data) {
    const { id, name, email, password, sector, verification_code, verification_token, verification_expires } = data;

    const result = await pool.query(
      `INSERT INTO pending_registrations 
       (id, name, email, password, sector, verification_code, verification_token, verification_expires)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [id, name, email, password, sector, verification_code, verification_token, verification_expires]
    );

    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM pending_registrations WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  static async findByEmailAndCode(email, code) {
    const result = await pool.query(
      'SELECT * FROM pending_registrations WHERE email = $1 AND verification_code = $2 AND verification_expires > NOW()',
      [email, code]
    );
    return result.rows[0] || null;
  }

  static async update(email, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    });
    
    values.push(email);
    
    await pool.query(
      `UPDATE pending_registrations SET ${fields.join(', ')} WHERE email = $${paramIndex}`,
      values
    );
  }

  static async delete(email) {
    await pool.query(
      'DELETE FROM pending_registrations WHERE email = $1',
      [email]
    );
  }

  static async deleteExpired() {
    // Clean up expired pending registrations (older than 24 hours)
    await pool.query(
      "DELETE FROM pending_registrations WHERE created_at < NOW() - INTERVAL '24 hours'"
    );
  }
}
