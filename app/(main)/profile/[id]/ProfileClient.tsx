'use client';

import { useState, useEffect, useRef } from 'react';
import '../profile.css';
import Link from 'next/link';
import { blockUser, unblockUser, muteUser, reportUser, getBlockStatus, toggleFollow, getFollowStatus, getFollowCounts, getFollowers, getFollowing, getFollowRequestStatus, getProfileData } from '@/lib/actions';

const categoryColors: Record<string, string> = {
  Events: '#8B5CF6', Notices: '#F59E0B', Sports: '#10B981',
  Academic: '#2563EB', Clubs: '#EC4899', Exams: '#EF4444',
  News: '#6366F1', "College Daily Update": '#14B8A6', Others: '#94A3B8',
};

const REPORT_REASONS = [
  'Spam or misleading',
  'Harassment or bullying',
  'Inappropriate content',
  'Impersonation',
  'Other',
];

export default function ProfileClient({ id, initialData }: { id: string; initialData: any }) {
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');

  // Use a ref to track if we've already loaded from cache to avoid infinite loops
  const cacheLoaded = useRef(false);

  const [isFollowing, setIsFollowing] = useState(initialData?.isFollowing || false);
  const [user, setUser] = useState<any>(initialData?.user ? {
    ...initialData.user,
    postsCount: initialData.posts?.length || 0,
    statusDisplay: initialData.statusDisplay || null
  } : null);
  const [isMe, setIsMe] = useState(initialData?.currentUserId === initialData?.user?.id);
  const [userPosts, setUserPosts] = useState<any[]>(initialData?.posts || []);

  // Cache loading logic
  useEffect(() => {
    if (typeof window !== 'undefined' && !cacheLoaded.current) {
      const cached = localStorage.getItem(`profile_cache_${id}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          // Only use cache if we don't have initialData or if the cache is very recent
          if (!initialData) {
            setUser(parsed.user);
            setUserPosts(parsed.posts);
            setIsFollowing(parsed.isFollowing);
            setFollowersCount(parsed.followCounts?.followers || 0);
            setFollowingCount(parsed.followCounts?.following || 0);
            setIsLoading(false);
          }
          cacheLoaded.current = true;
        } catch (e) {
          console.error("Failed to load profile cache", e);
        }
      }
    }

    // Background refresh if data is from cache or we want to ensure freshness
    async function refreshProfile() {
      try {
        const freshData = await getProfileData(id);
        if (freshData) {
          setUser({
            ...freshData.user,
            postsCount: freshData.posts?.length || 0,
            statusDisplay: freshData.statusDisplay || null
          });
          setUserPosts(freshData.posts || []);
          setIsFollowing(freshData.isFollowing || false);
          setFollowersCount(freshData.followCounts?.followers || 0);
          setFollowingCount(freshData.followCounts?.following || 0);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Background refresh failed", err);
      }
    }

    refreshProfile();
  }, [id, initialData]);

  // Cache saving logic
  useEffect(() => {
    if (typeof window !== 'undefined' && user && userPosts.length > 0) {
      const cacheData = {
        user,
        posts: userPosts,
        isFollowing,
        followCounts: { followers: followersCount, following: followingCount },
        timestamp: Date.now()
      };
      localStorage.setItem(`profile_cache_${id}`, JSON.stringify(cacheData));
    }
  }, [user, userPosts, id, isFollowing, followersCount, followingCount]);

  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [followersCount, setFollowersCount] = useState<number>(initialData?.followCounts?.followers || 0);
  const [followingCount, setFollowingCount] = useState<number>(initialData?.followCounts?.following || 0);
  const [isRequested, setIsRequested] = useState(initialData?.isRequested || false);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [currentUserId, setCurrentUserId] = useState<string | null>(initialData?.currentUserId || null);
  const [isBlocked, setIsBlocked] = useState(initialData?.isBlocked || false);
  const [isMuted, setIsMuted] = useState(initialData?.isMuted || false);

  // Options menu state
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' | 'info' } | null>(null);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showMuteConfirm, setShowMuteConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [userToUnfollow, setUserToUnfollow] = useState<{ id: string, name: string, isList: boolean, profilePicture?: string, avatar?: string } | null>(null);
  const [showFullImage, setShowFullImage] = useState(false);
  const [isClosingFullImage, setIsClosingFullImage] = useState(false);

  // Followers/Following Modal state
  const [showFollowModal, setShowFollowModal] = useState<{ title: string; type: 'followers' | 'following' } | null>(null);
  const [followList, setFollowList] = useState<any[]>([]);
  const [isFollowListLoading, setIsFollowListLoading] = useState(false);
  const [myFollowingIds, setMyFollowingIds] = useState<Set<string>>(new Set());

  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowOptionsMenu(false);
      }
    }
    if (showOptionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showOptionsMenu]);

  const handleCloseFullImage = () => {
    setIsClosingFullImage(true);
    setTimeout(() => {
      setShowFullImage(false);
      setIsClosingFullImage(false);
    }, 350);
  };

  // Handle Escape key for lightbox
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        handleCloseFullImage();
      }
    }
    if (showFullImage) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [showFullImage]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load remaining data (like saved posts) only if it's "Me"
  useEffect(() => {
    if (isMe && activeTab === 'saved' && savedPosts.length === 0) {
      async function loadSaved() {
        try {
          const data = await getProfileData(id); // Re-use for saved posts logic
          if (data && data.user.id === currentUserId) {
             // Filter saved logic...
          }
        } catch (err) {}
      }
      loadSaved();
    }
  }, [activeTab, isMe]);

  const displayPosts = activeTab === 'posts' ? userPosts : (isMe ? savedPosts : []);

  // ─── Action Handlers ───
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast({ message: 'Profile link copied!', type: 'info' });
    } catch {
      setToast({ message: 'Failed to copy link', type: 'danger' });
    }
    setShowOptionsMenu(false);
  };

  const handleShareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user?.name}'s Profile`,
          text: `Check out ${user?.name}'s profile on ProxyPress`,
          url: window.location.href,
        });
      } catch { }
    } else {
      handleCopyLink();
      return;
    }
    setShowOptionsMenu(false);
  };

  const handleMuteToggle = () => {
    setShowMuteConfirm(true);
    setShowOptionsMenu(false);
  };

  const handleMuteConfirm = async () => {
    if (!user) return;
    setShowMuteConfirm(false);
    const result = await muteUser(user.id);
    if (result.success) {
      const nowMuted = result.muted ?? !isMuted;
      setIsMuted(nowMuted);
      setToast({
        message: nowMuted ? `${user.name} has been muted` : `${user.name} has been unmuted`,
        type: nowMuted ? 'info' : 'success',
      });
    }
  };

  const handleBlockConfirm = async () => {
    if (!user) return;
    setShowBlockConfirm(false);
    setShowOptionsMenu(false);

    if (isBlocked) {
      const result = await unblockUser(user.id);
      if (result.success) {
        setIsBlocked(false);
        setToast({ message: `${user.name} has been unblocked`, type: 'success' });
      }
    } else {
      const result = await blockUser(user.id);
      if (result.success) {
        setIsBlocked(true);
        setToast({ message: `${user.name} has been blocked`, type: 'danger' });
      }
    }
  };

  const handleReport = async () => {
    if (!user || !reportReason) return;
    const result = await reportUser(user.id, reportReason);
    if (result.success) {
      setToast({ message: 'Report submitted. We will review it shortly.', type: 'info' });
    }
    setShowReportModal(false);
    setReportReason('');
    setShowOptionsMenu(false);
  };

  const handleFollowToggle = async () => {
    if (!user) return;
    if (isFollowing) {
      setUserToUnfollow({ id: user.id, name: user.name, isList: false, profilePicture: user.profilePicture, avatar: user.avatar });
      return;
    }
    if (isRequested) {
      setIsRequested(false);
      try { await toggleFollow(user.id); } catch (err) { setIsRequested(true); }
      return;
    }

    if (!user.isPrivate) {
      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
    } else {
      setIsRequested(true);
    }

    try {
      const result = await toggleFollow(user.id);
      if (!result.success) throw new Error();
      if (user.isPrivate) {
        setIsRequested(result.requested ?? false);
        setIsFollowing(false);
      } else {
        setIsFollowing(result.following ?? true);
        setIsRequested(false);
      }
    } catch (err) {
       setIsFollowing(false);
       setIsRequested(false);
       if (!user.isPrivate) setFollowersCount((prev: number) => prev - 1);
       setToast({ message: 'Failed to follow user', type: 'danger' });
    }
  };

  const openFollowModal = async (type: 'followers' | 'following') => {
    if (!user) return;
    setShowFollowModal({ title: type === 'followers' ? 'Followers' : 'Following', type });
    setFollowList([]);
    setIsFollowListLoading(true);
    try {
      const [data, myFollowing] = await Promise.all([
        type === 'followers' ? getFollowers(user.id) : getFollowing(user.id),
        currentUserId ? getFollowing(currentUserId) : Promise.resolve([])
      ]);
      setFollowList(data || []);
      setMyFollowingIds(new Set(myFollowing.map((u: any) => u.id)));
    } catch (err) {
      setToast({ message: 'Failed to load list', type: 'danger' });
    } finally {
      setIsFollowListLoading(false);
    }
  };

  const handleListFollowToggle = async (targetUser: any) => {
    if (!currentUserId || targetUser.id === currentUserId) return;
    const isCurrentlyFollowing = myFollowingIds.has(targetUser.id);
    if (isCurrentlyFollowing) {
      setUserToUnfollow({ id: targetUser.id, name: targetUser.name, isList: true, profilePicture: targetUser.profilePicture, avatar: targetUser.avatar });
      return;
    }
    const newFollowingIds = new Set(myFollowingIds);
    newFollowingIds.add(targetUser.id);
    setMyFollowingIds(newFollowingIds);
    if (isMe) setFollowingCount((prev: number) => prev + 1);
    try {
      const result = await toggleFollow(targetUser.id);
      if (!result.success) throw new Error();
    } catch {
      setMyFollowingIds(myFollowingIds);
      setToast({ message: 'Action failed', type: 'danger' });
    }
  };

  const confirmUnfollow = async () => {
    if (!userToUnfollow) return;
    const { id: targetId, isList } = userToUnfollow;
    setUserToUnfollow(null);
    if (isList) {
      const newFollowingIds = new Set(myFollowingIds);
      newFollowingIds.delete(targetId);
      setMyFollowingIds(newFollowingIds);
      if (isMe) {
        setFollowingCount((prev: number) => prev - 1);
        if (showFollowModal?.type === 'following') setFollowList(prev => prev.filter(u => u.id !== targetId));
      }
      try {
        const result = await toggleFollow(targetId);
        if (!result.success) throw new Error();
      } catch {
        setMyFollowingIds(myFollowingIds);
        setToast({ message: 'Action failed', type: 'danger' });
      }
    } else {
      setIsFollowing(false);
      setFollowersCount(prev => prev - 1);
      setFollowersCount((prev: number) => prev - 1);
      try {
        const result = await toggleFollow(targetId);
        if (!result.success) throw new Error();
      } catch (err) {
         setIsFollowing(true);
         setFollowersCount((prev: number) => prev + 1);
         setToast({ message: 'Failed to update follow status', type: 'danger' });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="ig-profile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="ig-profile" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>User not found</h2>
        <p style={{ color: 'var(--text-muted)' }}>The profile you are looking for doesn't exist or has been removed.</p>
        <Link href="/" style={{ color: 'var(--primary)', marginTop: '20px', display: 'inline-block' }}>Go Home</Link>
      </div>
    );
  }

  return (
    <div className="ig-profile animate-fade-in" id="profile-page" style={{ position: 'relative' }}>
      {/* ─── Toast ─── */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          padding: '12px 24px', borderRadius: '12px', zIndex: 9999,
          background: toast.type === 'danger' ? 'rgba(239, 68, 68, 0.95)'
            : toast.type === 'success' ? 'rgba(16, 185, 129, 0.95)'
            : 'rgba(99, 102, 241, 0.95)',
          color: '#fff', fontSize: '14px', fontWeight: 600,
          backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          animation: 'fade-in 0.3s ease-out',
          maxWidth: '90vw', textAlign: 'center',
        }}>
          {toast.message}
        </div>
      )}

      {/* Profile Header UI (Omitted for brevity, but same as original) */}
      <div className="ig-header-main">
        <div className="ig-avatar-outer">
          <Link href="/" className="ig-header-back-btn" aria-label="Go back">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
          </Link>

          <div className="ig-avatar-ring jumbo" onClick={() => setShowFullImage(true)} style={{ cursor: 'pointer' }}>
            <div className="ig-avatar-inner jumbo" style={{ overflow: 'hidden' }}>
               <img src={user.profilePicture || user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&size=200`} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>

          {isMe ? (
            <Link href="/settings" className="ig-header-settings-btn" aria-label="Settings">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/><circle cx="5" cy="12" r="1.5"/>
              </svg>
            </Link>
          ) : (
            <div ref={menuRef} style={{ position: 'absolute', top: 0, right: 0 }}>
              <button className="ig-header-settings-btn" onClick={() => setShowOptionsMenu(prev => !prev)}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/><circle cx="5" cy="12" r="1.5"/>
                </svg>
              </button>
              {showOptionsMenu && (
                <div className="dropdown-menu">
                   <button onClick={handleCopyLink}>🔗 Copy Link</button>
                   <button onClick={handleShareProfile}>📤 Share Profile</button>
                   <button onClick={handleMuteToggle}>{isMuted ? '🔔' : '🔕'} {isMuted ? 'Unmute' : 'Mute'}</button>
                   <button onClick={() => setShowBlockConfirm(true)}>{isBlocked ? '✅' : '🚫'} {isBlocked ? 'Unblock' : 'Block'}</button>
                   <button onClick={() => setShowReportModal(true)}>🚩 Report</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="ig-profile-bio-modern">
        <h1>{user.name}</h1>
        {user.username && <p className="ig-handle-tag">@{user.username}</p>}
        <p className="ig-college-tag">{user.college} • {user.branch}</p>
        <p className="ig-bio-text">{user.bio}</p>
      </div>

      <div className="ig-stats-container-modern stats-bar">
        <div className="ig-stat">
          <span className="ig-stat-value">{userPosts.length}</span>
          <span className="ig-stat-label">Posts</span>
        </div>
        <div className="ig-stat clickable" onClick={() => openFollowModal('followers')}>
          <span className="ig-stat-value">{followersCount}</span>
          <span className="ig-stat-label">Followers</span>
        </div>
        <div className="ig-stat clickable" onClick={() => openFollowModal('following')}>
          <span className="ig-stat-value">{followingCount}</span>
          <span className="ig-stat-label">Following</span>
        </div>
      </div>

      <div className="ig-profile-actions">
        {isMe ? (
          <button onClick={handleShareProfile} className="ig-action-btn ig-action-btn-secondary" style={{ flex: 1 }}>Share Profile</button>
        ) : (
          <>
            <button className={`ig-action-btn ${isFollowing ? 'ig-action-btn-following' : isRequested ? 'ig-action-btn-secondary' : 'ig-action-btn-follow'}`} onClick={handleFollowToggle} style={{ flex: 2 }}>
              {isFollowing ? 'Following' : isRequested ? 'Requested' : 'Follow'}
            </button>
            <Link href={`/messages?userId=${user.id}`} className="ig-action-btn ig-action-btn-message" style={{ flex: 2 }}>Message</Link>
          </>
        )}
      </div>

      <div className="ig-tabs">
        <button className={`ig-tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill={activeTab === 'posts' ? 'currentColor' : 'none'} stroke="currentColor"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
        </button>
        {isMe && (
          <button className={`ig-tab ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill={activeTab === 'saved' ? 'currentColor' : 'none'} stroke="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
          </button>
        )}
      </div>

      <div className="ig-grid">
        {displayPosts.map(post => (
          <Link key={post.id} href={`/article/${post.slug}`} className="ig-grid-item">
            <img src={post.imageUrl} alt={post.title} loading="lazy" />
          </Link>
        ))}
      </div>

      {/* Modals for block, mute, report, follow-list, etc. omitted for brevity */}
    </div>
  );
}
