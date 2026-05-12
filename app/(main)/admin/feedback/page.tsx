'use client';

import { useEffect, useState } from 'react';
import { getFeedbackAction, replyToFeedback } from '@/lib/actions';
import Link from 'next/link';
import '../../settings/settings.css';
import './admin-feedback.css';

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  async function loadFeedback() {
    try {
      const data = await getFeedbackAction();
      setFeedback(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeedback();
    
    const main = document.getElementById('main-content');
    if (main) {
      main.classList.add('no-top-padding');
    }
    return () => {
      if (main) main.classList.remove('no-top-padding');
    };
  }, []);

  const handleReplySubmit = async (feedbackId: string) => {
    if (!replyText.trim()) return;
    setIsReplying(true);
    try {
      await replyToFeedback(feedbackId, replyText);
      setReplyingTo(null);
      setReplyText('');
      await loadFeedback(); // Refresh list
    } catch (err) {
      alert('Failed to send reply');
    } finally {
      setIsReplying(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-container">
        <div className="admin-loading" style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '20px', color: 'var(--text-muted)', fontWeight: 600 }}>Loading Feedback Portal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="settings-container">
        <div className="admin-error-card" style={{ textAlign: 'center', padding: '40px', background: 'var(--surface)', borderRadius: '24px', border: '1.5px solid var(--border)', marginTop: '40px' }}>
          <div className="error-icon" style={{ fontSize: '40px', marginBottom: '16px' }}>🚫</div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Admin Access Required</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{error}</p>
          <Link href="/" className="settings-item" style={{ justifyContent: 'center', borderRadius: '12px' }}>Return to Home</Link>
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
        <div>
          <h1 className="settings-title">Customer Insights</h1>
        </div>
      </div>

      <div className="settings-content">
        <div style={{ padding: '0 4px', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '12px' }}>
            {feedback.length} Submissions
          </div>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1.5 }}>
            Manage and respond to user suggestions and bug reports
          </p>
        </div>

        <div className="feedback-grid">
          {feedback.length === 0 ? (
            <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--surface)', borderRadius: '24px', border: '1.5px solid var(--border)' }}>
              <div className="empty-icon" style={{ fontSize: '40px', marginBottom: '16px' }}>📂</div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>No feedback yet</h3>
              <p style={{ color: 'var(--text-muted)' }}>Your users haven't submitted anything recently.</p>
            </div>
          ) : (
            feedback.map((item) => (
              <div key={item.id} className="feedback-card">
                <div className="card-top">
                  <span className={`badge badge-${item.type.toLowerCase()}`}>
                    {item.type === 'Bug' ? '🐞 ' : item.type === 'Suggestion' ? '💡 ' : '✨ '} {item.type}
                  </span>
                  <span className="timestamp">
                    {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <div className="card-content">
                  <p className="message">"{item.message}"</p>
                </div>

                <div className="card-footer">
                  {item.user ? (
                    <div className="user-profile">
                      <div className="avatar-small">{item.user.profilePicture ? (
                        <img src={item.user.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      ) : (item.user.avatar || '👤')}</div>
                      <div className="user-info">
                        <span className="name">{item.user.name}</span>
                        <span className="email">{item.user.email}</span>
                      </div>
                      <div style={{ flex: 1 }} />
                      {!item.reply && replyingTo !== item.id && (
                        <button 
                          className="btn-reply-trigger"
                          onClick={() => setReplyingTo(item.id)}
                        >
                          Reply
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="user-profile anonymous">
                      <div className="avatar-small">👻</div>
                      <span className="name">Anonymous User</span>
                    </div>
                  )}
                </div>

                {item.reply && (
                  <div className="reply-content">
                    <div className="reply-header">
                      <span className="reply-label">Your Response:</span>
                    </div>
                    <p className="reply-text">"{item.reply}"</p>
                  </div>
                )}

                {replyingTo === item.id && (
                  <div className="reply-form">
                    <textarea
                      autoFocus
                      placeholder="Type your response to the user..."
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                    />
                    <div className="reply-form-actions">
                      <button 
                        className="btn-cancel" 
                        onClick={() => { setReplyingTo(null); setReplyText(''); }}
                      >
                        Cancel
                      </button>
                      <button 
                        className="btn-send"
                        disabled={isReplying || !replyText.trim()}
                        onClick={() => handleReplySubmit(item.id)}
                      >
                        {isReplying ? 'Sending...' : 'Send Reply'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
