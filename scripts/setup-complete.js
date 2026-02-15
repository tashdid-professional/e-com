require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupComplete() {
  console.log('🚀 Starting complete e-commerce setup...\n');

  try {
    // 1. Create storage bucket
    console.log('📦 Checking storage bucket...');
    try {
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.log('⚠️  Cannot access storage (needs manual setup)');
        console.log('   Go to: Supabase Dashboard → Storage → New bucket');
        console.log('   Name: product-images');
        console.log('   Public: ✅ checked\n');
      } else {
        const bucketExists = buckets?.some(b => b.id === 'product-images');
        
        if (!bucketExists) {
          console.log('⚠️  Storage bucket "product-images" not found');
          console.log('   Creating bucket...');
          
          const { data, error } = await supabase.storage.createBucket('product-images', {
            public: true,
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: ['image/*']
          });
          
          if (error) {
            console.log('⚠️  Auto-creation failed (manual setup required)');
            console.log('   Go to: Supabase Dashboard → Storage → New bucket');
            console.log('   Name: product-images');
            console.log('   Public: ✅ checked\n');
          } else {
            console.log('✅ Storage bucket created successfully\n');
          }
        } else {
          console.log('✅ Storage bucket exists\n');
        }
      }
    } catch (storageError) {
      console.log('⚠️  Storage check failed (will need manual setup)');
      console.log('   Create bucket "product-images" in Supabase Dashboard\n');
    }

    // 2. Run SQL for database tables and policies
    console.log('\n📊 Checking database tables...');
    
    // Check if tables exist by trying to query them
    let tablesExist = true;
    const tablesToCheck = ['products', 'orders', 'order_items', 'product_images', 'wishlists'];
    
    for (const table of tablesToCheck) {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (error && error.message.includes('does not exist')) {
        tablesExist = false;
        break;
      }
    }
    
    if (!tablesExist) {
      console.log('⚠️  Database tables not found');
      console.log('\n📝 Please run this SQL in Supabase SQL Editor:');
      console.log('   File: database-setup.sql');
      console.log('   Also run: database-product-images.sql');
      console.log('   And: database-products-policies.sql');
      console.log('\n   OR copy and run this complete SQL:\n');
      
      // Read and display the combined SQL
      const sqlFiles = [
        'database-setup.sql',
        'database-product-images.sql', 
        'database-products-policies.sql',
        'database-wishlist-update.sql'
      ];
      
      console.log('----------------------------------------');
      for (const sqlFile of sqlFiles) {
        const sqlPath = path.join(__dirname, '..', sqlFile);
        if (fs.existsSync(sqlPath)) {
          const sql = fs.readFileSync(sqlPath, 'utf8');
          console.log(`\n-- From ${sqlFile}`);
          console.log(sql);
        }
      }
      console.log('----------------------------------------\n');
      
      console.log('After running the SQL, run this script again: npm run setup\n');
      process.exit(0);
    } else {
      console.log('✅ All database tables exist');
    }

    // 3. Insert sample products (only if products table is empty)
    console.log('\n🛍️  Checking for sample products...');
    const { data: existingProducts } = await supabase.from('products').select('id');
    
    if (!existingProducts || existingProducts.length === 0) {
      console.log('📝 Inserting sample products...');
      const sampleProducts = [
        { name: 'Minimal Watch', description: 'Elegant minimalist watch with leather strap', price: 199.99, image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', category: 'Watches', stock: 25 },
        { name: 'Wireless Headphones', description: 'Premium noise-canceling headphones', price: 299.99, image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', category: 'Electronics', stock: 15 },
        { name: 'Leather Wallet', description: 'Handcrafted genuine leather wallet', price: 79.99, image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400', category: 'Accessories', stock: 40 },
        { name: 'Sunglasses', description: 'Classic polarized sunglasses', price: 149.99, image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400', category: 'Accessories', stock: 30 },
        { name: 'Backpack', description: 'Minimalist everyday backpack', price: 89.99, image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', category: 'Bags', stock: 20 },
        { name: 'Sneakers', description: 'Comfortable minimalist sneakers', price: 129.99, image_url: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400', category: 'Footwear', stock: 35 }
      ];
      
      const { error: insertError } = await supabase.from('products').insert(sampleProducts);
      if (insertError) {
        console.warn('⚠️  Could not insert sample products:', insertError.message);
      } else {
        console.log('✅ Sample products inserted');
      }
    } else {
      console.log('✅ Products already exist, skipping sample data');
    }

    console.log('\n🎉 Setup check complete!\n');
    console.log('📋 Next steps:');
    console.log('   1. Ensure storage bucket exists (see above)');
    console.log('   2. Run database SQL if tables are missing');
    console.log('   3. Run: npm run dev');
    console.log('   4. Visit: http://localhost:3000');
    console.log('   5. Admin panel: http://localhost:3000/admin\n');

  } catch (error) {
    console.error('\n❌ Setup check failed:', error.message);
    console.error('\n📝 Please complete setup manually:');
    console.error('   1. Create storage bucket "product-images" in Supabase Dashboard');
    console.error('   2. Run setup-database-complete.sql in Supabase SQL Editor');
    console.error('   3. See QUICK-START.md for detailed instructions\n');
  }
}

setupComplete();
