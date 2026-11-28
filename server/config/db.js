import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL database connected successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    return false;
  }
}

// Initialize database tables
export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Create organizations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        sector VARCHAR(100) NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        reset_code VARCHAR(6),
        reset_code_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_organizations_email ON organizations(email);
      CREATE INDEX IF NOT EXISTS idx_organizations_reset_code ON organizations(reset_code);
    `);

    // Create pending_registrations table (new accounts await email verification here)
    await client.query(`
      CREATE TABLE IF NOT EXISTS pending_registrations (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        sector VARCHAR(100) NOT NULL,
        verification_code VARCHAR(6) NOT NULL,
        verification_token VARCHAR(255),
        verification_expires TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_pending_email ON pending_registrations(email);
      CREATE INDEX IF NOT EXISTS idx_pending_code ON pending_registrations(verification_code);
      CREATE INDEX IF NOT EXISTS idx_pending_expires ON pending_registrations(verification_expires);
    `);

    // Create reports table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id VARCHAR(36) PRIMARY KEY,
        category VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        area VARCHAR(255),
        description TEXT NOT NULL,
        organization_id VARCHAR(36) NOT NULL,
        urgency VARCHAR(10) DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
        is_anonymous BOOLEAN DEFAULT TRUE,
        synced BOOLEAN DEFAULT TRUE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
      );
      
      CREATE INDEX IF NOT EXISTS idx_reports_organization ON reports(organization_id);
      CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
      CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category);
      CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at);
    `);

    // Create services table
    await client.query(`
      CREATE TABLE IF NOT EXISTS services (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        area VARCHAR(255),
        description TEXT NOT NULL,
        services_offered JSONB NOT NULL,
        coordinates JSONB,
        phone VARCHAR(50),
        verified BOOLEAN DEFAULT FALSE,
        is_demo BOOLEAN DEFAULT FALSE,
        organization_id VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
      CREATE INDEX IF NOT EXISTS idx_services_verified ON services(verified);
      CREATE INDEX IF NOT EXISTS idx_services_organization ON services(organization_id);
    `);

    // Create emergency_guides table
    await client.query(`
      CREATE TABLE IF NOT EXISTS emergency_guides (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        summary TEXT NOT NULL,
        steps JSONB NOT NULL,
        reminder TEXT,
        locally_verified BOOLEAN DEFAULT FALSE,
        organization_id VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_guides_category ON emergency_guides(category);
      CREATE INDEX IF NOT EXISTS idx_guides_verified ON emergency_guides(locally_verified);
    `);

    console.log('✅ Database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

export default pool;
