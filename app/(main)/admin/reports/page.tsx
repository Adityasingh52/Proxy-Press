'use client';

import { useEffect, useState } from 'react';
import { getReportsAction, adminDeletePost } from '@/lib/actions';
import Link from 'next/link';
import '../../settings/settings.css';
import '../posts/admin-posts.css';
import './admin-reports.css';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<{ userReports: any[], postReports: any[] }>({ userReports: [], postReports: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'users'>('posts');
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadReports() {
    try {
      const data = await getReportsAction();
      setReports(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
    
    const main = document.getElementById('main-content');
    if (main) {
      main.classList.add('no-top-padding');
    }
    return () => {
      if (main) main.classList.remove('no-top-padding');
    };
  }, []);

  const handleDeletePost = async (postId: string) => {
    if (!deleteReason.trim()) return;
    setIsDeleting(true);
    try {
      await adminDeletePost(postId, deleteReason);
      setDeletingPostId(null);
      setDeleteReason('');
      await loadReports();
    } catch (err) {
      alert('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-container">
        <div className="admin-loading">
          <div className="spinner"></div>
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="settings-container">
        <div className="admin-error">
          <h2>Access Denied</h2>
          <p>{error}</p>
          <Link href="/" className="settings-item">Return Home</Link>
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
        <h1 className="settings-title">Reports Management</h1>
      </div>

      <div className="settings-content">
        {/* Tabs */}
        <div className="reports-tabs">
          <button 
            className={`reports-tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Post Reports ({reports.postReports.length})
          </button>
          <button 
            className={`reports-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            User Reports ({reports.userReports.length})
          </button>
        </div>

        <div className="reports-list">
          {activeTab === 'posts' ? (
            reports.postReports.length === 0 ? (
              <div className="empty-reports">No post reports found</div>
            ) : (
              reports.postReports.map((report) => (
                <div key={report.id} className="report-card">
                  <div className="report-meta">
                    <span className="report-reason-tag">{report.reason}</span>
                    <span className="report-date">{new Date(report.createdAt).toLocaleString()}</span>
                  </div>
                  
                  <div className="report-parties">
                    <div className="party">
                      <span className="party-label">Reporter:</span>
                      <Link href={`/profile/${report.reporter.username || report.reporter.id}`} className="party-link">
                        {report.reporter.name} (@{report.reporter.username})
                      </Link>
                    </div>
                  </div>

                  {report.post ? (
                    <div className="reported-content">
                      <div className="reported-post-brief">
                        <img src={report.post.imageUrl} alt="" className="post-thumb-mini" />
                        <div className="post-text-mini">
                          <Link href={`/article/${report.post.slug}`} className="post-title-link">{report.post.title}</Link>
                          <span className="post-author-mini">by {report.post.author?.name}</span>
                        </div>
                      </div>
                      
                      <div className="report-actions">
                        {deletingPostId === report.post.id ? (
                          <div className="confirm-removal">
                            <textarea 
                              placeholder="Reason for removal..."
                              value={deleteReason}
                              onChange={e => setDeleteReason(e.target.value)}
                            />
                            <div className="confirm-btns">
                              <button onClick={() => setDeletingPostId(null)}>Cancel</button>
                              <button 
                                className="danger" 
                                onClick={() => handleDeletePost(report.post.id)}
                                disabled={isDeleting || !deleteReason.trim()}
                              >
                                {isDeleting ? 'Removing...' : 'Confirm Remove'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button className="btn-remove-post" onClick={() => setDeletingPostId(report.post.id)}>
                            Remove Post
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="reported-content-deleted">This post has already been removed.</div>
                  )}
                </div>
              ))
            )
          ) : (
            reports.userReports.length === 0 ? (
              <div className="empty-reports">No user reports found</div>
            ) : (
              reports.userReports.map((report) => (
                <div key={report.id} className="report-card">
                  <div className="report-meta">
                    <span className="report-reason-tag">{report.reason}</span>
                    <span className="report-date">{new Date(report.createdAt).toLocaleString()}</span>
                  </div>
                  
                  <div className="report-parties">
                    <div className="party">
                      <span className="party-label">Reporter:</span>
                      <Link href={`/profile/${report.reporter.username || report.reporter.id}`} className="party-link">
                        {report.reporter.name} (@{report.reporter.username})
                      </Link>
                    </div>
                    <div className="party">
                      <span className="party-label">Target:</span>
                      <Link href={`/profile/${report.target.username || report.target.id}`} className="party-link target">
                        {report.target.name} (@{report.target.username})
                      </Link>
                    </div>
                  </div>

                  <div className="report-actions">
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Review user profile for moderation actions.</p>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}
