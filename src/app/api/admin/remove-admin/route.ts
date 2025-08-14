import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isAuthorizedAdmin } from '@/lib/auth-utils';
import type { Database } from '@/types/supabase';

// Membuat Supabase admin client dengan service role key
function getAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase credentials');
  }
  
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey);
}

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

    // Check if the current user is an admin
    const isAdmin = await isAuthorizedAdmin(currentUserEmail);
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - User is not an admin' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { email } = body;
    
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email invalid or missing' },
        { status: 400 }
      );
    }
    
    // Tidak boleh menghapus diri sendiri
    if (currentUserEmail?.toLowerCase() === email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Anda tidak dapat menghapus diri sendiri dari daftar admin' },
        { status: 400 }
      );
    }
    
    // Gunakan admin client untuk bypass RLS
    const adminSupabase = getAdminSupabaseClient();
    
    // Cek dulu jumlah admin yang ada
    const { count: adminCount, error: countError } = await adminSupabase
      .from('admin_list')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error checking admin count:', countError);
      return NextResponse.json(
        { error: 'Error checking admin count: ' + countError.message },
        { status: 500 }
      );
    }
    
    // Pastikan selalu ada minimal satu admin
    if (adminCount !== null && adminCount <= 1) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus admin terakhir dalam sistem' },
        { status: 400 }
      );
    }
    
    // Unassign submissions linked to this admin to satisfy FK constraints
    const { error: unassignAssignedToError } = await adminSupabase
      .from('submissions')
      .update({ assigned_to: null })
      .eq('assigned_to', email.toLowerCase());

    if (unassignAssignedToError) {
      console.error('Error unassigning submissions (assigned_to):', unassignAssignedToError);
      return NextResponse.json(
        { error: 'Error unassigning submissions: ' + unassignAssignedToError.message },
        { status: 500 }
      );
    }

    const { error: unassignLastUpdatedByError } = await adminSupabase
      .from('submissions')
      .update({ last_updated_by: null })
      .eq('last_updated_by', email.toLowerCase());

    if (unassignLastUpdatedByError) {
      console.error('Error clearing submissions (last_updated_by):', unassignLastUpdatedByError);
      return NextResponse.json(
        { error: 'Error clearing last updated by: ' + unassignLastUpdatedByError.message },
        { status: 500 }
      );
    }

    // Hapus admin dari database
    const { data, error } = await adminSupabase
      .from('admin_list')
      .delete()
      .eq('email', email.toLowerCase())
      .select();
    
    if (error) {
      console.error('Error removing admin:', error);
      return NextResponse.json(
        { error: 'Error removing admin: ' + error.message },
        { status: 500 }
      );
    }
    
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Admin tidak ditemukan' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Admin removed successfully',
        data
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Error in remove-admin API route:', error);
    return NextResponse.json(
      { error: 'Error removing admin: ' + error.message },
      { status: 500 }
    );
  }
} 