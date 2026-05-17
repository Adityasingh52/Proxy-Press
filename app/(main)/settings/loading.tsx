export default function Loading() {
  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <div style={{ width: '24px', height: '24px', background: 'var(--surface-3)', borderRadius: '4px' }} />
        <div style={{ width: '100px', height: '24px', background: 'var(--surface-3)', borderRadius: '4px' }} />
      </div>

      {/* Settings Groups */}
      {[1, 2, 3].map(group => (
        <div key={group} style={{ marginBottom: '25px' }}>
          <div style={{ width: '80px', height: '16px', background: 'var(--surface-3)', borderRadius: '4px', marginBottom: '15px' }} />
          
          {[1, 2].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface-3)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ width: '40%', height: '16px', background: 'var(--surface-3)', marginBottom: '8px', borderRadius: '4px' }} />
                <div style={{ width: '60%', height: '12px', background: 'var(--surface-3)', borderRadius: '4px' }} />
              </div>
              <div style={{ width: '12px', height: '12px', background: 'var(--surface-3)', borderRadius: '50%' }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
