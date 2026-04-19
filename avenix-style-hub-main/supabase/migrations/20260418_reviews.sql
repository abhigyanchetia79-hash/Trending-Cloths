-- Reviews Table Migration
-- Run this in your Supabase SQL Editor to set up the reviews table

CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name VARCHAR(255),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  image_urls TEXT[] DEFAULT '{}',
  is_verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add comments for clarity
COMMENT ON TABLE reviews IS 'Stores customer reviews for products with ratings and images';
COMMENT ON COLUMN reviews.product_id IS 'Reference to the product being reviewed';
COMMENT ON COLUMN reviews.user_id IS 'Reference to the user who submitted the review';
COMMENT ON COLUMN reviews.user_name IS 'Name of the reviewer (denormalized for display)';
COMMENT ON COLUMN reviews.rating IS 'Star rating from 1 to 5';
COMMENT ON COLUMN reviews.review_text IS 'Customer review text';
COMMENT ON COLUMN reviews.image_urls IS 'Array of URLs to uploaded review images';
COMMENT ON COLUMN reviews.is_verified_purchase IS 'Whether the review is from a verified buyer';

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Enable Row Level Security (RLS) for security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read reviews" ON reviews;
DROP POLICY IF EXISTS "Allow users to insert own reviews" ON reviews;
DROP POLICY IF EXISTS "Allow users to update own reviews" ON reviews;
DROP POLICY IF EXISTS "Allow users to delete own reviews" ON reviews;
DROP POLICY IF EXISTS "Allow admins to delete reviews" ON reviews;

-- Policy: Anyone can read reviews (public)
CREATE POLICY "Allow public read reviews"
  ON reviews
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert reviews
CREATE POLICY "Allow users to insert own reviews"
  ON reviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own reviews
CREATE POLICY "Allow users to update own reviews"
  ON reviews
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own reviews
CREATE POLICY "Allow users to delete own reviews"
  ON reviews
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Only admins can delete any review
CREATE POLICY "Allow admins to delete reviews"
  ON reviews
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Create a view for getting average ratings
CREATE OR REPLACE VIEW product_ratings AS
SELECT 
  p.id,
  ROUND(AVG(r.rating)::numeric, 2) as avg_rating,
  COUNT(r.id) as review_count
FROM products p
LEFT JOIN reviews r ON p.id = r.product_id
GROUP BY p.id;
