'use client';

import { useSession } from 'next-auth/react';
import { GoogleDriveStorage } from '@/lib/google-drive';
import { useMemo } from 'react';

export function useGoogleDrive() {
  const { data: session } = useSession();
  
  const drive = useMemo(() => {
    if (!session?.accessToken) return null;
    return new GoogleDriveStorage(session.accessToken);
  }, [session?.accessToken]);

  return { drive, session };
}