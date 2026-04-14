'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
    mentions: true
  });

  const toggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="feed-container animate-fade-in" style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.8px' }}>
          Settings ⚙️
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Manage your account preferences and application settings.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Account Section */}
        <section className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            👤 Account Information
          </h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '8px' }}>Email Address</label>
              <input type="email" value="alex.j@university.edu" disabled className="input-field" style={{ opacity: 0.7, cursor: 'not-allowed' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '8px' }}>Username</label>
              <input type="text" value="alexverified" disabled className="input-field" style={{ opacity: 0.7, cursor: 'not-allowed' }} />
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔔 Notification Preferences
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(Object.keys(notifications) as Array<keyof typeof notifications>).map(key => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                    {key} Notifications
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Receive alerts for {key} activities on the platform.
                  </div>
                </div>
                <button 
                  onClick={() => toggle(key)}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: notifications[key] ? 'var(--primary)' : 'var(--border)',
                    position: 'relative',
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'background 0.3s ease'
                  }}
                >
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#fff',
                    position: 'absolute',
                    top: '3px',
                    left: notifications[key] ? '23px' : '3px',
                    transition: 'left 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy Section */}
        <section className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔒 Privacy & Security
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="btn btn-ghost" style={{ justifyContent: 'space-between', width: '100%', padding: '12px 16px' }}>
              Change Password <span>→</span>
            </button>
            <button className="btn btn-ghost" style={{ justifyContent: 'space-between', width: '100%', padding: '12px 16px' }}>
              Two-Factor Authentication <span>Off</span>
            </button>
            <button className="btn btn-ghost" style={{ justifyContent: 'space-between', width: '100%', padding: '12px 16px', color: 'var(--accent)' }}>
              Deactivate Account
            </button>
          </div>
        </section>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
            Proxy Dashboard Version 2.4.0 (Stable) <br />
            © 2026 University Digital Hub
          </p>
        </div>
      </div>
    </div>
  );
}
