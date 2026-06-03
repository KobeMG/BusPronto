import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  Send,
  Users,
  Activity,
  Bell,
  FileText,
  Link,
  Smartphone,
  Sparkles,
  CheckCircle2,
  XCircle
} from 'lucide-react';
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

  // Time and date for the phone preview simulator
  const [simTime, setSimTime] = useState('22:00');
  const [simDate, setSimDate] = useState('martes, 2 de junio');

  // Load user session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    });

    // Clock update loop for phone preview
    const updateSimTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setSimTime(`${hours}:${minutes}`);

      const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      const months = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];
      setSimDate(`${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]}`);
    };

    updateSimTime();
    const interval = setInterval(updateSimTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login', { replace: true });
  };

  // Pre-fill templates logic
  const handleApplyTemplate = (tplTitle, tplBody, tplUrl) => {
    setTitle(tplTitle);
    setBody(tplBody);
    setUrl(tplUrl || '');
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

  const templates = [
    {
      label: 'Cambio Parada',
      title: 'Reubicación de parada',
      body: 'La para por educación ha cambiado.',
      url: '/rutas-internas'
    },
    {
      label: 'Retraso de Servicio',
      title: 'Retraso en ruta',
      body: 'La parada de odontología ha cambiado.',
      url: '/rutas-externas'
    },
    {
      label: 'Horario Feriado',
      title: 'Horario especial feriado',
      body: 'Este próximo viernes las rutas funcionarán con horario de feriado nacional. Planifica tu viaje.',
      url: '/configuracion'
    },
    {
      label: 'Restablecido',
      title: 'Servicio normalizado',
      body: 'Las rutas internas han restablecido sus frecuencias y operan con normalidad.',
      url: '/'
    }
  ];

  return (
    <div className={styles.adminPage}>
      <div className={styles.dashboardContainer}>
        {/* Top Header Bar */}
        <header className={styles.topBar}>
          <div className={styles.brandWrapper}>
            <h1 className={styles.title}>Notificaciones Push</h1>
            <div className={styles.statusIndicator}>
              <span className={styles.pulsingDot} />
              <span>Servicio en línea</span>
            </div>
          </div>

          <div className={styles.userInfoWrapper}>
            <div className={styles.userBadge}>
              <Activity size={14} style={{ color: '#60a5fa' }} />
              <span>{userEmail || 'Cargando admin...'}</span>
            </div>
            <Motion.button
              onClick={handleLogout}
              className={styles.logoutBtn}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut size={14} />
              <span>Cerrar sesión</span>
            </Motion.button>
          </div>
        </header>

        {/* Dashboard Statistics Overview */}
        <section className={styles.statsGrid}>
          <Motion.div
            className={styles.statCard}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className={styles.statInfo}>
              <h3>Base de Datos</h3>
              <div className={styles.statValue}>Conectada</div>
              <span className={`${styles.statBadge} ${styles.statBadgePositive}`}>
                Supabase activa
              </span>
            </div>
            <div className={styles.statIconContainer}>
              <Users size={22} />
            </div>
          </Motion.div>

          <Motion.div
            className={styles.statCard}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className={styles.statInfo}>
              <h3>Tasa de Entrega</h3>
              <div className={styles.statValue}>
                {result?.stats ? `${Math.round((result.stats.successful / result.stats.total) * 100)}%` : 'N/A'}
              </div>
              {result?.stats ? (
                <span className={`${styles.statBadge} ${styles.statBadgePositive}`}>
                  {result.stats.successful}/{result.stats.total} dispositivos
                </span>
              ) : (
                <span className={`${styles.statBadge} ${styles.statBadgeNeutral}`}>
                  Sin envíos aún
                </span>
              )}
            </div>
            <div className={styles.statIconContainer}>
              <Activity size={22} />
            </div>
          </Motion.div>

          <Motion.div
            className={styles.statCard}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className={styles.statInfo}>
              <h3>VAPID Status</h3>
              <div className={styles.statValue}>Activo</div>
              <span className={`${styles.statBadge} ${styles.statBadgeNeutral}`}>
                Llave segura
              </span>
            </div>
            <div className={styles.statIconContainer}>
              <Bell size={22} />
            </div>
          </Motion.div>
        </section>

        {/* Work Area Grid (Composer Form + Mobile simulator preview) */}
        <div className={styles.dashboardGrid}>

          {/* Card Left: Notification Composer */}
          <Motion.div
            className={styles.card}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <Sparkles size={18} style={{ color: '#60a5fa' }} />
                Redactar Mensaje
              </h2>
            </div>

            {/* Template Selection */}
            <div className={styles.templatesSection}>
              <span className={styles.sectionLabel}>Plantillas rápidas</span>
              <div className={styles.templatesList}>
                {templates.map((tpl, i) => (
                  <Motion.button
                    key={i}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl.title, tpl.body, tpl.url)}
                    className={styles.templateBtn}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {tpl.label}
                  </Motion.button>
                ))}
              </div>
            </div>

            {/* Core Form */}
            <form onSubmit={handleSend} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="noti-title" className={styles.label}>
                  <span>Título del aviso</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="noti-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={styles.inputField}
                    placeholder="Ej: Cambio de horario en ruta express"
                    required
                    maxLength={50}
                  />
                  <div className={styles.inputIcon}>
                    <FileText size={18} />
                  </div>
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="noti-body" className={styles.label}>
                  <span>Mensaje descriptivo</span>
                  <span className={styles.characterCount}>{body.length}/200</span>
                </label>
                <textarea
                  id="noti-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value.substring(0, 200))}
                  className={styles.textarea}
                  placeholder="Redacta la información clara y resumida que aparecerá en los dispositivos móviles..."
                  rows={4}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="noti-url" className={styles.label}>
                  <span>URL de redirección <span className={styles.optional}>(opcional)</span></span>
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="noti-url"
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className={styles.inputField}
                    placeholder="Ej: /rutas-externas/heredia o una URL completa"
                  />
                  <div className={styles.inputIcon}>
                    <Link size={18} />
                  </div>
                </div>
              </div>

              {/* Status / Alert Results panel */}
              <AnimatePresence mode="wait">
                {result && (
                  <Motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={result.success ? styles.resultSuccess : styles.resultError}
                  >
                    {result.success ? (
                      <>
                        <div className={styles.resultTitle}>
                          <CheckCircle2 size={16} />
                          <span>¡Envío completado exitosamente!</span>
                        </div>
                        <p>
                          Se enviaron {result.stats.successful} notificaciones ({result.stats.failed} fallidas) de un total de {result.stats.total} dispositivos registrados.
                        </p>
                      </>
                    ) : (
                      <div className={styles.resultTitle}>
                        <XCircle size={16} />
                        <span>Error: {result.error}</span>
                      </div>
                    )}
                  </Motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <Motion.button
                type="submit"
                className={styles.submitBtn}
                disabled={sending}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {sending ? (
                  <>
                    <Motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        borderTopColor: '#ffffff',
                      }}
                    />
                    <span>Procesando envíos en la cola...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Enviar Notificación Directa</span>
                  </>
                )}
              </Motion.button>
            </form>
          </Motion.div>

          {/* Card Right: Device Simulator Preview (Wow Factor) */}
          <Motion.div
            className={`${styles.card} ${styles.simulatorCard}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <span className={styles.simulatorLabel}>Previsualización en móvil</span>

            <div className={styles.phoneFrame}>
              <div className={styles.phoneNotch} />

              <div className={styles.phoneScreen}>
                {/* Status Bar */}
                <div className={styles.phoneStatusBar}>
                  <span>{simTime}</span>
                  <div className={styles.phoneStatusRight}>
                    <span>LTE</span>
                    <span>🔋 100%</span>
                  </div>
                </div>

                {/* Lockscreen clock widget */}
                <div className={styles.phoneClock}>
                  <span className={styles.phoneClockTime}>{simTime}</span>
                  <span className={styles.phoneClockDate}>{simDate}</span>
                </div>

                {/* Interactive iOS style push notification banner */}
                <AnimatePresence>
                  <Motion.div
                    layout
                    className={styles.notificationBanner}
                    initial={{ scale: 0.9, opacity: 0, y: -20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <div className={styles.notificationHeader}>
                      <div className={styles.notificationAppInfo}>
                        <div className={styles.appIcon}>
                          <span>BP</span>
                        </div>
                        <span className={styles.appName}>BusPronto</span>
                      </div>
                      <span className={styles.notificationTime}>ahora mismo</span>
                    </div>

                    <div className={styles.notificationContent}>
                      <span className={styles.notificationTitle}>
                        {title.trim() ? title : 'Título de la Notificación'}
                      </span>
                      <span className={styles.notificationBody}>
                        {body.trim() ? body : 'El contenido de la alerta o aviso importante aparecerá aquí en tiempo real a medida que redactas el formulario.'}
                      </span>
                      {url.trim() && (
                        <div className={styles.notificationUrl}>
                          <Link size={10} />
                          <span>Abrir: {url}</span>
                        </div>
                      )}
                    </div>
                  </Motion.div>
                </AnimatePresence>

                <div className={styles.phoneFooterMessage}>
                  Desliza hacia arriba para abrir
                </div>
              </div>
            </div>
          </Motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
