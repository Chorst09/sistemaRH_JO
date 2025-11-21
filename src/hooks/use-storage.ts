'use client';

import { useSession } from 'next-auth/react';
import { DataStorage } from '@/lib/data-storage';
import { useMemo } from 'react';

export function useStorage() {
  const { data: session } = useSession();
  
  const storage = useMemo(() => {
    if (!session?.accessToken || !session?.user?.email) return null;
    return new DataStorage(session.accessToken, session.user.email);
  }, [session?.accessToken, session?.user?.email]);

  return { storage, session, isReady: !!storage };
}
