# DesaConnect

Aplikasi platform aspirasi dan keluhan untuk Desa Pangkalan Baru.

## Fitur Utama

- Pengajuan keluhan dan aspirasi warga
- Pelacakan status keluhan
- Dashboard admin untuk mengelola laporan
- Notifikasi status laporan

## Setup Aplikasi

### Prasyarat

- Node.js 18+ dan npm/yarn
- Supabase account (database)

### Langkah Instalasi

1. Clone repositori
2. Install dependensi dengan `npm install`
3. Buat file `.env.local` dan tambahkan konfigurasi Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
JWT_SECRET=your-jwt-secret
ADMIN_SETUP_SECRET=your-admin-setup-secret
```
4. Jalankan aplikasi dengan `npm run dev`

### Setup Admin

Untuk menambahkan admin pertama, ikuti langkah-langkah di [Panduan Setup Admin](docs/admin-setup.md).

## Informasi Tambahan

Untuk dokumentasi lebih lanjut, lihat folder `docs`.

## Environment Variables

Make sure to set the following environment variables in your `.env` file:

```
# Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin emails (comma-separated list)
ALLOWED_ADMIN_EMAILS=admin@example.com,admin2@example.com
```

The `SUPABASE_SERVICE_ROLE_KEY` is required for admin registration functionality.

## Recent Changes

### Authentication System Updates

- Fixed duplicate implementation of `isAuthorizedAdmin` function
- Consolidated admin authorization logic in `src/lib/auth-utils.ts`
- Improved error handling for missing environment variables
- Added validation for required API keys
