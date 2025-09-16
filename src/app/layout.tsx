import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/components/auth/auth-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'HR Vision',
  description: 'Um sistema de RH avançado para empresas modernas.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="dark">
      <body className={`${inter.variable} font-body antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
