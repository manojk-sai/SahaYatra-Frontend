export function Footer() {
  return (
    <footer style={{ marginTop: '40px', paddingBottom: '30px', textAlign: 'center' }}>
       <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: '#94a3b8', 
          fontSize: '12px',
          padding: '4px 12px',
          borderRadius: '20px',
          background: '#f8fafc' // Very light subtle background
        }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#cbd5e1' }} />
        Weather snapshots are automatically updated every day
      </div>
    </footer>
  );
}