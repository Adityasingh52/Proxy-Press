'use client';

import { useEffect, useState } from 'react';
import { getAllPostsAdmin, adminDeletePost } from '@/lib/actions';
import Link from 'next/link';
import { Suspense } from 'react';
import '../../settings/settings.css';
import './admin-posts.css';

export default function AdminPostsPage() {
  return (
    <Suspense fallback={null}>
      <AdminPostsContent />
    </Suspense>
  );
}

function AdminPostsContent() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  async function loadPosts() {
    try {
      const data = await getAllPostsAdmin();
      setPosts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
    
    const main = document.getElementById('main-content');
    if (main) {
      main.classList.add('no-top-padding');
    }
    return () => {
      if (main) main.classList.remove('no-top-padding');
    };
  }, []);

  const handleDelete = async (postId: string) => {
    if (!deleteReason.trim()) return;
    setIsDeleting(true);
    try {
      await adminDeletePost(postId, deleteReason);
      setDeletingId(null);
      setDeleteReason('');
      await loadPosts();
    } catch (err) {
      alert('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.author?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="settings-container">
        <div className="admin-posts-loading" style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="posts-spinner"></div>
          <p style={{ marginTop: '20px', color: 'var(--text-muted)', fontWeight: 600 }}>Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="settings-container">
        <div className="admin-posts-error" style={{ textAlign: 'center', padding: '40px', background: 'var(--surface)', borderRadius: '24px', border: '1.5px solid var(--border)', marginTop: '40px' }}>
          <div className="error-icon" style={{ fontSize: '40px', marginBottom: '16px' }}>🚫</div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{error}</p>
          <Link href="/" className="settings-item" style={{ justifyContent: 'center', borderRadius: '12px' }}>Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <Link href="/admin" className="settings-back-btn">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
          <h1 className="settings-title">Post Control</h1>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            background: 'var(--primary-light)', 
            color: 'var(--primary)', 
            padding: '2px 10px', 
            borderRadius: '12px', 
            fontSize: '10px', 
            fontWeight: 800, 
            letterSpacing: '0.05em', 
            textTransform: 'uppercase',
            marginTop: '2px'
          }}>
            {posts.length} Total
          </div>
        </div>
      </div>

      <div className="settings-content">
        <div style={{ padding: '0 4px', marginBottom: '24px' }}>
          
          <div className="posts-search-bar" style={{ 
            position: 'relative',
            marginTop: '8px'
          }}>
            <div style={{ 
              position: 'absolute', 
              left: '14px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search posts or authors..."
              className="settings-input"
              style={{
                width: '100%',
                height: '46px',
                background: 'var(--surface-2)',
                border: '1.5px solid var(--border)',
                borderRadius: '16px',
                padding: '0 12px 0 44px',
                fontSize: '15px',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'all 0.2s',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.background = 'var(--surface)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.background = 'var(--surface-2)';
              }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="posts-list">
          {filteredPosts.length === 0 ? (
            <div className="posts-empty" style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--surface)', borderRadius: '24px', border: '1.5px solid var(--border)' }}>
              <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>No posts found matching "{searchQuery}"</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="post-control-card">
                <Link href={`/article/${post.slug}`} className="post-card-left-link">
                  <div className="post-card-left">
                    {post.imageUrl && (
                      <div className="post-thumb">
                        <img src={post.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div className="post-card-info">
                      <h3 className="post-card-title">{post.title}</h3>
                      <div className="post-card-meta">
                        <span className="post-card-author">
                          by {post.author?.name || 'Unknown'}
                        </span>
                        <span className="post-card-dot">•</span>
                        <span className="post-card-date">
                          {new Date(post.publishedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                        {post.category && (
                          <>
                            <span className="post-card-dot">•</span>
                            <span className="post-card-cat">{post.category}</span>
                          </>
                        )}
                      </div>
                      <div className="post-card-stats">
                        <span>❤️ {post.likes || 0}</span>
                        <span>💬 {post.comments || 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="post-card-actions">
                  {deletingId === post.id ? (
                    <div className="delete-confirm-panel">
                      <p className="delete-warning">⚠️ This action cannot be undone. The author will be notified.</p>
                      <textarea
                        autoFocus
                        placeholder="Reason for removal (shown to the user)..."
                        value={deleteReason}
                        onChange={e => setDeleteReason(e.target.value)}
                        style={{
                          width: '100%',
                          minHeight: '80px',
                          background: 'var(--surface-2)',
                          border: '1.5px solid var(--border)',
                          borderRadius: '12px',
                          padding: '12px',
                          fontSize: '14px',
                          color: 'var(--text-primary)',
                          resize: 'none',
                          marginTop: '8px',
                          marginBottom: '8px',
                          outline: 'none',
                          fontFamily: 'inherit'
                        }}
                      />
                      <div className="delete-confirm-btns">
                        <button
                          className="btn-cancel-delete"
                          onClick={() => { setDeletingId(null); setDeleteReason(''); }}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn-confirm-delete"
                          disabled={isDeleting || !deleteReason.trim()}
                          onClick={() => handleDelete(post.id)}
                        >
                          {isDeleting ? 'Deleting...' : 'Delete Post'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="btn-delete-post"
                      onClick={() => setDeletingId(post.id)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14H7L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                      </svg>
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
