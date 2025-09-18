import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  try {
    // Apenas obtém a sessão - não chama getUser()
    const { data: { session } } = await supabase.auth.getSession();
    
    // Redireciona para login se não há sessão e está tentando acessar rotas protegidas
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/companies') || 
                            request.nextUrl.pathname.startsWith('/dashboard');
    
    if (!session && isProtectedRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Redireciona para companies se já está logado e tenta acessar login
    if (session && request.nextUrl.pathname === '/login') {
      return NextResponse.redirect(new URL('/companies', request.url));
    }
  } catch (error) {
    console.error('Middleware error:', error);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};