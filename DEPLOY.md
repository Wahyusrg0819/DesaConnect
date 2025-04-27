# Panduan Deployment DesaConnect ke Vercel

## Prasyarat
Sebelum melakukan deployment, pastikan Anda telah:
1. Membuat project di Supabase dan mencatat URL dan kunci API
2. Mempersiapkan email admin yang akan diizinkan mengakses dashboard

## Langkah-langkah Deployment

### 1. Setup Environment Variables di Vercel

Login ke dashboard Vercel, pilih project DesaConnect, lalu:
- Buka tab **Settings** → **Environment Variables**
- Tambahkan variabel berikut:

```
# Supabase Auth - WAJIB
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-supabase-dashboard

# Supabase Service Role Key - WAJIB untuk admin operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-supabase-dashboard

# Admin Configuration - WAJIB untuk autentikasi admin
ALLOWED_ADMIN_EMAILS=admin1@example.com,admin2@example.com

# Optional: Admin Setup Secret (untuk membuat admin awal)
ADMIN_SETUP_SECRET=your-secure-secret-key
```

### 2. Redeploy Aplikasi

Setelah menambahkan environment variables:
- Buka tab **Deployments**
- Klik tombol **Redeploy** pada deployment terakhir
- Atau lakukan commit dan push perubahan ke repository GitHub untuk memicu deployment baru

### 3. Verifikasi Deployment

- Pastikan aplikasi berhasil di-deploy tanpa error
- Akses halaman admin login di `https://your-domain.vercel.app/admin/login`
- Login menggunakan email yang telah didaftarkan di `ALLOWED_ADMIN_EMAILS`

## Troubleshooting

### Error Environment Variables

Jika muncul error:
```
Error: Silakan tentukan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di file .env.local
```

Artinya environment variables belum dikonfigurasi dengan benar. Pastikan:
1. Semua variabel wajib sudah ditambahkan di Vercel
2. Nilai variabel sudah benar (periksa kembali di dashboard Supabase)
3. Tidak ada typo atau kesalahan format

### CORS Error

Jika terjadi CORS error saat mengakses Supabase dari aplikasi:
1. Buka dashboard Supabase
2. Buka menu Authentication → URL Configuration
3. Tambahkan domain Vercel Anda (https://your-domain.vercel.app) ke daftar allowed URLs

### Database Belum Diinisialisasi

Jika fitur aplikasi tidak berfungsi karena tabel belum dibuat:
1. Gunakan SQL Editor di Supabase untuk menjalankan script migrasi dari file:
   - `src/lib/migrations/create_admin_list_table.sql`
   - `src/lib/migrations/create_submissions_table.sql`
   - Atau script lain yang diperlukan 