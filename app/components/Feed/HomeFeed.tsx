'use client';

import { useState } from 'react';
import Link from 'next/link';
import { posts, categories } from '@/lib/data';
import StoriesRow from './StoriesRow';
import PostCard from './PostCard';

export default function HomeFeed() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div className="feed-container" id="home-feed">
      {/* Page header & Search Bar */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: 800, 
              color: 'var(--text-primary)', 
              letterSpacing: '-0.8px',
              background: 'linear-gradient(to right, var(--text-primary), var(--primary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Proxy Dashboard
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 500 }}>
              Stay updated with the pulse of your campus.
            </p>
          </div>
          <Link href="/settings" className="btn-icon" style={{ background: 'var(--surface)', border: '1px solid var(--border)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ⚙️
          </Link>
        </div>

        {/* Modern Search Bar */}
        <div style={{ 
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: 'var(--surface)',
          border: '1.5px solid',
          borderColor: isSearchFocused ? 'var(--primary)' : 'var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2px 6px 2px 14px',
          boxShadow: isSearchFocused ? '0 0 0 4px rgba(37, 99, 235, 0.1)' : 'var(--shadow-sm)',
          transition: 'all 0.3s ease'
        }}>
          <span style={{ fontSize: '16px', marginRight: '10px', opacity: 0.6 }}>🔍</span>
          <input 
            type="text" 
            placeholder="Search stories, events, or campus news..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              padding: '12px 0',
              fontSize: '14px',
              fontWeight: 500,
              background: 'transparent',
              color: 'var(--text-primary)'
            }}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', fontSize: '14px', cursor: 'pointer', padding: '8px', opacity: 0.6 }}
            >
              ✖
            </button>
          )}
        </div>
      </div>

      {/* Stories */}
      <StoriesRow />

      {/* Category Filter Chips */}
      <div className="h-scroll" style={{ gap: '10px', marginBottom: '24px', padding: '4px 0' }}>
        <button className="category-pill active">All Posts</button>
        {categories.map(cat => (
          <button key={cat.name} className="category-pill" id={`filter-${cat.name.toLowerCase()}`}>
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      {/* Post feed */}
      <div id="posts-feed" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {posts.map((post, idx) => (
          <PostCard key={post.id} post={post} index={idx} />
        ))}
      </div>

      {/* Load more indicator */}
      <div style={{ textAlign: 'center', padding: '48px 0 32px', color: 'var(--text-subtle)', fontSize: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', opacity: 0.6 }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', animation: 'badge-pulse 1.5s infinite' }} />
          You're all caught up for today!
        </div>
      </div>
    </div>
  );
}
