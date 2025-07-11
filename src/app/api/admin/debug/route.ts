import { NextRequest, NextResponse } from 'next/server';
import { clearAdminCache, getAdminCache, isAuthorizedAdmin } from '@/lib/auth-utils';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const email = searchParams.get('email');

    switch (action) {
      case 'cache':
        const cache = await getAdminCache();
        return NextResponse.json({ cache });
      
      case 'clear':
        await clearAdminCache(email || undefined);
        return NextResponse.json({ 
          message: email ? `Cache cleared for ${email}` : 'All cache cleared' 
        });
      
      case 'check':
        if (!email) {
          return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
        }
        const isAuthorized = await isAuthorizedAdmin(email);
        return NextResponse.json({ 
          email, 
          isAuthorized,
          message: isAuthorized ? 'Email is authorized' : 'Email is not authorized'
        });

      case 'list-db-admins':
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (!supabaseUrl || !serviceRoleKey) {
          return NextResponse.json(
            { error: 'Missing Supabase configuration' },
            { status: 500 }
          );
        }
        
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
        const { data: adminList, error } = await supabaseAdmin
          .from('admin_list')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          return NextResponse.json(
            { error: 'Failed to fetch admin list', details: error },
            { status: 500 }
          );
        }

        return NextResponse.json({
          admins: adminList,
          count: adminList?.length || 0
        });

      case 'env-check':
        return NextResponse.json({
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          nodeEnv: process.env.NODE_ENV
        });
      
      default:
        return NextResponse.json({
          message: 'Admin Debug API',
          actions: {
            'GET ?action=cache': 'View current cache',
            'GET ?action=clear': 'Clear all cache',
            'GET ?action=clear&email=test@example.com': 'Clear cache for specific email',
            'GET ?action=check&email=test@example.com': 'Check authorization for email',
            'GET ?action=list-db-admins': 'List all admins from database',
            'GET ?action=env-check': 'Check environment variables',
            'POST with {"action": "restart-check", "email": "test@example.com"}': 'Clear cache and re-check email'
          }
        });
    }
  } catch (error: any) {
    console.error('Debug API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email } = body;

    if (action === 'restart-check') {
      if (!email) {
        return NextResponse.json(
          { error: 'Email required for restart-check' },
          { status: 400 }
        );
      }
      
      // Clear cache and re-check authorization
      await clearAdminCache(email);
      const isAdmin = await isAuthorizedAdmin(email);
      
      return NextResponse.json({
        email,
        isAuthorized: isAdmin,
        message: 'Cache cleared and authorization re-checked',
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Debug POST endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
