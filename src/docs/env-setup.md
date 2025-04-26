# Pengaturan Variabel Lingkungan

Untuk mengonfigurasi akses admin ke aplikasi DesaConnect, ikuti langkah-langkah berikut:

## 1. Buat file `.env.local`

Buat file `.env.local` di direktori root proyek dengan isi berikut:

```
# Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Admin emails (comma-separated list)
ALLOWED_ADMIN_EMAILS=admin@desaconnect.com,admin2@desaconnect.com,another.admin@example.com
```

## 2. Sesuaikan daftar email admin

Edit nilai `ALLOWED_ADMIN_EMAILS` dengan daftar email admin yang diizinkan, dipisahkan dengan koma.

Contoh:
```
ALLOWED_ADMIN_EMAILS=admin1@domain.com,admin2@domain.com,admin3@domain.com
```

## 3. Format daftar email

- Email dipisahkan dengan koma
- Spasi setelah koma akan dihapus secara otomatis
- Email akan dikonversi menjadi lowercase
- Tidak boleh ada spasi di awal atau akhir email

## 4. Restart server

Setelah mengubah file `.env.local`, restart server development Anda untuk menerapkan perubahan.

```
npm run dev
```

## Catatan Keamanan

File `.env.local` tidak boleh dicommit ke repository. Variabel lingkungan harus diatur secara terpisah di lingkungan deployment. 