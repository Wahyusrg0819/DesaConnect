# Panduan Setup Admin DesaConnect

Dokumen ini memberikan petunjuk untuk melakukan setup admin pada aplikasi DesaConnect.

## Membuat Tabel Admin di Supabase

Langkah-langkah untuk membuat tabel admin:

1. Login ke dashboard Supabase project Anda
2. Buka SQL Editor
3. Jalankan query SQL berikut:

```sql
-- Buat tabel admin jika belum ada
    CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    last_login TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Tambahkan indeks
    CREATE INDEX IF NOT EXISTS idx_admins_username ON admins (username);
```

## Menambahkan Admin Pertama

Setelah tabel dibuat, Anda dapat menambahkan admin dengan dua cara:

### Cara 1: Menggunakan API Setup

1. Tambahkan environment variable `ADMIN_SETUP_SECRET` dengan nilai yang aman di file `.env.local`
2. Akses endpoint berikut di browser atau dengan HTTP client:

```
http://localhost:3000/api/admin/setup?secret=NILAI_SECRET_ANDA
```

3. Endpoint akan memberikan respons berhasil jika admin berhasil ditambahkan
4. Gunakan kredensial yang dikembalikan untuk login:
   - Username: `admindesaconnect`
   - Password: `D3saC0nnect@Admin`

### Cara 2: Menambahkan Langsung di Supabase

1. Buka tabel `admins` di dashboard Supabase
2. Klik "Insert Row"
3. Isi data admin dengan struktur berikut:
   - username: `admindesaconnect` (atau sesuai keinginan)
   - password: `D3saC0nnect@Admin` (atau password yang kuat lainnya)
   - name: `Admin DesaConnect`
   - role: `admin`

## Catatan Keamanan

- Dalam lingkungan produksi, sebaiknya gunakan hashing untuk password (seperti bcrypt)
- Ganti password default sesegera mungkin setelah login pertama
- Batasi akses ke endpoint setup dengan secret key yang kuat
- Gunakan HTTPS untuk semua komunikasi API 