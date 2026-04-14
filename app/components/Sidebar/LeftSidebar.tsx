'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { currentUser as initialUser, Author } from '@/lib/data';
import ThemeToggle from '../ui/ThemeToggle';

const navItems = [
  {
    href: '/',
    label: 'Home',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: '/explore',
    label: 'Explore',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    href: '/events',
    label: 'Events',
    badge: 2,
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: '/create',
    label: 'Post Story',
    icon: (_active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
    isCreate: true,
  },
  {
    href: '/notifications',
    label: 'Notifications',
    badge: 4,
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function LeftSidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<Author>(initialUser);

  useEffect(() => {
    // Initial load
    const loadUser = () => {
      const savedUser = localStorage.getItem('proxy_press_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error('Failed to parse saved user', e);
        }
      }
    };

    loadUser();

    // Custom event listener for updates within the same tab
    window.addEventListener('profileUpdate', loadUser);
    
    // Cross-tab storage event listener
    window.addEventListener('storage', (e) => {
      if (e.key === 'proxy_press_user') loadUser();
    });

    return () => {
      window.removeEventListener('profileUpdate', loadUser);
      window.removeEventListener('storage', loadUser);
    };
  }, []);

  const isImage = user.avatar.startsWith('data:') || user.avatar.startsWith('http') || user.avatar.startsWith('/');

  return (
    <aside className="left-sidebar" id="left-sidebar">
      {/* Logo */}
      <div style={{ marginBottom: '32px', padding: '0 6px' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--primary), #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', flexShrink: 0,
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
          }}>
            📰
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
              Proxy<span style={{ color: 'var(--primary)' }}>Press</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-subtle)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>Digital University Hub</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        <div className="section-label" style={{ padding: '0 14px', marginBottom: '8px' }}>Menu</div>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`nav-item ${isActive ? 'active' : ''} ${item.isCreate ? 'create-btn-nav' : ''}`}
                  id={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                  style={item.isCreate ? {
                    background: 'linear-gradient(135deg, var(--primary), #8B5CF6)',
                    color: '#fff',
                    marginTop: '8px',
                    marginBottom: '8px',
                    boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)'
                  } : {}}
                >
                  <span className="nav-icon" style={{ transition: 'transform 0.2s ease' }}>
                    {item.icon(isActive)}
                  </span>
                  <span>{item.label}</span>
                  {item.badge && !isActive && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px' }}>
        {/* Dark mode toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', marginBottom: '16px', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
            </svg>
            Dark Mode
          </div>
          <ThemeToggle />
        </div>

        {/* Current user */}
        <Link href="/profile" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
            borderRadius: 'var(--radius-lg)', transition: 'all var(--transition-base)',
            cursor: 'pointer', border: '1px solid transparent'
          }}
            className="profile-nav-item"
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
          >
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), #8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: !isImage ? '18px' : '0', 
              flexShrink: 0,
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {!isImage ? (
                <span>{user.avatar}</span>
              ) : (
                <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Verified Student</div>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
