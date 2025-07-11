# 🧪 Testing Admin Registration Flow

## Quick Test Scenario

### Step 1: SuperAdmin Login
```
URL: http://localhost:3000/admin/login
Email: wahyumuliadisiregar@student.uir.ac.id
Password: Admin123456
```

### Step 2: Add New Admin Email
```
1. Go to: http://localhost:3000/admin/settings
2. Scroll to "Tambah Admin Baru" section
3. Input: newtestadmin@company.com
4. Click "Tambah Admin"
5. Verify: Email appears in admin list
```

### Step 3: Test Registration with New Email
```
1. Open new incognito tab
2. Go to: http://localhost:3000/admin/register
3. Fill form:
   - Email: newtestadmin@company.com
   - Nama: New Test Admin
   - Phone: 081234567890
   - Password: TestPassword123
   - Confirm Password: TestPassword123
4. Click "Register"
5. Expected: ✅ "Registrasi berhasil. Silakan login dengan akun Anda."
```

### Step 4: Test Login with New Admin
```
1. After registration redirect
2. Go to: http://localhost:3000/admin/login
3. Login with:
   - Email: newtestadmin@company.com
   - Password: TestPassword123
4. Expected: ✅ Login success, redirect to admin dashboard
```

## Current Authorized Emails (Database)

- `wahyumuliadisiregar@student.uir.ac.id` (SuperAdmin)
- `fatina0819@gmail.com`
- `wahyusiregar@gmail.com`
- `test.admin@example.com`

## Test Results Expected

✅ **Emails in database above** → Registration should succeed
❌ **Any other email** → Registration should fail with "Email tidak diizinkan untuk mendaftar sebagai admin"

## Debug Commands

Check if email is authorized:
```sql
SELECT * FROM admin_list WHERE email = 'your.email@domain.com';
```

Add email manually:
```sql
INSERT INTO admin_list (email) VALUES ('manual.admin@test.com');
```

Remove email:
```sql
DELETE FROM admin_list WHERE email = 'remove.admin@test.com';
```
