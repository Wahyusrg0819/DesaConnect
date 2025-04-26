import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAdmin } from '@/lib/auth-utils';

// Daftar rute yang memerlukan autentikasi admin
const PROTECTED_ADMIN_ROUTES = [
  '/admin/dashboard',
  '/admin/dashboard/submissions',
  '/admin/dashboard/analytics',
  '/admin/dashboard/settings',
];

export async function middleware(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const path = requestUrl.pathname;
  
  // Debug - log the path and cookies
  console.log(`Middleware checking path: ${path}`);
  
  // Debug - log all cookies
  const allCookies: string[] = [];
  request.cookies.getAll().forEach(cookie => {
    allCookies.push(`${cookie.name}=${cookie.value}`);
  });
  console.log('All cookies:', allCookies.join('; '));
  
  // Buat respons awal yang akan dimanipulasi jika perlu
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  
  // Cek apakah path saat ini adalah rute yang diproteksi
  const isProtectedRoute = PROTECTED_ADMIN_ROUTES.some(route => 
    path === route || path.startsWith(`${route}/`));
  
  // Jika bukan rute yang diproteksi, langsung kembalikan respons
  if (!isProtectedRoute) {
    console.log('Not a protected route, skipping auth check');
    return response;
  }
  
  console.log('Protected route detected, checking auth');
  
  try {
    // First, check for the admin_session cookie for the fallback mechanism
    const adminSessionCookie = request.cookies.get('admin_session');
    console.log('Admin session cookie:', adminSessionCookie ? `${adminSessionCookie.name}=${adminSessionCookie.value}` : 'not found');
    
    if (adminSessionCookie?.value) {
      const email = adminSessionCookie.value;
      console.log(`Found admin_session cookie with email: ${email}`);
      
      // Verify this email is still in the admin list
      const isAdmin = await isAuthorizedAdmin(email);
      console.log(`Email ${email} is admin: ${isAdmin}`);
      
      if (isAdmin) {
        // Allow access if the cookie contains a valid admin email
        console.log('Access granted via admin_session cookie');
        
        // Return response with updated headers for debugging
        const debugResponse = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        
        // Add a header to indicate auth method
        debugResponse.headers.set('X-Auth-Method', 'admin_session');
        return debugResponse;
      } else {
        console.warn(`Cookie contains non-admin email: ${email}`);
        // Clear the invalid cookie by redirecting
        const redirectUrl = new URL('/admin/login', requestUrl.origin);
        const redirectResponse = NextResponse.redirect(redirectUrl);
        redirectResponse.cookies.delete('admin_session');
        console.log('Redirecting to login and deleting invalid cookie');
        return redirectResponse;
      }
    }
    
    console.log('No admin_session cookie found, trying Supabase auth');
    
    // If no admin_session cookie, try Supabase auth as a fallback
    try {
      // Create a Supabase client using the new @supabase/ssr package
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get: (name) => request.cookies.get(name)?.value,
            set: (name, value, options) => {
              response.cookies.set({ name, value, ...options });
            },
            remove: (name, options) => {
              response.cookies.delete({ name, ...options });
            },
          },
        }
      );
      
      // Dapatkan session user dari Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error retrieving session in middleware:', sessionError);
        return NextResponse.redirect(new URL('/admin/login', requestUrl.origin));
      }
      
      // Jika tidak ada session (user belum login), redirect ke halaman login
      if (!session) {
        console.log('No Supabase session found, redirecting to login');
        const redirectUrl = new URL('/admin/login', requestUrl.origin);
        redirectUrl.searchParams.set('redirect', requestUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }
      
      // Cek apakah email user termasuk dalam daftar admin yang diizinkan
      const userEmail = session.user?.email;
      if (!userEmail) {
        console.error('User session exists but no email found');
        return NextResponse.redirect(new URL('/admin/login', requestUrl.origin));
      }
      
      console.log(`Found Supabase session with email: ${userEmail}`);
      
      // Use the centralized isAuthorizedAdmin function
      const isAdmin = await isAuthorizedAdmin(userEmail);
      console.log(`Email ${userEmail} is admin: ${isAdmin}`);
      
      // Jika bukan admin yang sah, redirect ke halaman utama
      if (!isAdmin) {
        console.warn(`Unauthorized admin access attempt by ${userEmail}`);
        return NextResponse.redirect(new URL('/', requestUrl.origin));
      }
      
      // Lanjutkan jika user sudah login dan merupakan admin yang sah
      console.log('Access granted via Supabase auth');
      
      // Return response with updated headers for debugging
      const debugResponse = NextResponse.next({
        request: {
          headers: request.headers,
        },
      });
      
      // Add a header to indicate auth method
      debugResponse.headers.set('X-Auth-Method', 'supabase');
      return debugResponse;
    } catch (supabaseError) {
      console.error('Error with Supabase auth in middleware:', supabaseError);
      // If Supabase auth fails, redirect to login
      return NextResponse.redirect(new URL('/admin/login', requestUrl.origin));
    }
  } catch (error) {
    console.error('Unexpected error in admin middleware:', error);
    return NextResponse.redirect(new URL('/admin/login', requestUrl.origin));
  }
}

// Konfigurasi rute yang akan diproses oleh middleware
export const config = {
  matcher: [
    '/admin/:path*',
  ],
}; 