import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create a Supabase client with the service role key for admin operations
const adminClient = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  }
})

export async function GET(request: Request) {
  try {
    // Get the user's session from cookies
    const cookieStore = await cookies()
    const userEmail = cookieStore.get('user-email')?.value

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Unauthorized - No user email found' },
        { status: 401 }
      )
    }

    // Check if the user is an admin
    const { data: adminCheck, error: adminCheckError } = await adminClient
      .from('admin_list')
      .select('email')
      .eq('email', userEmail)
      .single()

    if (adminCheckError || !adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized - Not an admin' },
        { status: 401 }
      )
    }

    // Fetch the list of admins
    const { data: admins, error: adminsError } = await adminClient
      .from('admin_list')
      .select('email, created_at')
      .order('created_at', { ascending: false })

    if (adminsError) {
      return NextResponse.json(
        { error: 'Failed to fetch admins' },
        { status: 500 }
      )
    }

    return NextResponse.json({ admins })
  } catch (error) {
    console.error('Error in list-admins route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 