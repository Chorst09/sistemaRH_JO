import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/companies') || 
                          request.nextUrl.pathname.startsWith('/dashboard') ||
                          request.nextUrl.pathname.startsWith('/employees') ||
                          request.nextUrl.pathname.startsWith('/payslip') ||
                          request.nextUrl.pathname.startsWith('/absence') ||
                          request.nextUrl.pathname.startsWith('/reports') ||
                          request.nextUrl.pathname.startsWith('/settings') ||
                          request.nextUrl.pathname.startsWith('/organization');
  
  // Redirect unauthenticated users from protected routes
  if (!token && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Redirect authenticated users away from login page
  if (token && request.nextUrl.pathname === '/login') {
    const redirectUrl = new URL('/companies', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};