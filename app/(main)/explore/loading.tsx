export default function Loading() {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ width: '100%', height: '40px', background: 'var(--surface-3)', borderRadius: '8px', marginBottom: '20px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ height: '200px', background: 'var(--surface-3)', borderRadius: '8px' }} />
        ))}
      </div>
    </div>
  );
}
