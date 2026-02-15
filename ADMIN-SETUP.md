# 🔐 Admin Setup Guide

## Quick Steps

When reusing this template, follow these steps to create an admin account:

### 1. Sign Up
- Go to your website (http://localhost:3000 or your deployed URL)
- Click "Sign In" → "Sign Up"
- Create an account with any email/password

### 2. Get User ID
- Open Supabase Dashboard
- Navigate to: **Authentication** → **Users**
- Find your newly created account
- Copy the **ID** (looks like: `54ecaf28-c350-49d5-be65-4d3321d7eb28`)

### 3. Run SQL Query
- In Supabase Dashboard, go to: **SQL Editor**
- Click **New Query**
- Paste this (replace `YOUR_USER_ID`):

```sql
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": true}'::jsonb
WHERE id = 'YOUR_USER_ID';
```

- Click **Run**

### 4. Sign Out & Back In
- Go back to your website
- Sign out completely
- Sign in again with the same credentials

### 5. Access Admin Panel
- Visit: http://localhost:3000/admin
- You should now have access!

## Verify Admin Status

Visit http://localhost:3000/debug-auth to check:
- ✅ If you see "You are an admin" → Access granted
- ❌ If you see "You are NOT an admin" → Repeat steps 3-4

## Troubleshooting

**Still can't access admin panel?**
1. Check debug page shows `is_admin: true` in user metadata
2. Make sure you signed out and back in after running SQL
3. Try clearing browser cache/cookies
4. Restart dev server (`Ctrl+C` then `npm run dev`)

**Want multiple admins?**
- Repeat steps 1-4 for each user account
- Each user can be promoted to admin individually

## Security Notes

⚠️ **For Production:**
- This template uses client-side admin checks for simplicity
- Consider implementing server-side middleware for production
- Add role-based permissions if needed
- Store admin emails in a database table for easier management
