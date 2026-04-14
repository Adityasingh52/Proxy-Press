import { posts, categories } from '@/lib/data';
import StoriesRow from './StoriesRow';
import PostCard from './PostCard';

export default function HomeFeed() {
  return (
    <div className="feed-container" id="home-feed">
      {/* Page header */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
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
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>
            Stay updated with the pulse of your campus.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-icon" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>🔍</button>
          <button className="btn-icon" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>⚙️</button>
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
