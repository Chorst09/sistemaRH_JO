import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google'
import { SessionProvider } from '@/components/auth/session-provider';
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
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
