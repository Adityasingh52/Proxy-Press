'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { recordUserActivity } from '@/lib/actions';

export default function UserActivityRecorder() {
  const pathname = usePathname();

  useEffect(() => {
    // Record activity on mount and on every pathname change
    const record = async () => {
      try {
        await recordUserActivity();
      } catch (err) {
        // Silently fail as this is a background task
      }
    };

    record();
  }, [pathname]);

  return null;
}
