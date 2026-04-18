'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import '../../settings.css';

export default function AppDetailsPage() {
  useEffect(() => {
    const main = document.getElementById('main-content');
    if (main) {
      main.classList.add('no-top-padding');
    }
    return () => {
      if (main) main.classList.remove('no-top-padding');
    };
  }, []);

  const features = [
    {
      title: 'Real-time Updates',
      desc: 'Instant notifications for college news and events.',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      )
    },
    {
      title: 'Vanish Mode',
      desc: 'Keep your private conversations truly private.',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      )
    },
    {
      title: 'Community Driven',
      desc: 'Built by students, for students, to keep everyone connected.',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      )
    },
    {
      title: 'Premium UI',
      desc: 'A modern, mobile-native experience designed for speed.',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"/>
          <polyline points="2 17 12 22 22 17"/>
          <polyline points="2 12 12 17 22 12"/>
        </svg>
      )
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
        <h1 className="settings-title">App Details</h1>
      </div>

      <div className="settings-content">
        <div className="about-intro-section">
          <p className="about-intro-text">
            Discover the story of Proxy-Press a platform developed by two friends during their college life, built to bridge the communication gap on campus.
          </p>
        </div>

        <div className="about-story-section">
          <h3 className="about-story-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            Our Story
          </h3>
          <div className="about-story-text">
            In our college, we noticed a persistent problem: many students were failing to receive timely notifications about important news and events. 
            Information was fragmented and often arrived too late.
            <br /><br />
            Recognizing this gap, <b>Himanshu Raj</b> and <b>Aditya Singh</b> decided to take action. We envisioned a platform that would not just deliver news, but would truly connect people.
            <br /><br />
            <b>Proxy-Press</b> was born from this mission—to create a seamless, community-driven platform where every student stays updated and every voice can be heard.
          </div>
        </div>

        <div className="about-story-section">
          <h3 className="about-story-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Uniqueness & Features
          </h3>
          <div className="about-features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-card-icon">{f.icon}</div>
                <span className="feature-card-title">{f.title}</span>
                <p className="feature-card-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="about-footer">
          <span className="about-version">v1.0.0 (Beta)</span>
          <p className="about-credits">A student-run project developed during college life with ❤️</p>
        </div>
      </div>
    </div>
  );
}
