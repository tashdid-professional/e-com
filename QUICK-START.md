# 🚀 Quick Start Guide - E-Commerce Template

## One-Time Setup (5 minutes)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Wait for database to provision (~2 minutes)

### 2. Get Credentials
1. In Supabase Dashboard → **Settings** → **API**
2. Copy:
   - **Project URL**
   - **anon/public key**

### 3. Configure Environment
1. Create `.env.local` file in project root:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Run Setup Script
```bash
npm run setup
```

This will:
- ✅ Create storage bucket for images
- ✅ Check database status
- ✅ Show SQL to run if needed

### 6. Setup Database (REQUIRED)

The setup script will display SQL. Copy it and:

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Paste the SQL (or use `setup-database-complete.sql` file)
4. Click **Run**

**OR** manually run `setup-database-complete.sql`:
- Open file in editor
- Copy all contents
- Paste in Supabase SQL Editor
- Run

### 7. Create Storage Bucket (if not auto-created)

The script attempts to create it. If it fails:

1. Supabase Dashboard → **Storage**
2. Click **New bucket**
3. Name: `product-images`
4. ✅ Check **Public bucket**
5. Click **Create**

### 8. Start Development
```bash
npm run dev
```

Visit: http://localhost:3000

## 🔐 Setup Admin Access

To access admin panel at http://localhost:3000/admin:

1. **Sign up** at your website
2. **Get your user ID**:
   - Supabase Dashboard → **Authentication** → **Users**
   - Copy your user's ID (e.g., `54ecaf28-c350-49d5-...`)
3. **Run SQL** in Supabase SQL Editor (replace `YOUR_USER_ID`):
   ```sql
   UPDATE auth.users 
   SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": true}'::jsonb
   WHERE id = 'YOUR_USER_ID';
   ```
4. **Sign out and sign back in**
5. Now access http://localhost:3000/admin

**Tip**: Visit http://localhost:3000/debug-auth to verify your admin status

## 🎮 Admin Panel

Features:
- Product management (CRUD)
- Order management
- Image uploads (auto-compressed)

## 📱 User Features

- Product browsing & search
- Shopping cart (persists in localStorage)
- User authentication (Supabase Auth)
- Wishlist (per user, syncs with database)
- Order tracking
- User profile management

## 🔐 Authentication Setup (Optional)

To enable user signup/login:

1. Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional)
4. Disable email confirmation for testing:
   - **Settings** → **Email Auth** → Uncheck "Enable email confirmations"

## 📦 Deployment to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## 🔄 Reusing This Template

When starting a new project:

1. Copy entire project folder
2. Delete `.next`, `node_modules`, `.env.local`
3. Follow steps 1-8 above with new Supabase project
4. Done! Fresh e-commerce site ready

## ⚙️ Configuration

### Storage Limits
- **Free Tier**: 1GB (~ 5,000 compressed images)
- Images auto-compressed to ~200KB each
- Database URLs only (minimal space)

### Database Structure
- **products**: Main product catalog
- **orders**: Customer orders
- **order_items**: Order line items
- **product_images**: Multiple images per product
- **wishlists**: User wishlist items

##Admin panel redirects to homepage:**
- Complete admin access setup (step above)
- Make sure you're signed in with admin account
- Try signing out and back in

** 🆘 Troubleshooting

**"Bucket not found" error:**
- Create storage bucket manually (step 7)

**"Table does not exist" error:**
- Run database SQL (step 6)

**Images not uploading:**
- Check storage bucket exists and is public
- Verify bucket name is `product-images`

**Orders not showing in "My Orders":**
- Make sure user is logged in
- Check email matches order email

## 📚 Documentation Files

- `README.md` - Full project documentation
- `SETUP.md` - Detailed setup instructions
- `IMAGE-UPLOAD-SETUP.md` - Image system details
- `setup-database-complete.sql` - One-file database setup

## 🎯 Next Steps

1. Customize branding (logo, colors in Tailwind config)
2. Add more products via admin panel
3. Configure email templates in Supabase
4. Set up custom domain in Vercel
5. Add payment integration (Stripe, etc.)

---

**Ready in 5 minutes! 🚀**
