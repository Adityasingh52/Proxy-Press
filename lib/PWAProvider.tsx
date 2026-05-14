'use client';

import { useEffect } from 'react';
import { PushNotificationManager } from './push-notifications';
import { OfflineManager } from './offline-manager';

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Offline Manager (SQLite & Network Listeners)
    OfflineManager.init();

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Register for native push notifications
    PushNotificationManager.register();
  }, []);

  return <>{children}</>;
}
