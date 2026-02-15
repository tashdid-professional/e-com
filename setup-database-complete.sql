-- ============================================
-- COMPLETE E-COMMERCE DATABASE SETUP
-- Run this ONCE in Supabase SQL Editor
-- ============================================

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  category TEXT,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);

-- Create product_images table (for multiple images per product)
CREATE TABLE IF NOT EXISTS product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id, order_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_order ON product_images(product_id, display_order);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean reinstall)
DROP POLICY IF EXISTS "Allow public read access to products" ON products;
DROP POLICY IF EXISTS "Allow public insert access to products" ON products;
DROP POLICY IF EXISTS "Allow public update access to products" ON products;
DROP POLICY IF EXISTS "Allow public delete access to products" ON products;
DROP POLICY IF EXISTS "Allow public insert access to orders" ON orders;
DROP POLICY IF EXISTS "Allow public read access to orders" ON orders;
DROP POLICY IF EXISTS "Allow public update access to orders" ON orders;
DROP POLICY IF EXISTS "Allow public insert access to order_items" ON order_items;
DROP POLICY IF EXISTS "Allow public read access to order_items" ON order_items;
DROP POLICY IF EXISTS "Allow public read access to product_images" ON product_images;
DROP POLICY IF EXISTS "Allow public insert access to product_images" ON product_images;
DROP POLICY IF EXISTS "Allow public update access to product_images" ON product_images;
DROP POLICY IF EXISTS "Allow public delete access to product_images" ON product_images;
DROP POLICY IF EXISTS "Users can view their own wishlist" ON wishlists;
DROP POLICY IF EXISTS "Users can add to their wishlist" ON wishlists;
DROP POLICY IF EXISTS "Users can remove from their wishlist" ON wishlists;

-- Create policies for products (full CRUD access)
CREATE POLICY "Allow public read access to products"
  ON products FOR SELECT USING (true);
  
CREATE POLICY "Allow public insert access to products"
  ON products FOR INSERT WITH CHECK (true);
  
CREATE POLICY "Allow public update access to products"
  ON products FOR UPDATE USING (true);
  
CREATE POLICY "Allow public delete access to products"
  ON products FOR DELETE USING (true);

-- Create policies for orders
CREATE POLICY "Allow public insert access to orders"
  ON orders FOR INSERT WITH CHECK (true);
  
CREATE POLICY "Allow public read access to orders"
  ON orders FOR SELECT USING (true);
  
CREATE POLICY "Allow public update access to orders"
  ON orders FOR UPDATE USING (true);

-- Create policies for order_items
CREATE POLICY "Allow public insert access to order_items"
  ON order_items FOR INSERT WITH CHECK (true);
  
CREATE POLICY "Allow public read access to order_items"
  ON order_items FOR SELECT USING (true);

-- Create policies for product_images
CREATE POLICY "Allow public read access to product_images"
  ON product_images FOR SELECT USING (true);
  
CREATE POLICY "Allow public insert access to product_images"
  ON product_images FOR INSERT WITH CHECK (true);
  
CREATE POLICY "Allow public update access to product_images"
  ON product_images FOR UPDATE USING (true);
  
CREATE POLICY "Allow public delete access to product_images"
  ON product_images FOR DELETE USING (true);

-- Create policies for wishlists
CREATE POLICY "Users can view their own wishlist"
  ON wishlists FOR SELECT USING (true);
  
CREATE POLICY "Users can add to their wishlist"
  ON wishlists FOR INSERT WITH CHECK (true);
  
CREATE POLICY "Users can remove from their wishlist"
  ON wishlists FOR DELETE USING (true);

-- Create policies for reviews
CREATE POLICY "Allow public read approved reviews"
  ON reviews FOR SELECT USING (status = 'approved');
  
CREATE POLICY "Allow public insert reviews"
  ON reviews FOR INSERT WITH CHECK (true);
  
CREATE POLICY "Allow public read own reviews"
  ON reviews FOR SELECT USING (true);
  
CREATE POLICY "Allow public update reviews"
  ON reviews FOR UPDATE USING (true);
  
CREATE POLICY "Allow public delete reviews"
  ON reviews FOR DELETE USING (true);

-- Insert sample products (optional - remove if you don't want sample data)
INSERT INTO products (name, description, price, image_url, category, stock) VALUES
  ('Minimal Watch', 'Elegant minimalist watch with leather strap', 199.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 'Watches', 25),
  ('Wireless Headphones', 'Premium noise-canceling headphones', 299.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 'Electronics', 15),
  ('Leather Wallet', 'Handcrafted genuine leather wallet', 79.99, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400', 'Accessories', 40),
  ('Sunglasses', 'Classic polarized sunglasses', 149.99, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400', 'Accessories', 30),
  ('Backpack', 'Minimalist everyday backpack', 89.99, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 'Bags', 20),
  ('Sneakers', 'Comfortable minimalist sneakers', 129.99, 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400', 'Footwear', 35)
ON CONFLICT DO NOTHING;

-- ============================================
-- ADMIN USER SETUP
-- ============================================
-- After database setup, create admin user:
-- 
-- STEP 1: Sign up at your website (creates regular user account)
-- STEP 2: Find user ID in Supabase Dashboard → Authentication → Users
-- STEP 3: Run this SQL (replace YOUR_USER_ID):
--
-- UPDATE auth.users 
-- SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": true}'::jsonb
-- WHERE id = 'YOUR_USER_ID';
--
-- STEP 4: Sign out and back in
-- STEP 5: Access admin panel at /admin
--
-- Debug: Visit /debug-auth to verify admin status
