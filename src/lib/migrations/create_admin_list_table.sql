-- Buat tabel admin_list jika belum ada
CREATE TABLE IF NOT EXISTS public.admin_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tambahkan indeks
CREATE INDEX IF NOT EXISTS idx_admin_list_email ON public.admin_list (email);

-- Tambahkan default admin
INSERT INTO public.admin_list (email)
VALUES ('wahyumuliadisiregar@student.uir.ac.id')
ON CONFLICT (email) DO NOTHING; 