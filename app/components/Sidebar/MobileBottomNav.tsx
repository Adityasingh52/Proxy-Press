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
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('proxypress_user_id');
    }
    return null;
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [count, user] = await Promise.all([
          getUnreadMessageCountAction(),
          import('@/lib/actions').then(m => m.getCurrentUser())
        ]);
        setUnreadCount(count);
        if (user) {
          setCurrentUserId(user.id);
          localStorage.setItem('proxypress_user_id', user.id);
          // GLOBAL CACHE WARMING: Keep self-profile and messages hot
          const actions = await import('@/lib/actions');
          const [profileData, convs, stories] = await Promise.all([
            actions.getProfileData(user.id),
            actions.getConversations(user.id),
            actions.getStories(user.id)
          ]);

          if (profileData) {
            localStorage.setItem(`profile_cache_${user.id}`, JSON.stringify({ ...profileData, timestamp: Date.now() }));
          }

          if (convs) {
            // Map conversations to UI format before caching
            const mappedConvs = convs.map((dbConv: any) => {
              const otherParticipant = dbConv.participants?.find((p: any) => p.userId !== user.id);
              const otherUser = otherParticipant?.user;
              const displayName = (otherUser?.name && otherUser.name.includes('/uploads/')) ? (otherUser.username || 'User') : (otherUser?.name || 'Unknown User');
              return {
                id: dbConv.id,
                user: {
                  id: otherUser?.id || 'unknown',
                  name: displayName,
                  avatar: otherUser?.avatar || (displayName ? displayName.substring(0, 1) : 'U'),
                  profilePicture: otherUser?.profilePicture,
                  online: true,
                },
                lastMessage: dbConv.lastMessage || '',
                lastMessageTime: dbConv.lastMessageTime || '',
                rawLastMessageTime: dbConv.lastMessageTime || '',
                unreadCount: dbConv.unreadCount || 0,
                isTyping: false,
                muted: dbConv.muted || false,
                vanishMode: dbConv.vanishMode || false,
                vanishDuration: dbConv.vanishDuration || 3600,
                messages: (dbConv.messages || []).map((m: any) => ({
                  id: m.id,
                  senderId: m.senderId === user.id ? 'me' : m.senderId,
                  text: m.text,
                  timestamp: m.timestamp,
                  seen: m.seen,
                  type: m.type || 'text',
                  attachment: m.attachment,
                })).reverse(),
              };
            });
            localStorage.setItem('messages_cache', JSON.stringify({ conversations: mappedConvs, timestamp: Date.now() }));
          }

          if (stories) {
            localStorage.setItem('stories_cache', JSON.stringify({ stories, timestamp: Date.now() }));
          }
        }
      } catch (e) {
        console.error('Failed to load nav data', e);
      }
    }
    loadData();
    const interval = setInterval(loadData, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [pathname]);

  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-nav-container">
        {navItems.map((item) => {
          let href = item.href;
          
          // CRITICAL: Ensure the Profile link is ALWAYS direct and never depends on a slow redirect
          if (href === '/profile') {
            const storedId = typeof window !== 'undefined' ? (currentUserId || localStorage.getItem('proxypress_user_id')) : null;
            if (storedId) {
              href = `/profile/${storedId}`;
            }
          }

          const isActive = item.href === '/' 
            ? pathname === '/' 
            : pathname.startsWith(item.href) || (item.href === '/profile' && pathname.includes('/profile/'));

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
