import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Pastikan variabel lingkungan telah diatur
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Periksa apakah variabel lingkungan tersedia
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Silakan tentukan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di file .env.local'
  );
}

// Buat client Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Fungsi untuk memastikan tabel yang dibutuhkan telah ada
export async function ensureTablesExist() {
  // Fungsi ini dapat digunakan untuk memastikan tabel yang dibutuhkan sudah ada
  // atau membuat tabel jika belum ada, saat aplikasi startup
  console.log('Memastikan tabel Supabase telah dibuat');
}

export default supabase; 