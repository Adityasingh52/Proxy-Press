export default function Loading() {
  return (
    <div style={{ padding: '20px', paddingTop: 'calc(20px + env(safe-area-inset-top))' }}>
      <div style={{ width: '100%', height: '50px', background: 'var(--surface-3)', borderRadius: '8px', marginBottom: '20px' }} />
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--surface-3)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: '40%', height: '16px', background: 'var(--surface-3)', marginBottom: '8px', borderRadius: '4px' }} />
            <div style={{ width: '70%', height: '12px', background: 'var(--surface-3)', borderRadius: '4px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
