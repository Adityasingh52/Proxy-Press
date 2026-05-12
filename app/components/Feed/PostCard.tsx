'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Post } from '@/lib/data';
import { togglePostLike, togglePostSave, getCurrentUser, reportPost } from '@/lib/actions';
import './PostCard.css';

const categoryColors: Record<string, string> = {
  Events: '#7C3AED',
  Notices: '#F59E0B',
  Sports: '#10B981',
  Academic: '#3B82F6',
  Clubs: '#EC4899',
  Exams: '#F43F5E',
  News: '#6366F1',
  'College Daily Update': '#14B8A6',
  Others: '#94A3B8',
};

const categoryEmojis: Record<string, string> = {
  Events: '🎉',
  Notices: '📢',
  Sports: '⚽',
  Academic: '📚',
  Clubs: '🎭',
  Exams: '📝',
  News: '📰',
  'College Daily Update': '🗓️',
  Others: '✨',
};

const REPORT_REASONS = [
  'Inappropriate content',
  'Spam or misleading',
  'Harassment or bullying',
  'Violence or harmful behavior',
  'Hate speech',
  'Intellectual property violation',
  'Other',
];

interface PostCardProps {
  post: Post;
  index?: number;
  variant?: 'hero' | 'compact';
}

export default function PostCard({ post, index = 0, variant = 'compact' }: PostCardProps) {
  const [liked, setLiked] = useState<boolean>(post.isLiked ?? false);
  const [saved, setSaved] = useState<boolean>(post.isSaved ?? false);
  const [likeCount, setLikeCount] = useState(post.likes ?? 0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showShareFeedback, setShowShareFeedback] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'danger' } | null>(null);

  useEffect(() => {
    setLiked(!!post.isLiked);
    setSaved(!!post.isSaved);
    setLikeCount(post.likes ?? 0);
  }, [post.isLiked, post.isSaved, post.likes]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1);
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      await togglePostLike(post.id, user.id);
    } catch (err) {
      console.error('Failed to toggle like:', err);
      setLiked(!newLiked);
      setLikeCount(prev => !newLiked ? prev + 1 : prev - 1);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newSaved = !saved;
    setSaved(newSaved);
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      await togglePostSave(post.id, user.id);
    } catch (err) {
      console.error('Failed to toggle save:', err);
      setSaved(!newSaved);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const postUrl = `${window.location.origin}/article/${post.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, text: post.description, url: postUrl });
      } else {
        await navigator.clipboard.writeText(postUrl);
        setShowShareFeedback(true);
        setTimeout(() => setShowShareFeedback(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleReport = async () => {
    if (!reportReason) return;
    setIsReporting(true);
    try {
      const result = await reportPost(post.id, reportReason);
      if (result.success) {
        setToast({ message: 'Report submitted. Thank you for helping us keep ProxyPress safe.', type: 'info' });
        setShowReportModal(false);
        setReportReason('');
      } else {
        setToast({ message: 'Failed to submit report. Please try again.', type: 'danger' });
      }
    } catch (err) {
      console.error('Error reporting post:', err);
      setToast({ message: 'An error occurred. Please try again.', type: 'danger' });
    } finally {
      setIsReporting(false);
    }
  };

  const catColor = categoryColors[post.category] ?? '#6366F1';
  const videoUrl = (post as any).videoUrl || (post.imageUrl?.match(/\.(mp4|webm|mov|ogg)$|^data:video/i) ? post.imageUrl : null);

  // Resolve avatar
  const authorUser = post.author as any;
  const picUrl = authorUser.profilePicture || authorUser.image;
  const avatarSrc = (picUrl && (picUrl.startsWith('http') || picUrl.startsWith('/') || picUrl.startsWith('data:')))
    ? picUrl
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(authorUser.name)}&background=random&color=fff&size=64`;

  // ═══ MENU DROPDOWN (shared between both variants) ═══
  const menuDropdown = menuOpen && (
    <div className="menu-dropdown" id={`post-dropdown-${post.id}`}>
      <div className="menu-item" onClick={() => { navigator.clipboard?.writeText(window.location.origin + `/article/${post.slug}`); setMenuOpen(false); }}>
        <span>🔗</span> Copy link
      </div>
      <Link href={`/profile/${post.authorId || post.author.id}`} className="menu-item" style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
        <span>👤</span> View Profile
      </Link>
      <div className="menu-item danger" onClick={() => { setMenuOpen(false); setShowReportModal(true); }}>
        <span>🚩</span> Report
      </div>
    </div>
  );

  // ═══════════════════════════════════
  //  HERO VARIANT — Large featured card
  // ═══════════════════════════════════
  if (variant === 'hero') {
    return (
      <>
        <Link href={`/article/${post.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
          <article
            className="news-card-hero"
            id={`post-${post.id}`}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            {/* Media */}
            {videoUrl ? (
              <video
                src={videoUrl}
                poster={post.imageUrl}
                className="news-hero-media"
                autoPlay muted loop playsInline
                controlsList="nodownload noplaybackrate nofullscreen"
                disablePictureInPicture
              />
            ) : (
              <img
                src={post.imageUrl}
                alt={post.title}
                className="news-hero-media"
                loading="lazy"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            )}

            {/* Overlay */}
            <div className="news-hero-overlay">
              <span className="news-hero-category" style={{ background: catColor, color: '#fff' }}>
                {categoryEmojis[post.category]} {post.category}
              </span>
              <h2 className="news-hero-title">{post.title}</h2>
              {post.description && <p className="news-hero-desc">{post.description}</p>}
              <div className="news-hero-meta">
                <div className="news-hero-meta-avatar">
                  <img src={avatarSrc} alt={post.author.name} />
                </div>
                <span className="news-hero-meta-text">
                  <strong>{post.author.name}</strong> · {post.author.college} · {post.timeAgo}
                </span>
              </div>
            </div>

            {/* Floating actions */}
            <div className="news-hero-actions" onClick={(e) => e.preventDefault()}>
              <button className={`news-glass-btn ${liked ? 'liked' : ''}`} onClick={handleLike} aria-label="Like">
                <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
              <button className={`news-glass-btn ${saved ? 'saved' : ''}`} onClick={handleSave} aria-label="Save">
                <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </button>
              <div style={{ position: 'relative' }}>
                <button className="news-menu-btn glass" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(o => !o); }} onBlur={() => setTimeout(() => setMenuOpen(false), 150)} aria-label="More options">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                  </svg>
                </button>
                {menuDropdown}
              </div>
            </div>
          </article>
        </Link>

        {renderModals()}
      </>
    );
  }

  // ═══════════════════════════════════
  //  COMPACT VARIANT — List news item
  // ═══════════════════════════════════
  return (
    <>
      <article
        className="news-item"
        id={`post-${post.id}`}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* Text side */}
        <div className="news-item-body">
          {/* Top row: category + time */}
          <div className="news-item-top">
            <span className="news-item-category" style={{ background: `${catColor}18`, color: catColor }}>
              {categoryEmojis[post.category]} {post.category}
            </span>
            <span className="news-item-dot" />
            <span className="news-item-time">{post.timeAgo}</span>
          </div>

          {/* Title */}
          <Link href={`/article/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3 className="news-item-title">{post.title}</h3>
          </Link>

          {/* Description */}
          {post.description && (
            <p className="news-item-desc">{post.description}</p>
          )}

          {/* Bottom row: source + actions */}
          <div className="news-item-bottom">
            <Link href={`/profile/${post.authorId || post.author.id}`} className="news-item-source" style={{ textDecoration: 'none' }}>
              <div className="news-item-source-avatar">
                <img src={avatarSrc} alt={post.author.name} />
              </div>
              <span className="news-item-source-name">{post.author.name}</span>
            </Link>

            <div style={{ flex: 1 }} />

            <button className={`news-action-btn ${liked ? 'liked' : ''}`} onClick={handleLike} aria-label="Like">
              <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>

            <Link href={`/article/${post.slug}`} style={{ textDecoration: 'none' }}>
              <button className="news-action-btn" aria-label="Comments">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                {(post.comments ?? 0) > 0 && <span>{post.comments}</span>}
              </button>
            </Link>

            <button className={`news-action-btn share-btn ${showShareFeedback ? 'shared' : ''}`} onClick={handleShare} aria-label="Share">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </button>

            <button className={`news-action-btn ${saved ? 'saved' : ''}`} onClick={handleSave} aria-label="Save">
              <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>

            <div style={{ position: 'relative' }}>
              <button className="news-menu-btn" onClick={() => setMenuOpen(o => !o)} onBlur={() => setTimeout(() => setMenuOpen(false), 150)} aria-label="More options">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>
              {menuDropdown}
            </div>
          </div>
        </div>

        {/* Thumbnail */}
        {post.imageUrl && (
          <Link href={`/article/${post.slug}`} style={{ textDecoration: 'none' }}>
            <div className="news-item-thumb">
              {videoUrl ? (
                <video src={videoUrl} poster={post.imageUrl} muted playsInline />
              ) : (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  loading="lazy"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              )}
            </div>
          </Link>
        )}
      </article>

      {renderModals()}
    </>
  );

  // ═══ Modals & Toast (shared) ═══
  function renderModals() {
    return (
      <>
        {showReportModal && (
          <div className="report-modal-overlay" onClick={() => setShowReportModal(false)}>
            <div className="report-modal-content" onClick={e => e.stopPropagation()}>
              <div className="report-modal-header">
                <h3>Report Post</h3>
                <button className="close-btn" onClick={() => setShowReportModal(false)}>×</button>
              </div>
              <p className="report-modal-sub">Why are you reporting this post?</p>
              <div className="report-reasons-list">
                {REPORT_REASONS.map(reason => (
                  <button
                    key={reason}
                    className={`report-reason-item ${reportReason === reason ? 'active' : ''}`}
                    onClick={() => setReportReason(reason)}
                  >
                    {reason}
                    {reportReason === reason && <span className="check-icon">✓</span>}
                  </button>
                ))}
              </div>
              <div className="report-modal-actions">
                <button className="btn-cancel" onClick={() => setShowReportModal(false)}>Cancel</button>
                <button className="btn-submit" disabled={!reportReason || isReporting} onClick={handleReport}>
                  {isReporting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div className={`toast-message ${toast.type}`}>
            <div className="toast-icon">
              {toast.type === 'info' && 'ℹ️'}
              {toast.type === 'danger' && '⚠️'}
              {toast.type === 'success' && '✅'}
            </div>
            <span className="toast-text">{toast.message}</span>
          </div>
        )}
      </>
    );
  }
}
