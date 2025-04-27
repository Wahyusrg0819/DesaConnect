'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ensureTablesExist } from '@/lib/supabase';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import GlobalLoading from "@/components/ui/global-loading";

type SupabaseContext = {
  supabase: SupabaseClient<Database>;
  user: User | null;
  isLoading: boolean;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  const [supabase] = useState(() => createClientComponentClient());
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Setup tables and check initial session
    const setupSupabase = async () => {
      try {
        setIsLoading(true);
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session:', session?.user?.email);
        setUser(session?.user ?? null);
        
        // Ensure tables exist
        await ensureTablesExist();
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing Supabase:', error);
        setIsInitialized(true); // Still set initialized to prevent infinite loading
      } finally {
        setIsLoading(false);
      }
    };

    setupSupabase();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <Context.Provider value={{ supabase, user, isLoading }}>
      {isInitialized ? children : <GlobalLoading />}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider');
  }
  return context;
}; 