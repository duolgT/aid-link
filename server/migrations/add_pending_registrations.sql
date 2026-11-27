-- Migration: Add pending_registrations table
-- Description: Store temporary registration data until email is verified

CREATE TABLE IF NOT EXISTS pending_registrations (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  sector VARCHAR(100) NOT NULL,
  verification_code VARCHAR(6) NOT NULL,
  verification_token VARCHAR(255),
  verification_expires DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_verification_code (verification_code),
  INDEX idx_expires (verification_expires)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
