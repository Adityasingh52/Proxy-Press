'use client';

import { useState } from 'react';
import Link from 'next/link';
import { categories, trendingTopics, announcements } from '@/lib/data';

export default function RightSidebar() {
  const [voted, setVoted] = useState(false);
  const [pollVotes, setPollVotes] = useState([42, 28, 30]); // Example percentages

  const handleVote = (idx: number) => {
    setVoted(true);
    // In a real app, you'd increment votes here
  };

  return (
    <aside className="right-sidebar" id="right-sidebar">

      {/* Campus Poll of the Week */}
      <section style={{ 
        marginBottom: '28px', 
        padding: '20px', 
        background: 'linear-gradient(135deg, var(--primary), #8B5CF6)', 
        borderRadius: 'var(--radius-lg)',
        color: '#fff',
        boxShadow: 'var(--shadow-md)'
      }}>
        <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📊 Campus Poll
        </h3>
        <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', lineHeight: 1.4 }}>
          What should be the theme for this year's Cultural Fest?
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {['Retro 80s', 'Cyberpunk', 'Eco-Future'].map((option, idx) => (
            <button
              key={option}
              onClick={() => handleVote(idx)}
              disabled={voted}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: voted ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                textAlign: 'left',
                cursor: voted ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between' }}>
                <span>{option}</span>
                {voted && <span>{pollVotes[idx]}%</span>}
              </div>
              {voted && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${pollVotes[idx]}%`,
                  background: 'rgba(255,255,255,0.2)',
                  zIndex: 0
                }} />
              )}
            </button>
          ))}
        </div>
        {voted && (
          <p style={{ fontSize: '11px', marginTop: '12px', opacity: 0.8, textAlign: 'center' }}>
            Thanks for voting! 1,240 students participated.
          </p>
        )}
      </section>

      {/* Student Resources Grid */}
      <section style={{ marginBottom: '28px' }}>
        <h3 style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          🛠️ Quick Resources
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { label: 'Lost & Found', icon: '🔍', color: '#F87171' },
            { label: 'Canteen Menu', icon: '🍔', color: '#FBBF24' },
            { label: 'Library Ops', icon: '📖', color: '#34D399' },
            { label: 'Admin Portal', icon: '🏢', color: '#60A5FA' },
          ].map(res => (
            <div key={res.label} style={{ 
              background: 'var(--surface)', 
              border: '1px solid var(--border)', 
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = res.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <span style={{ fontSize: '20px' }}>{res.icon}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'center' }}>{res.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Announcements */}
      <section style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
            📣 Notices
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>See all</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {announcements.map((ann) => (
            <div
              key={ann.id}
              id={`announcement-${ann.id}`}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: ann.type === 'alert'
                  ? 'rgba(239,68,68,0.06)'
                  : ann.type === 'warning'
                    ? 'rgba(245,158,11,0.06)'
                    : 'var(--surface-2)',
                borderLeft: `4px solid ${ann.type === 'alert' ? 'var(--accent)' : ann.type === 'warning' ? '#F59E0B' : 'var(--primary)'}`,
                cursor: 'pointer',
                transition: 'opacity var(--transition-fast)',
              }}
              className="announcement-item"
            >
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '4px' }}>
                {ann.text}
              </p>
              <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{ann.timeAgo}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Topics */}
      <section style={{ marginBottom: '28px' }}>
        <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '12px' }}>
          🔥 Student Buzz
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {trendingTopics.map((topic, i) => (
            <div key={topic.tag} className="trending-item" id={`trending-${i + 1}`}>
              <span className="trending-rank" style={{ color: i < 3 ? 'var(--primary)' : 'var(--text-subtle)' }}>{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {topic.tag}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{topic.posts.toLocaleString()} students talking</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer links */}
      <div style={{ marginTop: '32px', padding: '20px 0', borderTop: '2px dashed var(--border)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginBottom: '12px' }}>
          {['Campus Map', 'IT Support', 'Emergency', 'Health Center'].map(link => (
            <span key={link} className="footer-link" style={{ fontSize: '12px', fontWeight: 600 }}>
              {link}
            </span>
          ))}
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-subtle)', fontWeight: 500 }}>
          Made with ❤️ for University Campus Students
        </p>
      </div>
    </aside>
  );
}
