-- Migration: Add password reset functionality
-- Description: Add fields to organizations table for password reset with codes

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS reset_code VARCHAR(6),
ADD COLUMN IF NOT EXISTS reset_code_expires DATETIME,
ADD INDEX idx_reset_code (reset_code);
