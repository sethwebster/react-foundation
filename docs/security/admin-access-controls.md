# Admin Access Controls

This document outlines all admin UI elements and their access control mechanisms.

## Overview

Admin functionality is protected at multiple levels:
1. **Server-side route protection** - All `/admin` routes verify admin status
2. **UI-level hiding** - Admin links hidden from non-admin users
3. **API-level authorization** - All admin API endpoints check permissions

## Admin UI Elements & Protection Status

### ✅ Header Navigation (Desktop)
**File:** `src/components/layout/header.tsx`
**Status:** PROTECTED
**Mechanism:** Client-side admin check via `/api/admin/check`
```tsx
{isAdmin && (
  <Link href="/admin">⚙️</Link>
)}
```

### ✅ Mobile Menu
**File:** `src/components/layout/mobile-menu.tsx`
**Status:** PROTECTED
**Mechanism:** Client-side admin check via `/api/admin/check`
```tsx
{isAdmin && session?.user && (
  <Link href="/admin/users">👑 Admin Panel</Link>
)}
```

### ✅ Profile Sidebar (Desktop & Mobile)
**File:** `src/app/profile/layout-client.tsx`
**Status:** PROTECTED
**Mechanism:** Server-side prop from `layout.tsx`
```tsx
// Server component checks admin status
const isAdmin = await UserManagementService.isAdmin(email);

// Client component receives it as prop
{isAdmin && (
  <Link href="/admin/users">👑 Admin Panel</Link>
)}
```

### ✅ Admin Pages
**All pages under `/admin`**
**Status:** PROTECTED
**Mechanism:** Server-side middleware/layout checks
- Each admin page verifies session and admin status
- Redirects non-admin users to home page
- Examples:
  - `/admin/page.tsx` - Main admin dashboard
  - `/admin/users/page.tsx` - User management
  - `/admin/data/page.tsx` - Data management
  - `/admin/ingest-full/page.tsx` - Content ingestion

### ✅ Admin API Endpoints
**All endpoints under `/api/admin`**
**Status:** PROTECTED
**Mechanism:** Server-side authorization
```tsx
const session = await getServerSession(authOptions);
const isAdmin = await UserManagementService.isAdmin(session.user.email);
if (!isAdmin) {
  return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
}
```

## Admin Check API

**Endpoint:** `GET /api/admin/check`
**Purpose:** Client-side components can verify admin status
**Returns:**
```json
{
  "isAdmin": true,
  "email": "user@example.com"
}
```

## Admin List Management

Admin status is determined by:
1. **Redis Key:** `rf:admins`
2. **Storage:** Set of admin email addresses
3. **Service:** `UserManagementService.isAdmin(email)`

### Adding Admins
```bash
# Via Redis CLI
redis-cli SADD rf:admins "admin@example.com"

# Or via admin UI (requires existing admin)
# Navigate to /admin/users
```

## Security Best Practices

1. **Never trust client-side checks alone**
   - Always verify on server before performing actions
   - UI hiding is for UX, not security

2. **Server-side first**
   - Profile page: Check admin status in server component
   - Header/Menu: Verify via API endpoint before showing links

3. **Consistent checking**
   - All admin routes verify permission
   - All admin APIs verify permission
   - All admin UI checks before rendering

4. **Audit trail**
   - Admin actions are logged
   - User management changes are tracked

## Testing Admin Access

### As Admin
1. Sign in with admin email
2. Should see ⚙️ icon in header
3. Should see "Admin Panel" in profile sidebar
4. Should see "Admin Panel" in mobile menu
5. Should be able to access `/admin` routes

### As Non-Admin
1. Sign in with non-admin email
2. Should NOT see ⚙️ icon in header
3. Should NOT see "Admin Panel" in profile sidebar
4. Should NOT see "Admin Panel" in mobile menu
5. Should be redirected if accessing `/admin` routes directly

## Troubleshooting

### Admin link showing for non-admins
1. Check Redis: `redis-cli SMEMBERS rf:admins`
2. Verify email matches exactly (case-sensitive)
3. Check browser console for API errors
4. Clear browser cache/cookies

### Admin link not showing for admins
1. Verify user is in admin list: `redis-cli SISMEMBER rf:admins "email@example.com"`
2. Check `/api/admin/check` endpoint returns `{"isAdmin": true}`
3. Ensure session is valid
4. Check browser console for errors

## Related Files

- `src/lib/admin/user-management-service.ts` - Admin verification logic
- `src/app/api/admin/check/route.ts` - Admin status API
- `src/middleware.ts` - Route protection (if implemented)
