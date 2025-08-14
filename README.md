# DesaConnect

Aplikasi platform aspirasi dan keluhan untuk Desa Pangkalan Baru.

## ⚠️ PENTING: Keamanan

**JANGAN PERNAH commit file `.env.local` atau file environment lainnya ke repository!** File ini berisi informasi sensitif seperti API keys dan database credentials.

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
3. **Buat file `.env.local`** (tidak akan ter-commit) dan tambahkan konfigurasi Supabase:

```bash
# Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin emails (comma-separated list)
ALLOWED_ADMIN_EMAILS=admin@desaconnect.com,admin2@desaconnect.com
```

4. Jalankan aplikasi dengan `npm run dev`

## Struktur Proyek

```
src/
├── app/                 # Next.js app router
├── components/          # React components
├── lib/                 # Utility functions
└── types/               # TypeScript type definitions
```

## Teknologi

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS

## Keamanan

- Environment variables tidak akan ter-commit
- Row Level Security (RLS) di database
- JWT authentication
- Input validation dan sanitization

## Contributing

Lihat [CONTRIBUTING.md](CONTRIBUTING.md) untuk panduan kontribusi.

## License

MIT License
