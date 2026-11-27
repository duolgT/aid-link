import pool from '../config/db.js';

export const Service = {
  // Create new service
  async create(serviceData) {
    const {
      id,
      name,
      category,
      area,
      description,
      services_offered,
      coordinates = null,
      phone = null,
      verified = false,
      is_demo = false,
      organization_id = null
    } = serviceData;

    const [result] = await pool.query(
      `INSERT INTO services 
       (id, name, category, area, description, services_offered, coordinates, phone, verified, is_demo, organization_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        category,
        area,
        description,
        JSON.stringify(services_offered),
        coordinates ? JSON.stringify(coordinates) : null,
        phone,
        verified,
        is_demo,
        organization_id
      ]
    );

    return this.findById(id);
  },

  // Find service by ID
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM services WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) return null;

    const service = rows[0];
    service.services_offered = JSON.parse(service.services_offered);
    if (service.coordinates) {
      service.coordinates = JSON.parse(service.coordinates);
    }
    
    return service;
  },

  // Get all services with filters
  async findAll(filters = {}) {
    let query = 'SELECT * FROM services WHERE 1=1';
    const params = [];

    if (filters.category && filters.category !== 'all') {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.area) {
      query += ' AND area LIKE ?';
      params.push(`%${filters.area}%`);
    }

    if (filters.verified !== undefined) {
      query += ' AND verified = ?';
      params.push(filters.verified);
    }

    if (filters.search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);
    
    return rows.map(service => ({
      ...service,
      services_offered: JSON.parse(service.services_offered),
      coordinates: service.coordinates ? JSON.parse(service.coordinates) : null
    }));
  },

  // Update service
  async update(id, updates) {
    const fields = [];
    const values = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at') {
        if (key === 'services_offered' || key === 'coordinates') {
          fields.push(`${key} = ?`);
          values.push(value ? JSON.stringify(value) : null);
        } else {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }
    });

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await pool.query(
      `UPDATE services SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  },

  // Delete service
  async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM services WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
};
