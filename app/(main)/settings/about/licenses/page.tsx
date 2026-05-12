'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import '../../settings.css';

export default function LicensesPage() {
  useEffect(() => {
    const main = document.getElementById('main-content');
    if (main) {
      main.classList.add('no-top-padding');
    }
    return () => {
      if (main) main.classList.remove('no-top-padding');
    };
  }, []);

  const licenses = [
    {
      name: 'Next.js',
      version: '16.2.3',
      license: 'MIT',
      copyright: 'Copyright (c) 2026 Vercel, Inc.',
      url: 'https://github.com/vercel/next.js'
    },
    {
      name: 'React',
      version: '19.2.4',
      license: 'MIT',
      copyright: 'Copyright (c) Meta Platforms, Inc. and affiliates.',
      url: 'https://github.com/facebook/react'
    },
    {
      name: 'Drizzle ORM',
      version: '0.45.2',
      license: 'Apache-2.0',
      copyright: 'Copyright (c) 2026 Drizzle UI',
      url: 'https://github.com/drizzle-team/drizzle-orm'
    },
    {
      name: 'Supabase',
      version: 'Latest',
      license: 'MIT',
      copyright: 'Copyright (c) 2026 Supabase, Inc.',
      url: 'https://github.com/supabase/supabase'
    },
    {
      name: 'Cloudinary',
      version: 'Latest',
      license: 'MIT',
      copyright: 'Copyright (c) 2026 Cloudinary Ltd.',
      url: 'https://github.com/cloudinary/cloudinary_npm'
    },
    {
      name: 'Tailwind CSS',
      version: '4.0.0',
      license: 'MIT',
      copyright: 'Copyright (c) Tailwind Labs, Inc.',
      url: 'https://github.com/tailwindlabs/tailwindcss'
    },
    {
      name: 'Lucide React',
      version: 'Latest',
      license: 'ISC',
      copyright: 'Copyright (c) 2026 Lucide Contributors',
      url: 'https://github.com/lucide-dev/lucide'
    }
  ];

  return (
    <div className="settings-container">
      <div className="settings-header">
        <Link href="/settings/about" className="settings-back-btn">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </Link>
        <h1 className="settings-title">Licenses</h1>
      </div>

      <div className="settings-content">
        <div className="about-intro-section">
          <p className="about-intro-text">
            Proxy-Press is built with the help of several amazing open source projects. Below are the licenses for the major libraries used in this application.
          </p>
        </div>

        <div className="settings-group">
          <div className="settings-list">
            {licenses.map((lib, i) => (
              <div key={i} className="settings-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span className="settings-item-label">{lib.name} <span style={{ color: 'var(--text-subtle)', fontSize: '12px', fontWeight: 'normal' }}>{lib.version}</span></span>
                  <span className="theme-selector-pill" style={{ padding: '4px 10px', fontSize: '11px' }}>{lib.license}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {lib.copyright}
                </div>
                <Link 
                  href={lib.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ fontSize: '12px', color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}
                >
                  View Repository
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="about-footer">
          <p className="about-credits">Handcrafted with respect for the open source community.</p>
        </div>
      </div>
    </div>
  );
}
