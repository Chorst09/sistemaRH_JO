'use client';

import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const loading = status === 'loading';
  const user = session?.user || null;

  const signOut = async () => {
    await nextAuthSignOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  return {
    user,
    loading,
    signOut,
    session,
  };
}