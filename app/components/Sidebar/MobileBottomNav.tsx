'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getUnreadMessageCountAction } from '@/lib/actions';
import './MobileBottomNav.css';

const navItems = [
  {
    href: '/',
    label: 'Home',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: '/explore',
    label: 'Explore',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    href: '/create',
    label: 'Create',
    isCreate: true,
    icon: (_active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  },
  {
    href: '/messages',
    label: 'Messages',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        <path d="M8 12h.01" />
        <path d="M12 12h.01" />
        <path d="M16 12h.01" />
      </svg>
    ),
  },

  {
    href: '/profile',
    label: 'Profile',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [optimisticTab, setOptimisticTab] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // 0. Instant Cache Load (Run this first, before anything else)
  useEffect(() => {
    async function loadInstantId() {
      const cachedId = await OfflineManager.loadData<string>('last_user_id');
      if (cachedId) {
        setCurrentUserId(cachedId);
      }
    }
    loadInstantId();
  }, []);

  // 1. Initial Data Load & Periodic Refresh (Mount Only)
  useEffect(() => {
    async function initLoad() {
      try {
        const actions = await import('@/lib/actions');
        const user = await actions.getCurrentUser();
        
        if (user) {
          setCurrentUserId(user.id);
          localStorage.setItem('proxypress_user_id', user.id);
          
          // Refresh count immediately
          const count = await actions.getUnreadMessageCountAction();
          setUnreadCount(count);
          const profileData = await actions.getProfileData(user.id);

          if (profileData) {
            localStorage.setItem(`profile_cache_${user.id}`, JSON.stringify({ ...profileData, timestamp: Date.now() }));
          }
        }
      } catch (e) {
        console.error('Initial load failed', e);
      }
    }

    initLoad();
    const interval = setInterval(initLoad, 20000); // 20s interval is enough
    return () => clearInterval(interval);
  }, []);

  // 2. Lightweight Pathname Refresh (Only for notifications/badge)
  useEffect(() => {
    getUnreadMessageCountAction().then(setUnreadCount).catch(() => {});
    setOptimisticTab(null); // Sync back to real path when navigation finishes
  }, [pathname]);

  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-nav-container">
        {navItems.map((item) => {
          let href = item.href;
          
          // CRITICAL: Ensure the Profile link is ALWAYS direct and never depends on a slow redirect
          if (href === '/profile') {
            if (currentUserId) {
              href = `/profile/${currentUserId}`;
            }
          }

          const isActive = optimisticTab 
            ? item.href === optimisticTab
            : (item.href === '/' 
              ? pathname === '/' 
              : pathname.startsWith(item.href) || (item.href === '/profile' && pathname.includes('/profile/')));

          const badge = item.href === '/messages' ? unreadCount : 0;
          
          if (item.isCreate) {
            return (
              <div key={item.href} className="mobile-nav-item mobile-nav-create-wrapper">
                <Link
                  href={href}
                  className="mobile-nav-create-btn"
                >
                  {item.icon(isActive)}
                </Link>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={href}
              onClick={() => setOptimisticTab(item.href)}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="mobile-nav-icon-wrapper">
                {item.icon(isActive)}
                {badge > 0 && !isActive && (
                  <span className="mobile-nav-badge">{badge}</span>
                )}
              </div>
              <span className="mobile-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
