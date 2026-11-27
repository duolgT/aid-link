-- Add email verification fields to organizations table

ALTER TABLE organizations 
ADD COLUMN is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN verification_token VARCHAR(255) DEFAULT NULL,
ADD COLUMN verification_token_expires DATETIME DEFAULT NULL;

-- Add index for faster verification lookups
CREATE INDEX idx_verification_token ON organizations(verification_token);
