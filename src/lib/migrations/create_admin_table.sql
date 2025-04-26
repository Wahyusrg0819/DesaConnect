-- Buat tabel admin jika belum ada
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  last_login TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tambahkan indeks
CREATE INDEX IF NOT EXISTS idx_admins_username ON public.admins (username);

-- Tambahkan admin default
INSERT INTO public.admins (username, password, name, role)
VALUES ('admindesaconnect', 'D3saC0nnect@Admin', 'Admin DesaConnect', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Buat function untuk membuat tabel admin
CREATE OR REPLACE FUNCTION public.create_admin_table()
RETURNS void AS $$
BEGIN
  -- Buat tabel admin jika belum ada
  CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    last_login TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );
  
  -- Tambahkan indeks
  CREATE INDEX IF NOT EXISTS idx_admins_username ON public.admins (username);
  
  -- Tambahkan admin default
  INSERT INTO public.admins (username, password, name, role)
  VALUES ('admindesaconnect', 'D3saC0nnect@Admin', 'Admin DesaConnect', 'admin')
  ON CONFLICT (username) DO NOTHING;
END;
$$ LANGUAGE plpgsql; 