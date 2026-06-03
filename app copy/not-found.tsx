import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={styles.container}>
      <div style={styles.glow} />
      <div style={styles.card}>
        <h1 style={styles.errorCode}>404</h1>
        <h2 style={styles.errorTitle}>Halaman Tidak Ditemukan</h2>
        <p style={styles.errorText}>
          Maaf, halaman yang Anda cari tidak dapat ditemukan. Silakan periksa kembali URL Anda atau kembali ke halaman dashboard utama.
        </p>
        <Link href="/admin/dashboard" style={styles.button}>
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0d0017',
    color: '#ffffff',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(95, 55, 255, 0.25) 0%, rgba(0,0,0,0) 70%)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  card: {
    position: 'relative',
    zIndex: 2,
    background: 'rgba(42, 13, 69, 0.45)',
    backdropFilter: 'blur(8px)',
    border: '2px solid #5f37ff',
    borderRadius: '24px',
    padding: '48px 36px',
    maxWidth: '520px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
  },
  errorCode: {
    fontSize: '96px',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #ffffff 30%, #5f37ff 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: '0 0 10px 0',
    lineHeight: '1',
  },
  errorTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 16px 0',
  },
  errorText: {
    fontSize: '15px',
    color: '#cfc2ff',
    lineHeight: '1.6',
    margin: '0 0 32px 0',
  },
  button: {
    display: 'inline-block',
    background: '#6d4cff',
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '16px',
    padding: '14px 32px',
    borderRadius: '16px',
    transition: 'background 0.2s ease',
    boxShadow: '0 4px 14px rgba(109, 76, 255, 0.35)',
  },
};
