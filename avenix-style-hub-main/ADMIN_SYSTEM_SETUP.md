# Secure Admin System - Setup Guide

## 🔐 Overview

Your e-commerce website now includes a secure admin system that:
- ✅ Keeps admin panel within the same website
- ✅ Controls admin login visibility for public
- ✅ Protects admin routes from unauthorized access
- ✅ Stores settings in both localStorage and Supabase database

---

## 📊 Database Setup

### 1. Create `admin_settings` Table in Supabase

Run this SQL migration in your Supabase SQL editor:

```sql
CREATE TABLE admin_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  show_admin_login BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now() ON UPDATE now()
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to view (optional)
CREATE POLICY "Allow public read access" 
  ON admin_settings FOR SELECT 
  USING (true);

-- Create policy to allow only admins to update
CREATE POLICY "Allow admins to update" 
  ON admin_settings FOR UPDATE 
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Insert default settings
INSERT INTO admin_settings (show_admin_login) VALUES (true);
```

### 2. Alternative: Using localStorage Only

If you prefer not to use the database, the system will automatically fall back to localStorage, which works perfectly fine for a single-admin setup.

---

## 🎯 Key Features

### Admin Routes

| Route | Purpose | Access |
|-------|---------|--------|
| `/admin/auth` | Admin Login/Registration | Public (if visibility ON) |
| `/admin` | Admin Dashboard | Admin only |

### Admin Visibility Toggle

**Location:** Admin Panel → Settings → "Admin Login Visibility"

**Effects:**

| Setting | Navbar Shows | Direct URL |
|---------|-------------|-----------|
| **ON** | Admin login link visible to public | ✓ Accessible |
| **OFF** | Admin login hidden from public | ✓ Still accessible via `/admin/auth` |

---

## 🔑 Security Features

### 1. Role-Based Access Control

```typescript
- Admin can access: /admin, /admin/auth
- Customer can only access: customer pages
- Non-authenticated users redirected appropriately
```

### 2. Admin Registration Protection

- Requires **Admin Secret Code**: `TRENDING2026`
- Only users with this code can create admin accounts
- Failed registrations without secret code are rejected

### 3. Route Protection

```typescript
// AdminPage - Only accessible to authenticated admins
if (!user || !isAdmin) return <Navigate to="/" replace />;

// AdminAuthPage - Redirects if already admin
if (isAdmin) return <Navigate to="/admin" replace />;
```

### 4. Visibility Control

- **Public facing**: Admin login link can be toggled on/off
- **Direct access**: Even when hidden, accessible via URL
- **Stored in**: localStorage (immediate) + Supabase (persistent)

---

## 📱 Implementation Details

### Navbar Changes

**Desktop & Mobile:**
- Admin users: ⚔️ Shield icon → Admin Dashboard
- Non-admins (if visible): ⚔️ Shield icon → Admin Login
- Always available: 👤 User icon → Profile/Login

### Admin Panel Settings

**New Settings Tab includes:**
1. **Admin Login Visibility Toggle**
   - Shows current status (Visible/Hidden)
   - Explains what happens when toggled
   - Instant update with toast notification

2. **Payment Settings** (existing)
   - UPI configuration
   - Payment method settings

---

## 🚀 Usage

### For Admin Users:

1. **First Admin Registration:**
   - Navigate to `/admin/auth`
   - Click "Need an admin account?"
   - Enter email, password, full name
   - Enter admin secret code: `TRENDING2026`
   - Click "Create Admin Account"

2. **Admin Login:**
   - Navigate to `/admin/auth` or click Shield icon
   - Enter admin email and password
   - Redirected to Admin Dashboard

3. **Control Public Visibility:**
   - Go to Admin Panel
   - Click "Settings" tab
   - Toggle "Admin Login Visibility"
   - Setting saves automatically

### For Regular Customers:

- If visibility is **ON**: See "Admin Login" option in navbar
- If visibility is **OFF**: Admin login hidden from navbar
- Can still register and login as customer

---

## 📋 API Endpoints Used

```typescript
// Get admin status
supabase.from("user_roles")
  .select("role")
  .eq("user_id", userId)
  .eq("role", "admin")

// Load admin settings
supabase.from("admin_settings")
  .select("show_admin_login")
  .single()

// Update admin settings
supabase.from("admin_settings")
  .update({ show_admin_login: true })
  .eq("id", settingsId)
```

---

## 🔧 Configuration

### Admin Secret Code

**Location:** `src/pages/AdminAuthPage.tsx`

```typescript
const ADMIN_SECRET_CODE = "TRENDING2026";
```

**To change:**
1. Open `AdminAuthPage.tsx`
2. Find `const ADMIN_SECRET_CODE = "TRENDING2026"`
3. Replace with your secret code
4. Restart dev server

### localStorage Keys Used

```typescript
"showAdminLogin" → stores visibility boolean
```

---

## ✅ Testing Checklist

- [ ] Admin can register with secret code
- [ ] Admin can login
- [ ] Admin dashboard loads correctly
- [ ] Settings tab shows visibility toggle
- [ ] Toggle updates immediately
- [ ] Navbar shows admin link for non-admins (if visibility ON)
- [ ] Navbar hides admin link for non-admins (if visibility OFF)
- [ ] Admin can still access `/admin/auth` even when hidden
- [ ] Non-admin cannot access `/admin` (redirects to home)
- [ ] Mobile navbar shows admin link correctly
- [ ] localStorage updates when toggle clicked
- [ ] Supabase database updates settings

---

## 🐛 Troubleshooting

### Admin link not appearing in navbar

**Check:**
1. Are you logged in as admin? Admin users always see it
2. Is `showAdminLogin` set to `true` in settings?
3. Are you viewing as non-authenticated user?
4. Clear browser cache and localStorage

**Reset:**
```javascript
localStorage.removeItem("showAdminLogin");
```

### Can't create admin account

**Verify:**
1. Secret code is exactly: `TRENDING2026`
2. No spaces or extra characters
3. Check browser console for error messages
4. Verify Supabase is connected

### Settings not saving

**Check:**
1. Supabase connection is active
2. `admin_settings` table exists in database
3. Check browser console for database errors
4. localStorage is not disabled

### Admin locked out

**Solution:**
1. Delete from `user_roles` table in Supabase (remove admin role for user)
2. Delete from `auth.users` table (delete authentication user)
3. Re-register as admin with secret code

---

## 📊 Data Structure

### user_roles table
```sql
user_id (UUID) → references auth.users
role (TEXT) → 'admin' or 'customer'
```

### admin_settings table
```sql
id (UUID) → Primary key
show_admin_login (BOOLEAN) → Visibility setting
created_at (TIMESTAMP) → Creation time
updated_at (TIMESTAMP) → Last update time
```

---

## 🔐 Security Notes

- Admin secret code should be kept confidential
- Change the secret code periodically
- Use strong passwords for admin accounts
- Enable Supabase Row Level Security (RLS) for production
- Admin logout clears session immediately
- Direct URL access to `/admin` requires authentication

---

## 🎨 UI/UX Features

### Visibility Toggle Button

Shows current status with icons:
- **Visible** 👁️ - Green button
- **Hidden** 👁️‍🗨️ - Orange button

Includes explanation text below toggle about current setting and what happens when changed.

### Mobile Responsive

- Works on all screen sizes
- Admin link appears in mobile menu when appropriate
- Touch-friendly buttons and toggles
- Proper spacing and readability

---

## 📞 Support

For issues or questions:
1. Check console (F12) for error messages
2. Verify Supabase credentials in `.env`
3. Ensure database migrations are applied
4. Check network requests in DevTools
5. Review this documentation again

---

**Version:** 1.0  
**Last Updated:** April 17, 2026  
**Status:** ✅ Production Ready
