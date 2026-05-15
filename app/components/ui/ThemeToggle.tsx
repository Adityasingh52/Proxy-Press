'use client';

import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('proxy-press-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = stored === 'dark' || (!stored && prefersDark);
    
    setIsDark(shouldBeDark);
    
    // Only toggle if necessary to avoid disrupting the blocking script's work
    if (shouldBeDark && !document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.add('dark');
    } else if (!shouldBeDark && document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('proxy-press-theme', next ? 'dark' : 'light');
    
    // Update the lock style if it exists
    const lockStyle = document.getElementById('theme-lock-style');
    if (lockStyle) {
      const nextBg = next ? '#0F172A' : '#F8FAFC';
      lockStyle.innerHTML = `html, body { background-color: ${nextBg} !important; }`;
    }
  };

  if (!mounted) {
    return (
      <div className="theme-toggle-placeholder" style={{ width: '40px', height: '40px' }} />
    );
  }

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggle}
      className={`theme-toggle ${isDark ? 'dark-mode' : ''}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <span className="theme-toggle-thumb" />
    </button>
  );
}
