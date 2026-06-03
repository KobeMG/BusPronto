import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'radial-gradient(circle at 50% 50%, #151821 0%, #0f1115 100%)',
        color: 'var(--text-primary, #fff)',
        gap: '1.5rem',
        fontFamily: "'Inter', sans-serif"
      }}>
        <Motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            border: '3px solid rgba(59, 130, 246, 0.1)',
            borderTopColor: '#3b82f6',
          }}
        />
        <Motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary, #94a3b8)',
            fontWeight: 500,
            letterSpacing: '0.05em'
          }}
        >
          Verificando sesión...
        </Motion.p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
