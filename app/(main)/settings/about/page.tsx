'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import '../settings.css';

export default function AboutSettingsPage() {
  useEffect(() => {
    const main = document.getElementById('main-content');
    if (main) {
      main.classList.add('no-top-padding');
    }
    return () => {
      if (main) main.classList.remove('no-top-padding');
    };
  }, []);

  const aboutItems = [
    {
      label: 'App Details',
      sub: 'Story, features and uniqueness',
      href: '/settings/about/app-details',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      )
    },
    {
      label: 'Terms of Service',
      sub: 'Status: Coming Soon',
      isDisabled: true,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
        </svg>
      )
    },
    {
      label: 'Privacy Policy',
      sub: 'Status: Coming Soon',
      isDisabled: true,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      )
    },
    {
      label: 'Open Source Licenses',
      sub: 'Status: Coming Soon',
      isDisabled: true,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 7h-9l-3-3H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
        </svg>
      )
    }
  ];

  return (
    <div className="settings-container">
      <div className="settings-header">
        <Link href="/settings" className="settings-back-btn">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </Link>
        <h1 className="settings-title">About</h1>
      </div>

      <div className="settings-content">
        <div className="settings-group">
          <div className="settings-list">
            {aboutItems.map((item, i) => (
              item.isDisabled ? (
                <div key={i} className="settings-item" style={{ opacity: 0.6, cursor: 'default' }}>
                  <div className="settings-item-content">
                    <div className="settings-item-icon">
                      {item.icon}
                    </div>
                    <div className="settings-item-text">
                      <span className="settings-item-label">{item.label}</span>
                      <span className="settings-item-sub">{item.sub}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <Link key={i} href={item.href!} className="settings-item">
                  <div className="settings-item-content">
                    <div className="settings-item-icon">
                      {item.icon}
                    </div>
                    <div className="settings-item-text">
                      <span className="settings-item-label">{item.label}</span>
                      <span className="settings-item-sub">{item.sub}</span>
                    </div>
                  </div>
                  <div className="settings-chevron">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                </Link>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
