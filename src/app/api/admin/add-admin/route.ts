import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { isAuthorizedAdmin } from '@/lib/auth-utils';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with the service role key for admin operations
const adminClient = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  }
});

export async function POST(request: NextRequest) {
  try {
    // Get the user's session from cookies - check both admin_session and user-email
    const cookieStore = await cookies();
    const adminSessionEmail = cookieStore.get('admin_session')?.value;
    const userEmail = cookieStore.get('user-email')?.value;
    
    // Use admin_session first (primary auth), then fallback to user-email
    const currentUserEmail = adminSessionEmail || userEmail;

    if (!currentUserEmail) {
      return NextResponse.json(
        { error: 'Unauthorized - No user email found' },
        { status: 401 }
      );
    }

    // Check if the current user is an admin using the same logic as auth-utils
    const isAdmin = await isAuthorizedAdmin(currentUserEmail);
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Not an admin' },
        { status: 401 }
      );
    }

    // Get the new admin email from request body
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Invalid email provided' },
        { status: 400 }
      );
    }

    // Check if the email already exists in admin_list
    const { data: existingAdmin, error: existingAdminError } = await adminClient
      .from('admin_list')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Email already exists in admin list' },
        { status: 400 }
      );
    }

    // Add the new admin to the admin_list table
    const { data, error: insertError } = await adminClient
      .from('admin_list')
      .insert([
        { 
          email: email.toLowerCase(),
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (insertError) {
      console.error('Error adding admin:', insertError);
      return NextResponse.json(
        { error: 'Failed to add admin' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Admin added successfully',
      data 
    });

  } catch (error) {
    console.error('Error in add-admin route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 