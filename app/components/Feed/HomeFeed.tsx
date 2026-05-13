'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import type { Category, Post } from '@/lib/data';
import PostCard from './PostCard';
import CategoryFilters from './CategoryFilters';
import { getInitialData, getCurrentUser, getProfileData } from '@/lib/actions';

export default function HomeFeed() {
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const cacheLoaded = useRef(false);

  useEffect(() => {
    // 1. Try to load from local cache first for "instant" feel
    if (typeof window !== 'undefined' && !cacheLoaded.current) {
      const cached = localStorage.getItem('home_feed_cache');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          // Use cache if it's less than 1 hour old
          const isFresh = (Date.now() - parsed.timestamp) < 1000 * 60 * 60;
          if (parsed.posts && parsed.posts.length > 0) {
            setPosts(parsed.posts);
            if (isFresh) setIsLoading(false);
          }
        } catch (e) {
          console.error('Failed to parse home feed cache', e);
        }
      }
      cacheLoaded.current = true;
    }

    async function loadData() {
      try {
        const user = await getCurrentUser();
        const data = await getInitialData(user?.id);
        
        if (data.posts) {
          const adaptedPosts = data.posts.map((p: any) => ({
            ...p,
            timeAgo: p.publishedAt ? formatTimeAgo(p.publishedAt) : 'Recently',
            isLiked: Array.isArray(p.likesList) ? p.likesList.some((l: any) => l.userId === user?.id) : false,
          }));
          setPosts(adaptedPosts);
          
          // 2. Update cache with fresh data
          if (typeof window !== 'undefined') {
            localStorage.setItem('home_feed_cache', JSON.stringify({
              posts: adaptedPosts,
              timestamp: Date.now()
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load posts from DB:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);



  const filteredPosts = useMemo(() => {
    if (activeCategory === 'All') return posts;
    return posts.filter(post => post.category === activeCategory);
  }, [activeCategory, posts]);

  // Split into hero (first post with image) and rest
  const heroPost = filteredPosts.length > 0 && filteredPosts[0].imageUrl
    ? filteredPosts[0]
    : null;
  const remainingPosts = heroPost
    ? filteredPosts.slice(1)
    : filteredPosts;

  return (
    <div className="feed-container" id="home-feed">
      {/* Category filters */}
      <CategoryFilters 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory} 
      />

      {/* News feed */}
      <div id="posts-feed" style={{ paddingTop: '4px' }}>
        {/* Hero card */}
        {heroPost && (
          <PostCard key={heroPost.id} post={heroPost} index={0} variant="hero" />
        )}

        {/* Section header for remaining posts */}
        {remainingPosts.length > 0 && (
          <div className="news-section-header">
            <span className="news-section-title">
              {activeCategory === 'All' ? 'Latest' : activeCategory}
            </span>
            <span className="news-section-count">
              {remainingPosts.length} {remainingPosts.length === 1 ? 'story' : 'stories'}
            </span>
          </div>
        )}

        {/* Compact list */}
        {remainingPosts.map((post, idx) => (
          <PostCard key={post.id} post={post} index={idx + 1} variant="compact" />
        ))}
        
        {!isLoading && filteredPosts.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px', 
            color: 'var(--text-muted)' 
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.7 }}>📭</div>
            <p style={{ fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>No stories yet</p>
            <p style={{ fontWeight: 400, fontSize: '13px', color: 'var(--text-subtle)' }}>
              {activeCategory === 'All' 
                ? 'Be the first to publish a story'
                : `No stories in ${activeCategory} category`}
            </p>
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-subtle)', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <div className="spinner" />
            Loading stories...
          </div>
        </div>
      )}
    </div>
  );
}


function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
