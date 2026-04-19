-- Admin Settings Table Migration
-- Run this in your Supabase SQL Editor to set up the admin settings table

CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  show_admin_login BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add comments for clarity
COMMENT ON TABLE admin_settings IS 'Stores global admin panel settings including visibility of admin login to public';
COMMENT ON COLUMN admin_settings.show_admin_login IS 'Controls whether the admin login option is visible in the navbar to public users';

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_settings_id ON admin_settings(id);

-- Insert default settings (only run once)
INSERT INTO admin_settings (show_admin_login) 
VALUES (true)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS) for security
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (optional, for clean setup)
DROP POLICY IF EXISTS "Allow public read access" ON admin_settings;
DROP POLICY IF EXISTS "Allow admins to update settings" ON admin_settings;

-- Policy: Anyone can read admin settings (needed to check visibility)
CREATE POLICY "Allow public read access on admin_settings"
  ON admin_settings
  FOR SELECT
  USING (true);

-- Policy: Only admins can insert settings
CREATE POLICY "Allow admins to insert settings"
  ON admin_settings
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Policy: Only admins can update settings
CREATE POLICY "Allow admins to update settings"
  ON admin_settings
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Policy: Only admins can delete settings
CREATE POLICY "Allow admins to delete settings"
  ON admin_settings
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Grant permissions
GRANT SELECT ON admin_settings TO authenticated;
GRANT SELECT ON admin_settings TO anon;
GRANT ALL ON admin_settings TO authenticated;
