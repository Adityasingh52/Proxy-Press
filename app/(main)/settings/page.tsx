'use client';

import { useState } from 'react';

type Section = 'account' | 'notifications' | 'privacy' | 'display' | 'security' | 'about';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>('account');
  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
    mentions: true,
    announcements: true
  });

  const [appearance, setAppearance] = useState('system');

  const toggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const navItems = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy & Safety', icon: '🔒' },
    { id: 'display', label: 'Display & Theme', icon: '🎨' },
    { id: 'security', label: 'Security', icon: '🛡️' },
    { id: 'about', label: 'About', icon: 'ℹ️' },
  ];

  return (
    <div className="feed-container animate-fade-in" style={{ maxWidth: '900px', width: '100%' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: '8px' }}>
          Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          Customize your experience on Proxy-Press university hub.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '32px', alignItems: 'start' }}>
        {/* Sidebar Navigation */}
        <aside style={{ position: 'sticky', top: '100px' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as Section)}
                className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                style={{ 
                  border: 'none', 
                  background: activeSection === item.id ? 'var(--primary-light)' : 'transparent',
                  color: activeSection === item.id ? 'var(--primary)' : 'var(--text-secondary)',
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: activeSection === item.id ? 600 : 500,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div style={{ marginTop: '40px', padding: '16px', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, var(--primary), #8B5CF6)', color: 'white' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, opacity: 0.9, textTransform: 'uppercase', marginBottom: '8px' }}>PROXY PRO</p>
            <p style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Unlock Premium Campus Features</p>
            <button className="btn" style={{ background: 'white', color: 'var(--primary)', width: '100%', fontSize: '13px' }}>
              Upgrade Now
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="animate-fade-in" key={activeSection}>
          <div className="card" style={{ padding: '32px', minHeight: '500px' }}>
            
            {activeSection === 'account' && (
              <section>
                <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary)' }}>Account Information</h2>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', padding: '20px', borderRadius: 'var(--radius-lg)', background: 'var(--surface-2)' }}>
                  <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '32px' }}>AJ</div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Alex Johnson</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>alex.j@university.edu</p>
                    <button className="btn btn-ghost" style={{ marginTop: '12px', padding: '6px 12px', fontSize: '12px' }}>Edit Profile Photo</button>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Public Username</label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <input type="text" value="alexverified" disabled className="input-field" style={{ background: 'var(--surface-2)', cursor: 'not-allowed' }} />
                      <button className="btn btn-ghost">Change</button>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>University ID (Verified)</label>
                    <input type="text" value="U-2024-9982" disabled className="input-field" style={{ background: 'var(--surface-2)', cursor: 'not-allowed' }} />
                  </div>
                  <div style={{ marginTop: '12px', padding: '16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>Delete Account</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Permanently remove your account and all your data from the hub.</p>
                    <button style={{ color: 'var(--accent)', background: 'transparent', border: 'none', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Deactivate alexverified...</button>
                  </div>
                </div>
              </section>
            )}

            {activeSection === 'notifications' && (
              <section>
                <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Notifications</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>Choose which updates you want to stay informed about.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {(Object.keys(notifications) as Array<keyof typeof notifications>).map(key => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '24px', borderBottom: '1px solid var(--border-light)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                          {key} Notifications
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {key === 'push' && 'Receive real-time alerts on your browser or device.'}
                          {key === 'email' && 'Get daily recaps and important security updates via mail.'}
                          {key === 'mentions' && 'Notify when someone tags you in a post or comment.'}
                          {key === 'announcements' && 'Official campus news and event broadcasts.'}
                        </div>
                      </div>
                      <button 
                        onClick={() => toggle(key)}
                        style={{
                          width: '48px',
                          height: '26px',
                          borderRadius: '13px',
                          background: notifications[key] ? 'var(--primary)' : 'var(--border)',
                          position: 'relative',
                          cursor: 'pointer',
                          border: 'none',
                          transition: 'background 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          flexShrink: 0,
                          marginLeft: '24px'
                        }}
                      >
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#fff',
                          position: 'absolute',
                          top: '3px',
                          left: notifications[key] ? '25px' : '3px',
                          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeSection === 'privacy' && (
              <section>
                <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Privacy & Safety</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>Control your visibility and who can interact with you.</p>
                
                <div style={{ display: 'grid', gap: '24px' }}>
                  <div style={{ padding: '20px', borderRadius: 'var(--radius-lg)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Profile Visibility</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Choose who can see your campus activity and interests.</p>
                    </div>
                    <select className="select-field">
                      <option>Everyone (Public)</option>
                      <option>Followers only</option>
                      <option>Private</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 600 }}>Show Online Status</h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Let others see when you are active on the hub.</p>
                    </div>
                    <button className="btn btn-ghost" style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderColor: 'transparent' }}>Enabled</button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 600 }}>Message Requests</h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Filter messages from people you don't follow.</p>
                    </div>
                    <button className="btn btn-ghost">Configure</button>
                  </div>
                </div>
              </section>
            )}

            {activeSection === 'display' && (
              <section>
                <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Display & Theme</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>Personalize how Proxy-Press looks on your device.</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  {['Light', 'Dark', 'System'].map((mode) => (
                    <button 
                      key={mode}
                      onClick={() => setAppearance(mode.toLowerCase())}
                      style={{
                        padding: '24px 16px',
                        borderRadius: 'var(--radius-lg)',
                        border: appearance === mode.toLowerCase() ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                        background: appearance === mode.toLowerCase() ? 'var(--primary-light)' : 'var(--surface)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        background: mode === 'Dark' ? '#0F172A' : '#F8FAFC',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px'
                      }}>
                        {mode === 'Light' ? '☀️' : mode === 'Dark' ? '🌙' : '💻'}
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: appearance === mode.toLowerCase() ? 'var(--primary)' : 'var(--text-primary)' }}>{mode}</span>
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: '40px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Accent Color</h3>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {['#2563EB', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6'].map(color => (
                      <button 
                        key={color}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: color,
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {color === '#2563EB' && <span style={{ color: 'white' }}>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {activeSection === 'security' && (
              <section>
                <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Security</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>Keep your university account safe and secure.</p>
                
                <div style={{ display: 'grid', gap: '16px' }}>
                  <button className="btn btn-ghost" style={{ justifyContent: 'space-between', padding: '16px 20px', width: '100%', textAlign: 'left' }}>
                    <span>🔐 Change Password</span>
                    <span style={{ color: 'var(--text-subtle)' }}>→</span>
                  </button>
                  <button className="btn btn-ghost" style={{ justifyContent: 'space-between', padding: '16px 20px', width: '100%', textAlign: 'left' }}>
                    <span>📱 Two-Factor Authentication</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-light)', padding: '2px 8px', borderRadius: '4px' }}>OFF</span>
                  </button>
                  <button className="btn btn-ghost" style={{ justifyContent: 'space-between', padding: '16px 20px', width: '100%', textAlign: 'left' }}>
                    <span>💻 Active Sessions</span>
                    <span style={{ color: 'var(--text-subtle)' }}>3 devices →</span>
                  </button>
                </div>
              </section>
            )}

            {activeSection === 'about' && (
              <section style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛰️</div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Proxy-Press</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Version 2.4.0 (Build 33664)</p>
                
                <div style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>Check for Updates</button>
                  <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>Terms of Service</button>
                  <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>Privacy Policy</button>
                </div>
                
                <p style={{ marginTop: '48px', fontSize: '12px', color: 'var(--text-subtle)' }}>
                  Designed and developed for university excellence.<br />
                  © 2026 Proxy Digital Hub. All rights reserved.
                </p>
              </section>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
