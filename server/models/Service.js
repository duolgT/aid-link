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

    const result = await pool.query(
      `INSERT INTO services 
       (id, name, category, area, description, services_offered, coordinates, phone, verified, is_demo, organization_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
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

    const service = result.rows[0];
    service.services_offered = JSON.parse(service.services_offered);
    if (service.coordinates) {
      service.coordinates = JSON.parse(service.coordinates);
    }
    
    return service;
  },

  // Find service by ID
  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM services WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) return null;

    const service = result.rows[0];
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
    let paramIndex = 1;

    if (filters.category && filters.category !== 'all') {
      query += ` AND category = $${paramIndex}`;
      params.push(filters.category);
      paramIndex++;
    }

    if (filters.area) {
      query += ` AND area ILIKE $${paramIndex}`;
      params.push(`%${filters.area}%`);
      paramIndex++;
    }

    if (filters.verified !== undefined) {
      query += ` AND verified = $${paramIndex}`;
      params.push(filters.verified);
      paramIndex++;
    }

    if (filters.search) {
      query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex + 1})`;
      params.push(`%${filters.search}%`, `%${filters.search}%`);
      paramIndex += 2;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    
    return result.rows.map(service => ({
      ...service,
      services_offered: JSON.parse(service.services_offered),
      coordinates: service.coordinates ? JSON.parse(service.coordinates) : null
    }));
  },

  // Update service
  async update(id, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at') {
        if (key === 'services_offered' || key === 'coordinates') {
          fields.push(`${key} = $${paramIndex}`);
          values.push(value ? JSON.stringify(value) : null);
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
      `UPDATE services SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    const service = result.rows[0];
    service.services_offered = JSON.parse(service.services_offered);
    if (service.coordinates) {
      service.coordinates = JSON.parse(service.coordinates);
    }
    
    return service;
  },

  // Delete service
  async delete(id) {
    const result = await pool.query(
      'DELETE FROM services WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  }
};
