export default function Loading() {
  return (
    <div className="profile-skeleton" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
        <div className="skeleton-circle" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--surface-3)' }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton-line" style={{ width: '60%', height: '20px', background: 'var(--surface-3)', marginBottom: '10px', borderRadius: '4px' }} />
          <div className="skeleton-line" style={{ width: '40%', height: '14px', background: 'var(--surface-3)', borderRadius: '4px' }} />
        </div>
      </div>
      <div className="skeleton-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} style={{ aspectRatio: '1/1', background: 'var(--surface-3)' }} />
        ))}
      </div>
    </div>
  );
}
