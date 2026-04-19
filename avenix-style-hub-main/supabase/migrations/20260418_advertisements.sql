-- Advertisements Table Migration
-- Run this in your Supabase SQL Editor to set up the advertisements table

CREATE TABLE IF NOT EXISTS advertisements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  video_url TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add comments for clarity
COMMENT ON TABLE advertisements IS 'Stores advertisement video/image content for homepage display';
COMMENT ON COLUMN advertisements.title IS 'Advertisement title (e.g., Exclusive Offers)';
COMMENT ON COLUMN advertisements.description IS 'Advertisement description or tagline';
COMMENT ON COLUMN advertisements.video_url IS 'URL to the advertisement video file';
COMMENT ON COLUMN advertisements.image_url IS 'URL to fallback image';
COMMENT ON COLUMN advertisements.is_active IS 'Whether the advertisement should be displayed';

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_advertisements_is_active ON advertisements(is_active);
CREATE INDEX IF NOT EXISTS idx_advertisements_created_at ON advertisements(created_at DESC);

-- Enable Row Level Security (RLS) for security
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (optional, for clean setup)
DROP POLICY IF EXISTS "Allow public read active advertisements" ON advertisements;
DROP POLICY IF EXISTS "Allow admins to manage advertisements" ON advertisements;

-- Policy: Anyone can read active advertisements
CREATE POLICY "Allow public read active advertisements"
  ON advertisements
  FOR SELECT
  USING (is_active = true);

-- Policy: Anyone can read all advertisements (for admin)
CREATE POLICY "Allow admins to read all advertisements"
  ON advertisements
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Policy: Only admins can insert advertisements
CREATE POLICY "Allow admins to insert advertisements"
  ON advertisements
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Policy: Only admins can update advertisements
CREATE POLICY "Allow admins to update advertisements"
  ON advertisements
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Policy: Only admins can delete advertisements
CREATE POLICY "Allow admins to delete advertisements"
  ON advertisements
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Insert a default advertisement (optional)
INSERT INTO advertisements (title, description, is_active)
VALUES ('Limited Time Offers', 'Exclusive deals on premium fashion', true)
ON CONFLICT DO NOTHING;
