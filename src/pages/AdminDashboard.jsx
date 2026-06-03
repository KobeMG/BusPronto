import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import styles from './Admin.module.css';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login', { replace: true });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setResult(null);

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      setResult({ error: 'Sesión expirada. Inicia sesión de nuevo.' });
      setSending(false);
      return;
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, body, url: url || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResult({ error: data.error || 'Error al enviar notificación' });
      } else {
        setResult({
          success: true,
          message: data.message,
          stats: data.stats,
        });
        setTitle('');
        setBody('');
        setUrl('');
      }
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.adminPage}>
      <div className={styles.container}>
        <header className={styles.topBar}>
          <div>
            <h1 className={styles.title}>Notificaciones</h1>
            <p className={styles.userInfo}>{userEmail}</p>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Cerrar sesión
          </button>
        </header>

        <div className={styles.card}>
          <form onSubmit={handleSend} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="noti-title" className={styles.label}>Título</label>
              <input
                id="noti-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={styles.input}
                placeholder="Ej: Cambio de horario"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="noti-body" className={styles.label}>Mensaje</label>
              <textarea
                id="noti-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className={styles.textarea}
                placeholder="Ej: La ruta de Alajuela tendrá un horario especial este viernes..."
                rows={4}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="noti-url" className={styles.label}>
                URL <span className={styles.optional}>(opcional)</span>
              </label>
              <input
                id="noti-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={styles.input}
                placeholder="https://buspronto.lat/rutas-externas/alajuela"
              />
            </div>

            {result && (
              <div className={result.success ? styles.resultSuccess : styles.resultError}>
                {result.success ? (
                  <>
                    <strong>¡Enviado!</strong>
                    <p>{result.stats.successful} exitosas, {result.stats.failed} fallidas (de {result.stats.total} suscriptores)</p>
                  </>
                ) : (
                  <p>{result.error}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              className={styles.button}
              disabled={sending}
            >
              {sending ? 'Enviando...' : 'Enviar notificación'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
