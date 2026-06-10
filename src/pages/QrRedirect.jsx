import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const QrRedirect = () => {
  const { stopId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(`/rutas-internas/parada/${stopId}`, { replace: true });
    }, 1500);
    return () => clearTimeout(timer);
  }, [stopId, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0f1115',
      color: '#ffffff',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      padding: '2rem',
      textAlign: 'center',
    }}>
      <Helmet>
        <title>Redirigiendo - BusPronto</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div style={{
        fontSize: '1.75rem',
        fontWeight: 700,
        marginBottom: '0.75rem',
        letterSpacing: '-0.02em',
      }}>
        BusPronto
      </div>

      <div style={{
        fontSize: '1rem',
        color: '#94a3b8',
        marginBottom: '2rem',
      }}>
        Redirigiendo...
      </div>

      <div style={{
        width: '32px',
        height: '32px',
        border: '3px solid #2a2d36',
        borderTopColor: '#3b82f6',
        borderRadius: '50%',
        animation: 'qr-spin 0.8s linear infinite',
      }} />

      <style>{`
        @keyframes qr-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default QrRedirect;
