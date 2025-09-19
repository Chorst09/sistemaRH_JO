import { NextResponse, type NextRequest } from 'next/server';
import { validateServerEnvironment } from '@/lib/startup-validation';
import { createServerClientForMiddleware } from '@/lib/supabase-server';
import { handleAuthError } from '@/lib/auth-error-handler';

export async function middleware(request: NextRequest) {
  // Validate environment configuration on server-side
  try {
    validateServerEnvironment();
  } catch (error) {
    const structuredError = handleAuthError(error, {
      context: 'middleware_environment_validation',
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    });
    
    console.error('❌ Server environment validation failed:', structuredError.message);
    return new NextResponse('Server configuration error', { status: 500 });
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    // Create Supabase client with centralized configuration and error handling
    const supabase = createServerClientForMiddleware(request, response);

    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      // Log session errors but don't block the request unless it's critical
      const structuredError = handleAuthError(error, {
        context: 'middleware_get_session',
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        path: request.nextUrl.pathname,
      });
      
      // Only block for configuration errors
      if (structuredError.type === 'config') {
        return new NextResponse('Authentication configuration error', { status: 500 });
      }
    }
    
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/companies') || 
                            request.nextUrl.pathname.startsWith('/dashboard') ||
                            request.nextUrl.pathname.startsWith('/employees') ||
                            request.nextUrl.pathname.startsWith('/payslip') ||
                            request.nextUrl.pathname.startsWith('/absence') ||
                            request.nextUrl.pathname.startsWith('/reports') ||
                            request.nextUrl.pathname.startsWith('/settings') ||
                            request.nextUrl.pathname.startsWith('/organization');
    
    // Redirect unauthenticated users from protected routes
    if (!session && isProtectedRoute) {
      const redirectUrl = new URL('/login', request.url);
      return NextResponse.redirect(redirectUrl);
    }
    
    // Redirect authenticated users away from login page
    if (session && request.nextUrl.pathname === '/login') {
      const redirectUrl = new URL('/companies', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  } catch (error: any) {
    // Handle unexpected middleware errors
    const structuredError = handleAuthError(error, {
      context: 'middleware_unexpected_error',
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      path: request.nextUrl.pathname,
    });
    
    console.error('❌ Middleware error:', structuredError.message);
    
    // For configuration errors, return 500
    if (structuredError.type === 'config') {
      return new NextResponse('Server configuration error', { status: 500 });
    }
    
    // For other errors, allow the request to continue
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public/*)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};