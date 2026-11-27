-- Add verification code column to organizations table

ALTER TABLE organizations 
ADD COLUMN verification_code VARCHAR(6) DEFAULT NULL;

-- Add index for faster code lookups
CREATE INDEX idx_verification_code ON organizations(verification_code);
