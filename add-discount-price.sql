-- ============================================
-- ADD DISCOUNT PRICE FEATURE TO PRODUCTS
-- Run this in Supabase SQL Editor
-- ============================================

-- Add discount_price column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS discount_price DECIMAL(10, 2) DEFAULT NULL;

-- Add comment to document the column
COMMENT ON COLUMN products.discount_price IS 'Discounted/Sale price (optional). If set, this will be displayed instead of regular price.';

-- Ensure discount_price is less than regular price (optional constraint)
-- ALTER TABLE products 
-- ADD CONSTRAINT check_discount_price 
-- CHECK (discount_price IS NULL OR discount_price < price);
