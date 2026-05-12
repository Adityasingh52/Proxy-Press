'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '../settings/settings.css';
import './admin.css';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      const u = await getCurrentUser();
      if (!u || u.role !== 'admin') {
        router.push('/');
        return;
      }
      setUser(u);
      setLoading(false);
    }
    checkAccess();

    const main = document.getElementById('main-content');
    if (main) {
      main.classList.add('no-top-padding');
    }
    return () => {
      if (main) main.classList.remove('no-top-padding');
    };
  }, [router]);

  if (loading) {
    return (
      <div className="admin-hub">
        <div className="admin-hub-loading">
          <div className="admin-spinner"></div>
          <p>Verifying access...</p>
        </div>
      </div>
    );
  }

  const sections = [
    {
      title: 'Feedback',
      desc: 'View and respond to user suggestions and bug reports',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
      href: '/admin/feedback',
    },
    {
      title: 'Post Control',
      desc: 'Review and moderate posts that violate guidelines',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
      href: '/admin/posts',
    },
    {
      title: 'Reports',
      desc: 'Review user and post reports for policy violations',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
      href: '/admin/reports',
    },
  ];

  return (
    <div className="settings-container">
      <div className="settings-header">
        <Link href="/settings" className="settings-back-btn">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </Link>
        <h1 className="settings-title">Admin Portal</h1>
      </div>

      <div className="settings-content">
        <div className="settings-group">
          <div className="settings-list">
            {sections.map((section, i) => (
              <Link key={i} href={section.href} className="settings-item">
                <div className="settings-item-content">
                  <div className="settings-item-icon">
                    {section.icon}
                  </div>
                  <div className="settings-item-text">
                    <span className="settings-item-label">{section.title}</span>
                    <span className="settings-item-sub">{section.desc}</span>
                  </div>
                </div>
                <div className="settings-chevron">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
