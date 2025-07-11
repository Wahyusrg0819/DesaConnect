# Pengaturan Variabel Lingkungan

## ⚠️ PENTING: Perubahan Sistem Admin

**Per update terbaru, sistem admin tidak lagi bergantung pada environment variables untuk authorization**. Admin sekarang dikelola 100% melalui database (`admin_list` table).

## Environment Variables yang Diperlukan

Buat file `.env.local` di direktori root proyek dengan isi berikut:

```env
# Supabase Configuration (WAJIB)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# DEPRECATED: Tidak lagi digunakan untuk authorization
# ALLOWED_ADMIN_EMAILS=email1@example.com,email2@example.com
```

## Environment Variables Explained

### 1. NEXT_PUBLIC_SUPABASE_URL
- **Required**: ✅ Ya
- **Purpose**: URL proyek Supabase Anda
- **Example**: `https://your-project.supabase.co`

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY  
- **Required**: ✅ Ya
- **Purpose**: Anonymous/public key untuk Supabase client
- **Example**: `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...`

### 3. SUPABASE_SERVICE_ROLE_KEY
- **Required**: ✅ Ya  
- **Purpose**: Service role key untuk admin operations & bypass RLS
- **Example**: `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...`
- **⚠️ Security**: Jangan expose ke client-side!

### 4. ALLOWED_ADMIN_EMAILS (DEPRECATED)
- **Required**: ❌ Tidak
- **Status**: Deprecated - tidak lagi digunakan untuk authorization
- **Purpose**: Sebelumnya untuk hardcode admin emails
- **Migration**: Email admin sekarang dikelola via database

## Cara Mendapatkan Environment Variables

### 1. Supabase Project Settings
1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih proyek Anda
3. Go to **Settings** > **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Setup Database
Pastikan tabel `admin_list` sudah ada:

```sql
CREATE TABLE IF NOT EXISTS admin_list (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text UNIQUE NOT NULL,
    added_by text,
    created_at timestamp with time zone DEFAULT now()
);

-- Add initial SuperAdmin
INSERT INTO admin_list (email, added_by) 
VALUES ('superadmin@example.com', 'system')
ON CONFLICT (email) DO NOTHING;
```

## Admin Management Workflow

### 🎯 New Way (Database-Only)
1. **SuperAdmin** login ke dashboard
2. **Add email** via Admin Management UI  
3. **Email tersebut** bisa register sebagai admin
4. **No environment variables** needed!

### ❌ Old Way (Deprecated)
```env
# JANGAN GUNAKAN INI LAGI
ALLOWED_ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

## Restart Server

Setelah mengubah `.env.local`:

```bash
# Stop development server (Ctrl+C)
# Start again
npm run dev
```

## Troubleshooting

### Environment Variables Missing
```bash
# Check environment variables
curl "localhost:3000/api/admin/debug?action=env-check"

# Expected response:
{
  "hasSupabaseUrl": true,
  "hasServiceRoleKey": true,
  "nodeEnv": "development"
}
```

### Admin Authorization Issues
```bash
# Check if email is authorized (database-only check)
curl "localhost:3000/api/admin/debug?action=check&email=test@example.com"
```

## Security Notes

1. **`.env.local` tidak boleh** di-commit ke repository
2. **Service role key** harus dijaga kerahasiaannya
3. **Production deployment** memerlukan environment variables yang sama
4. **Admin management** sekarang aman via database, bukan hardcode

## Migration dari Environment Variables

Jika sebelumnya menggunakan `ALLOWED_ADMIN_EMAILS`:

1. **Extract emails** dari environment variable
2. **Add ke database** via SQL atau dashboard:
```sql
INSERT INTO admin_list (email, added_by) VALUES 
('admin1@example.com', 'migration'),
('admin2@example.com', 'migration');
```
3. **Remove environment variable** dari `.env.local`
4. **Test authorization** dengan debug tools 