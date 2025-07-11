# 🐛 Admin Debug Guide - DesaConnect

## ✅ System Status: RESOLVED

**System telah diperbaiki dan sepenuhnya menggunakan database-only authorization**

## Quick Emergency Fixes

### 🔥 Email Added But Can't Register

**Problem**: Email sudah ditambahkan via dashboard tapi masih tidak bisa register

**Solution**:
```bash
# 1. Clear cache untuk email tersebut
curl "http://localhost:9002/api/admin/debug?action=clear&email=user@example.com"

# 2. Re-check authorization
curl "http://localhost:9002/api/admin/debug?action=check&email=user@example.com"

# 3. Restart server jika masih bermasalah
```

### � Email Added But Can't Login

**Problem**: Registration berhasil tapi login gagal dengan "Email tidak terdaftar sebagai admin"

**Root Cause**: Cache issue atau authorization check error

**Solution**:
```bash
# 1. Clear cache dan re-check
curl "http://localhost:9002/api/admin/debug?action=clear&email=user@example.com"
curl "http://localhost:9002/api/admin/debug?action=check&email=user@example.com"

# 2. Check server logs untuk detailed error
# Look for [AUTH] logs in terminal

# 3. Try login again - should work now
```

### 🔥 Cache Issues

**Problem**: Authorization tidak update setelah perubahan database

**Solution**:
```bash
# Clear all cache
curl "http://localhost:9002/api/admin/debug?action=clear"

# Check cache status
curl "http://localhost:9002/api/admin/debug?action=cache"
```

---

## 🛠️ Solutions

### Solution 1: Update Environment Variables (Quick Fix)
Edit `.env.local`:
```env
ALLOWED_ADMIN_EMAILS=wahyumuliadisiregar@student.uir.ac.id,fatina0819@gmail.com,wahyusiregar@gmail.com,admin@desaconnect.com
```

### Solution 2: Clear Cache and Retry
```bash
# Clear cache for specific email
curl "http://localhost:3000/api/admin/debug?action=clear&email=wahyusiregar@gmail.com"

# Then retry registration
```

### Solution 3: Restart Server
```bash
npm run dev
```
Cache will be cleared on server restart.

### Solution 4: Manual Database Check
```sql
-- Force add to database if missing
INSERT INTO admin_list (email) VALUES ('wahyusiregar@gmail.com') ON CONFLICT (email) DO NOTHING;
```

---

## 🧪 Testing Workflow

### Current Issue with wahyusiregar@gmail.com:

1. **Verify Database:**
   ```sql
   SELECT * FROM admin_list WHERE email = 'wahyusiregar@gmail.com';
   -- Result: Should show the email exists
   ```

2. **Check Authorization:**
   ```bash
   curl "http://localhost:3000/api/admin/debug?action=check&email=wahyusiregar@gmail.com"
   # Expected: {"email":"wahyusiregar@gmail.com","isAuthorized":true}
   ```

3. **Clear Cache if Needed:**
   ```bash
   curl "http://localhost:3000/api/admin/debug?action=clear&email=wahyusiregar@gmail.com"
   ```

4. **Test Registration:**
   - Go to `/admin/register`
   - Use email: `wahyusiregar@gmail.com`
   - Should succeed after cache clear

---

## 📝 Current Status

**Database Status:**
- ✅ `wahyumuliadisiregar@student.uir.ac.id` (SuperAdmin)
- ✅ `fatina0819@gmail.com`
- ✅ `wahyusiregar@gmail.com` ← **This should work now**
- ✅ `test.admin@example.com`

**Environment Variables:**
- Updated to include real emails instead of examples
- Cache should refresh automatically

**Debug API Available:**
- `GET /api/admin/debug` - View available actions
- `GET /api/admin/debug?action=check&email=X` - Test specific email
- `GET /api/admin/debug?action=clear&email=X` - Clear cache for email

---

## 🔄 Prevention

1. **Always update environment variables** when adding new admins
2. **Clear cache** after admin changes
3. **Use debug API** to verify authorization
4. **Monitor logs** for authorization issues
5. **Document admin changes** for tracking

---

## 🚨 Emergency Fix - Database Access Issue Resolved

**Root Cause Found from Logs:**
1. **Environment Variables incomplete** - Missing `wahyusiregar@gmail.com`
2. **Database query failing** - RLS blocking anonymous access

**Fixes Applied:**
1. ✅ **Updated auth-utils.ts** - Now uses service role client for database checks
2. ✅ **Fixed environment variables** - Added missing email
3. ✅ **Bypasses RLS** - Service role has full access

**Try registration now:**

```bash
# 1. Clear cache first (important after code changes)
curl "http://localhost:3000/api/admin/debug?action=clear"

# 2. Test authorization (should work now)
curl "http://localhost:3000/api/admin/debug?action=check&email=wahyusiregar@gmail.com"
# Expected: {"email":"wahyusiregar@gmail.com","isAuthorized":true}

# 3. Registration should succeed now ✅
```

**Key Changes:**
- Database queries now use `SUPABASE_SERVICE_ROLE_KEY` instead of anonymous client
- This bypasses RLS policies that were blocking the auth check
- Environment variables updated to include all admin emails

**If still having issues, restart server to apply environment changes:**
```bash
npm run dev
```

---

## ⚡ **Immediate Action Required**

**Update your `.env.local` file:**

```env
# Update this line in your .env.local file:
ALLOWED_ADMIN_EMAILS=wahyumuliadisiregar@student.uir.ac.id,fatina0819@gmail.com,wahyusiregar@gmail.com,test.admin@example.com

# Make sure you also have these:
NEXT_PUBLIC_SUPABASE_URL=https://bmweeqtibshxosnpppfg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Then restart your development server:**
```bash
npm run dev
```

**Expected Log Output (after restart):**
```
[AUTH] Environment allowed emails: [
  'wahyumuliadisiregar@student.uir.ac.id',
  'fatina0819@gmail.com', 
  'wahyusiregar@gmail.com',  ← Should appear now
  'test.admin@example.com'
]
```
