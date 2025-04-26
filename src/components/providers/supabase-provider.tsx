'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // Import Supabase client
import { ensureTablesExist } from '@/lib/supabase'; // Import helper function

// Definisikan konteks Supabase
const SupabaseContext = createContext<typeof supabase | undefined>(undefined);

// Hook untuk menggunakan Supabase
export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase harus digunakan dalam SupabaseProvider');
  }
  return context;
};

// Provider untuk Supabase
export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Jalankan setup saat komponen dimuat
    const setupSupabase = async () => {
      try {
        // Pastikan tabel yang dibutuhkan telah ada
        await ensureTablesExist();
        setIsInitialized(true);
      } catch (error) {
        console.error('Error menyiapkan Supabase:', error);
      }
    };

    setupSupabase();
  }, []);

  return (
    <SupabaseContext.Provider value={supabase}>
      {isInitialized ? children : <div>Memuat...</div>}
    </SupabaseContext.Provider>
  );
}

export default SupabaseProvider; 