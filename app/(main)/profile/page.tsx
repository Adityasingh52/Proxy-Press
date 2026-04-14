'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { currentUser as initialUser, posts, Author } from '@/lib/data';
import EditProfileModal from '@/app/components/Profile/EditProfileModal';

const userPosts = posts.slice(0, 7);
const savedPosts = posts.filter(p => p.isSaved);

export default function ProfilePage() {
  const [user, setUser] = useState<Author>(initialUser);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('proxy_press_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
  }, []);

  const handleSaveProfile = (updatedData: Partial<Author>) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('proxy_press_user', JSON.stringify(newUser));
    // Notify other components (like sidebar) in the same tab
    window.dispatchEvent(new Event('profileUpdate'));
  };

  const isImage = user.avatar.startsWith('data:') || user.avatar.startsWith('http') || user.avatar.startsWith('/');

  return (
    <div className="feed-container animate-fade-in" style={{ maxWidth: '800px' }} id="profile-page">

      {/* Profile Dashboard Header */}
      <div className="card" style={{ 
        padding: '0', 
        marginBottom: '32px', 
        overflow: 'hidden',
        border: 'none',
        background: 'var(--surface)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Large Cover Area */}
        <div style={{
          height: '160px',
          background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 50%, #DB2777 100%)',
          position: 'relative'
        }}>
          {/* Glassmorphism Stats Overlay */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            backdropFilter: 'blur(12px)',
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 24px',
            display: 'flex',
            gap: '24px',
            color: '#fff'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 800 }}>{user.posts}</div>
              <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', opacity: 0.8 }}>Posts</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 800 }}>{user.followers.toLocaleString()}</div>
              <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', opacity: 0.8 }}>Followers</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 800 }}>{user.following.toLocaleString()}</div>
              <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', opacity: 0.8 }}>Following</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 32px 32px', marginTop: '-40px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: '120px', height: '120px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563EB, #8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: !isImage ? '48px' : '0', 
              border: '6px solid var(--surface)',
              flexShrink: 0, boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden'
            }}>
              {!isImage ? (
                user.avatar
              ) : (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              )}
            </div>

            <div style={{ flex: 1, paddingBottom: '12px', minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                  {user.name}
                </h1>
                <span style={{ 
                  padding: '4px 10px', background: 'var(--primary-light)', 
                  color: 'var(--primary)', borderRadius: 'var(--radius-full)', 
                  fontSize: '11px', fontWeight: 700 
                }}>
                  Verified Editor
                </span>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>
                @{user.name.toLowerCase().replace(' ', '')} · {user.college}
              </p>
            </div>

            {/* Edit button */}
            <button
              id="edit-profile-btn"
              className="btn btn-primary"
              style={{ fontSize: '13px', padding: '10px 24px', alignSelf: 'center' }}
              onClick={() => setIsEditModalOpen(true)}
            >
              ✏️ Edit Dashboard
            </button>
          </div>

          {/* Bio */}
          <div style={{ marginTop: '24px', maxWidth: '600px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
              About Me
            </h3>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {user.bio}
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
          My Contributions
        </h2>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
          {userPosts.length} Stories Published
        </div>
      </div>

      {/* Post Grid */}
      {userPosts.length > 0 ? (
        <div className="profile-grid" id="profile-grid" style={{ gap: '12px' }}>
          {userPosts.map(post => (
            <Link
              key={post.id}
              href={`/article/${post.slug}`}
              className="profile-grid-item"
              id={`grid-post-${post.id}`}
              style={{ textDecoration: 'none', borderRadius: 'var(--radius-md)' }}
            >
              <img
                src={post.imageUrl}
                alt={post.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
                onError={e => {
                  const t = e.currentTarget as HTMLImageElement;
                  t.style.display = 'none';
                  const fb = t.nextElementSibling as HTMLElement | null;
                  if (fb) fb.style.display = 'flex';
                }}
              />
              <div style={{
                display: 'none', width: '100%', height: '100%',
                background: post.imageColor || 'var(--surface-2)',
                alignItems: 'center', justifyContent: 'center', fontSize: '32px',
              }}
                className="profile-grid-fallback"
              >
                📰
              </div>
              <div className="profile-grid-overlay" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
                  <span>❤️ {post.likes >= 1000 ? `${(post.likes / 1000).toFixed(1)}k` : post.likes}</span>
                  <span>💬 {post.comments}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', borderStyle: 'dashed' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📰</div>
          <p style={{ fontWeight: 600 }}>No stories published yet</p>
          <Link href="/create" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '14px', marginTop: '8px', display: 'inline-block' }}>
            Start your first story →
          </Link>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        user={user}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
