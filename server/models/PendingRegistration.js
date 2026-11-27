import pool from '../config/db.js';

export class PendingRegistration {
  static async create(data) {
    const { id, name, email, password, sector, verification_code, verification_token, verification_expires } = data;

    const [result] = await pool.execute(
      `INSERT INTO pending_registrations 
       (id, name, email, password, sector, verification_code, verification_token, verification_expires)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, email, password, sector, verification_code, verification_token, verification_expires]
    );

    return { id, name, email, sector, verification_code, verification_expires };
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM pending_registrations WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  }

  static async findByEmailAndCode(email, code) {
    const [rows] = await pool.execute(
      'SELECT * FROM pending_registrations WHERE email = ? AND verification_code = ? AND verification_expires > NOW()',
      [email, code]
    );
    return rows[0] || null;
  }

  static async update(email, updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    await pool.execute(
      `UPDATE pending_registrations SET ${setClause} WHERE email = ?`,
      [...values, email]
    );
  }

  static async delete(email) {
    await pool.execute(
      'DELETE FROM pending_registrations WHERE email = ?',
      [email]
    );
  }

  static async deleteExpired() {
    // Clean up expired pending registrations (older than 24 hours)
    await pool.execute(
      'DELETE FROM pending_registrations WHERE created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)'
    );
  }
}
