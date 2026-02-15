# 🛍️ E-Commerce Template

A complete, production-ready e-commerce website template built with **Next.js 16** and **Supabase**. Ready to deploy and customize for your business.

## ⚡ Quick Start

**See [QUICK-START.md](QUICK-START.md) for complete setup instructions.**

```bash
# 1. Clone and install
npm install

# 2. Setup (creates bucket, checks database)
npm run setup

# 3. Start development
npm run dev
```

Visit: http://localhost:3000

## ✨ Features

### 🛒 Customer Features
- Product browsing with categories
- Hover effect: 2nd image shows on card hover
- Shopping cart (persists locally)
- User authentication & profiles
- Wishlist (syncs per user)
- Order tracking
- **Review system (only for delivered orders)**
- Responsive design

### 👨‍💼 Admin Panel
- Product management (CRUD)
- Multiple image uploads per product
- Auto-compressed images (saves space)
- Order management & status updates
- **Review management (approve/reject/delete)**
- Dashboard with metrics
- **Protected with admin authentication**

### 🔐 User Account
- Profile management
- Order history
- Personal wishlist
- Secure authentication

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **Supabase** | Backend (Auth, Database, Storage) |
| **Tailwind CSS 4** | Styling |
| **TypeScript** | Type safety |
| **Zustand** | State management |

## 📦 What's Included

- ✅ Complete database schema
- ✅ Image upload with auto-compression
- ✅ **Product card hover effect** (shows 2nd image)
- ✅ User authentication system
- ✅ Admin panel
- ✅ **Review system with moderation**
- ✅ Responsive UI components
- ✅ Order management
- ✅ Wishlist functionality
- ✅ Sample products

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## 📁 Project Structure

```
├── app/                    # Next.js pages
│   ├── admin/             # Admin panel
│   ├── my-account/        # User profile
│   ├── my-orders/         # Order history
│   ├── products/[id]/     # Product details
│   ├── checkout/          # Checkout page
│   └── wishlist/          # Wishlist page
├── components/            # Reusable components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   ├── ImageUpload.tsx
│   └── ...
├── lib/                   # Utilities
│   ├── supabase.ts       # Supabase client
│   ├── store.ts          # Cart state
│   └── wishlist.ts       # Wishlist state
├── scripts/
│   └── setup-complete.js  # Setup automation
└── setup-database-complete.sql  # Database schema

```

## 🔧 Configuration

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Database Setup

Run `setup-database-complete.sql` in Supabase SQL Editor

### Storage Setup

Create bucket named `product-images` (public) in Supabase Dashboard

## 📸 Image Management

- **Auto-compression**: Images resized to 1200px max width
- **Storage**: Supabase Storage (1GB free tier)
- **Capacity**: ~5,000 images on free tier
- **Multiple images per product**: 
  - Main image: Shows in product cards
  - Additional images: Used for hover effect and product detail carousel

## 🔄 Reusing This Template

1. **Create new Supabase project**
2. **Update `.env.local`** with new credentials
3. **Run setup**:
   ```bash
   npm install
   npm run setup
   ```
4. **Run SQL** from `setup-database-complete.sql` in Supabase SQL Editor
5. **Create storage bucket** (if script fails): 
   - Dashboard → Storage → New bucket
   - Name: `product-images` 
   - Public: ✅
7. **Setup admin access**:
   - Sign up at your site
   - Get user ID from Supabase Dashboard → Authentication → Users
   - Run in SQL Editor (replace YOUR_USER_ID):
     ```sql
     UPDATE auth.users 
     SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": true}'::jsonb
     WHERE id = 'YOUR_USER_ID';
     ```
   - Sign out and back in
8. **Add products via admin panel** (http://localhost:3000/admin):
   - Upload main image 
   - Add additional images for hover effect (optional)
9. **Deploy to Vercel** with environment variables

## 🆘 Common Issues
Admin panel redirects to homepage"**
- Set up admin access (see step 5 in "Reusing This Template")
- Make sure you're signed in with the admin account

**"
**"Bucket not found"**
- Create `product-images` bucket in Supabase Dashboard (Storage section)

**"Table does not exist"**
- Run `setup-database-complete.sql` in Supabase SQL Editor

**Orders not showing in "My Orders"**
- Ensure user email matches order email

## 📚 Documentation

- [QUICK-START.md](QUICK-START.md) - Complete setup guide
- [ADMIN-SETUP.md](ADMIN-SETUP.md) - How to create admin accounts
- [setup-database-complete.sql](setup-database-complete.sql) - Database schema

## 🤝 Customization

### Review System
- Only verified customers (delivered orders) can write reviews
- All reviews require admin approval before showing
- Admins can approve, reject, or delete reviews
- Star ratings and optional comments
- Automatic review aggregation on product pages

### Branding
- Update logo/colors in components
- Modify Tailwind config for theme

### Payment Integration
- Add Stripe/PayPal in checkout page
- Integrate with order creation

### Email Notifications
- Configure Supabase email templates
- Add order confirmation emails

## 📄 License

Free to use for personal and commercial projects.

---

**Built with ❤️ using Next.js and Supabase**
