import { useState, useEffect, useCallback } from 'react';
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
  Sparkles,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  MapPin,
  Clock,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import {
  getAllEventsAdmin,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEventVisibility,
} from '../services/semanaU.service';
import {
  getAllAlertsAdmin,
  createAlert,
  updateAlert,
  deleteAlert,
  toggleAlertActive,
} from '../services/alerts.service';
import styles from './Admin.module.css';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const EMPTY_FORM = {
  title: '',
  organizer: '',
  location: '',
  modality: 'Presencial',
  start_time: '',
  event_date_start: '',
  event_date_finish: '',
  google_maps: '',
  registration_link: '',
  is_visible: true,
  is_active: true,
};

// Helper to format date range for display
const formatDateRange = (start, finish) => {
  if (!start) return '—';
  const opts = { day: 'numeric', month: 'short', timeZone: 'UTC' };
  const s = new Date(start + 'T12:00:00').toLocaleDateString('es-CR', opts);
  if (!finish || finish === start) return s;
  const f = new Date(finish + 'T12:00:00').toLocaleDateString('es-CR', opts);
  return `${s} → ${f}`;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState('notifications'); // 'notifications' | 'events'
  const [userEmail, setUserEmail] = useState('');

  // ── Notifications state ──────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  // Time and date for the phone preview simulator
  const [simTime, setSimTime] = useState('22:00');
  const [simDate, setSimDate] = useState('martes, 2 de junio');

  // ── Events state ─────────────────────────────────────────────────
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null); // null = create mode
  const [savingEvent, setSavingEvent] = useState(false);
  const [eventResult, setEventResult] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // event to confirm deletion
  const [togglingId, setTogglingId] = useState(null);

  // ── Alerts state ──────────────────────────────────────────────────
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertsError, setAlertsError] = useState(null);
  const [alertFormData, setAlertFormData] = useState({ title: '', message: '', active: true });
  const [editingAlertId, setEditingAlertId] = useState(null); // null = create mode
  const [savingAlert, setSavingAlert] = useState(false);
  const [alertResult, setAlertResult] = useState(null);
  const [deleteAlertTarget, setDeleteAlertTarget] = useState(null); // alert to confirm deletion
  const [togglingAlertId, setTogglingAlertId] = useState(null);

  // ── Session ──────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    });

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

  // ── Load events when switching to events tab ─────────────────────
  const fetchEvents = useCallback(async () => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const data = await getAllEventsAdmin();
      setEvents(data);
    } catch (err) {
      setEventsError(err.message || 'Error cargando eventos');
    } finally {
      setEventsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeModule === 'events') {
      fetchEvents();
    }
  }, [activeModule, fetchEvents]);

  // ── Load alerts when switching to alerts tab ─────────────────────
  const fetchAlerts = useCallback(async () => {
    setAlertsLoading(true);
    setAlertsError(null);
    try {
      const data = await getAllAlertsAdmin();
      setAlerts(data);
    } catch (err) {
      setAlertsError(err.message || 'Error cargando alertas');
    } finally {
      setAlertsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeModule === 'alerts') {
      fetchAlerts();
    }
  }, [activeModule, fetchAlerts]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // ── Handlers ─────────────────────────────────────────────────────
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login', { replace: true });
  };

  const handleApplyTemplate = (tplTitle, tplBody, tplUrl) => {
    setTitle(tplTitle);
    setBody(tplBody);
    setUrl(tplUrl || '');
  };

  // Notifications send
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

  // Events: form field change
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Events: start editing an event
  const handleEditEvent = (event) => {
    setEditingId(event.id);
    setFormData({
      title: event.title || '',
      organizer: event.organizer || '',
      location: event.location || '',
      modality: event.modality || 'Presencial',
      start_time: event.start_time || '',
      event_date_start: event.event_date_start || '',
      event_date_finish: event.event_date_finish || '',
      google_maps: event.google_maps || '',
      registration_link: event.registration_link || '',
      is_visible: event.is_visible ?? true,
      is_active: event.is_active ?? true,
    });
    setEventResult(null);
  };

  // Events: cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setEventResult(null);
  };

  // Events: submit (create or update)
  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setSavingEvent(true);
    setEventResult(null);

    // Validate date range
    if (formData.event_date_finish && formData.event_date_finish < formData.event_date_start) {
      setEventResult({ error: 'La fecha de fin no puede ser anterior a la fecha de inicio.' });
      setSavingEvent(false);
      return;
    }

    const payload = {
      title: formData.title.trim(),
      organizer: formData.organizer.trim() || null,
      location: formData.location.trim() || null,
      modality: formData.modality,
      start_time: formData.start_time || null,
      event_date_start: formData.event_date_start,
      event_date_finish: formData.event_date_finish || formData.event_date_start,
      google_maps: formData.google_maps.trim() || null,
      registration_link: formData.registration_link.trim() || null,
      is_visible: formData.is_visible,
      is_active: formData.is_active,
    };

    try {
      if (editingId) {
        await updateEvent(editingId, payload);
        setEventResult({ success: true, message: '¡Evento actualizado correctamente!' });
      } else {
        await createEvent(payload);
        setEventResult({ success: true, message: '¡Evento creado correctamente!' });
      }
      setEditingId(null);
      setFormData(EMPTY_FORM);
      await fetchEvents();
    } catch (err) {
      setEventResult({ error: err.message || 'Error al guardar el evento.' });
    } finally {
      setSavingEvent(false);
    }
  };

  // Events: toggle visibility
  const handleToggleVisibility = async (event) => {
    setTogglingId(event.id);
    try {
      await toggleEventVisibility(event.id, event.is_visible);
      setEvents(prev =>
        prev.map(e => e.id === event.id ? { ...e, is_visible: !e.is_visible } : e)
      );
    } catch (err) {
      console.error('Error toggling visibility:', err);
    } finally {
      setTogglingId(null);
    }
  };

  // Events: confirm deletion
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteEvent(deleteTarget.id);
      setEvents(prev => prev.filter(e => e.id !== deleteTarget.id));
      if (editingId === deleteTarget.id) handleCancelEdit();
    } catch (err) {
      console.error('Error deleting event:', err);
    } finally {
      setDeleteTarget(null);
    }
  };

  // Alerts: form field change
  const handleAlertFormChange = (field, value) => {
    setAlertFormData(prev => ({ ...prev, [field]: value }));
  };

  // Alerts: start editing
  const handleEditAlert = (alert) => {
    setEditingAlertId(alert.id);
    setAlertFormData({
      title: alert.title || '',
      message: alert.message || '',
      active: alert.active ?? true,
    });
    setAlertResult(null);
  };

  // Alerts: cancel edit
  const handleCancelAlertEdit = () => {
    setEditingAlertId(null);
    setAlertFormData({ title: '', message: '', active: true });
    setAlertResult(null);
  };

  // Alerts: submit (create or update)
  const handleAlertSubmit = async (e) => {
    e.preventDefault();
    setSavingAlert(true);
    setAlertResult(null);

    const payload = {
      title: alertFormData.title.trim(),
      message: alertFormData.message.trim(),
      active: alertFormData.active,
    };

    try {
      if (editingAlertId) {
        await updateAlert(editingAlertId, payload);
        setAlertResult({ success: true, message: '¡Alerta actualizada correctamente!' });
      } else {
        await createAlert(payload);
        setAlertResult({ success: true, message: '¡Alerta creada correctamente!' });
      }
      setEditingAlertId(null);
      setAlertFormData({ title: '', message: '', active: true });
      await fetchAlerts();
    } catch (err) {
      setAlertResult({ error: err.message || 'Error al guardar la alerta.' });
    } finally {
      setSavingAlert(false);
    }
  };

  // Alerts: toggle active status
  const handleToggleAlertActive = async (alert) => {
    setTogglingAlertId(alert.id);
    try {
      await toggleAlertActive(alert.id, alert.active);
      setAlerts(prev =>
        prev.map(a => a.id === alert.id ? { ...a, active: !a.active } : a)
      );
    } catch (err) {
      console.error('Error toggling alert active state:', err);
    } finally {
      setTogglingAlertId(null);
    }
  };

  // Alerts: confirm deletion
  const handleDeleteAlertConfirm = async () => {
    if (!deleteAlertTarget) return;
    try {
      await deleteAlert(deleteAlertTarget.id);
      setAlerts(prev => prev.filter(a => a.id !== deleteAlertTarget.id));
      if (editingAlertId === deleteAlertTarget.id) handleCancelAlertEdit();
    } catch (err) {
      console.error('Error deleting alert:', err);
    } finally {
      setDeleteAlertTarget(null);
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
            <h1 className={styles.title}>Panel de Administración</h1>
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
              <h3>Eventos Registrados</h3>
              <div className={styles.statValue}>{events.length || '—'}</div>
              <span className={`${styles.statBadge} ${styles.statBadgeNeutral}`}>
                {events.filter(e => e.is_visible).length} visibles
              </span>
            </div>
            <div className={styles.statIconContainer}>
              <CalendarDays size={22} />
            </div>
          </Motion.div>

          <Motion.div
            className={styles.statCard}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className={styles.statInfo}>
              <h3>Alertas de Bus</h3>
              <div className={styles.statValue}>{alerts.length || '—'}</div>
              <span className={`${styles.statBadge} ${styles.statBadgeNeutral}`}>
                {alerts.filter(a => a.active).length} activas
              </span>
            </div>
            <div className={styles.statIconContainer}>
              <Bell size={22} />
            </div>
          </Motion.div>
        </section>

        {/* Module Tab Navigation */}
        <nav className={styles.moduleTabNav}>
          <button
            id="tab-notifications"
            className={`${styles.moduleTabBtn} ${activeModule === 'notifications' ? styles.moduleTabBtnActive : ''}`}
            onClick={() => setActiveModule('notifications')}
          >
            <Bell size={15} />
            Notificaciones
          </button>
          <button
            id="tab-events"
            className={`${styles.moduleTabBtn} ${activeModule === 'events' ? styles.moduleTabBtnActive : ''}`}
            onClick={() => setActiveModule('events')}
          >
            <CalendarDays size={15} />
            Eventos
          </button>
          <button
            id="tab-alerts"
            className={`${styles.moduleTabBtn} ${activeModule === 'alerts' ? styles.moduleTabBtnActive : ''}`}
            onClick={() => setActiveModule('alerts')}
          >
            <Bell size={15} />
            Alertas de Bus
          </button>
        </nav>

        {/* ── MODULE: NOTIFICATIONS ─────────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeModule === 'notifications' && (
            <Motion.div
              key="notifications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <div className={styles.dashboardGrid}>
                {/* Card Left: Notification Composer */}
                <Motion.div
                  className={styles.card}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
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

                {/* Card Right: Device Simulator Preview */}
                <Motion.div
                  className={`${styles.card} ${styles.simulatorCard}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
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

                      {/* iOS-style push notification banner */}
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
            </Motion.div>
          )}

          {/* ── MODULE: EVENTS ────────────────────────────────────── */}
          {activeModule === 'events' && (
            <Motion.div
              key="events"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <div className={styles.eventsModule}>

                {/* LEFT: Events List */}
                <div className={styles.eventsListPanel}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>
                      <Calendar size={18} style={{ color: '#60a5fa' }} />
                      Eventos Registrados
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={styles.eventsCount}>{events.length} total</span>
                      <button
                        onClick={fetchEvents}
                        disabled={eventsLoading}
                        className={styles.editBtn}
                        title="Recargar eventos"
                        style={{ padding: '0.3rem 0.5rem' }}
                      >
                        <RefreshCw size={14} style={eventsLoading ? { animation: 'spin 1s linear infinite' } : {}} />
                      </button>
                    </div>
                  </div>

                  {/* Result banner for event ops */}
                  <AnimatePresence mode="wait">
                    {eventResult && (
                      <Motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={eventResult.success ? styles.resultSuccess : styles.resultError}
                        style={{ marginBottom: '1rem' }}
                      >
                        <div className={styles.resultTitle}>
                          {eventResult.success
                            ? <><CheckCircle2 size={15} /><span>{eventResult.message}</span></>
                            : <><XCircle size={15} /><span>Error: {eventResult.error}</span></>
                          }
                        </div>
                      </Motion.div>
                    )}
                  </AnimatePresence>

                  <div className={styles.eventsListScroll}>
                    {eventsLoading ? (
                      <div className={styles.emptyEventsState}>
                        <Motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                          style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6' }}
                        />
                        <p>Cargando eventos...</p>
                      </div>
                    ) : eventsError ? (
                      <div className={styles.emptyEventsState}>
                        <AlertTriangle size={32} style={{ color: '#f87171' }} />
                        <p>{eventsError}</p>
                        <p style={{ fontSize: '0.75rem', color: '#475569' }}>
                          Verifica que las políticas RLS de Supabase permitan escritura.
                        </p>
                      </div>
                    ) : events.length === 0 ? (
                      <div className={styles.emptyEventsState}>
                        <CalendarDays size={36} style={{ color: '#334155' }} />
                        <p>No hay eventos registrados.</p>
                        <p style={{ fontSize: '0.8rem', color: '#475569' }}>Crea el primer evento con el formulario.</p>
                      </div>
                    ) : (
                      events.map(event => (
                          <Motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`${styles.eventRow} ${editingId === event.id ? styles.eventRowEditing : ''}`}
                        >
                          <div className={styles.eventRowTop}>
                            <div className={styles.eventRowMeta}>
                              <span className={styles.eventRowTitle} title={event.title}>
                                {event.title}
                              </span>
                              <div className={styles.eventRowDates}>
                                <Calendar size={11} />
                                {formatDateRange(event.event_date_start, event.event_date_finish)}
                                {event.start_time && (
                                  <><Clock size={11} />{event.start_time.slice(0, 5)}</>
                                )}
                              </div>
                            </div>

                            <div className={styles.eventRowActions}>
                              {/* Visibility toggle */}
                              <button
                                id={`toggle-visibility-${event.id}`}
                                className={`${styles.visibilityToggle} ${event.is_visible ? styles.visible : styles.hidden}`}
                                onClick={() => handleToggleVisibility(event)}
                                disabled={togglingId === event.id}
                                title={event.is_visible ? 'Visible — click para ocultar' : 'Oculto — click para publicar'}
                              >
                                {event.is_visible ? <Eye size={12} /> : <EyeOff size={12} />}
                                {event.is_visible ? 'Visible' : 'Oculto'}
                              </button>
                              {/* Edit */}
                              <button
                                id={`edit-event-${event.id}`}
                                className={styles.editBtn}
                                onClick={() => handleEditEvent(event)}
                                title="Editar evento"
                              >
                                <Pencil size={13} />
                              </button>
                              {/* Delete */}
                              <button
                                id={`delete-event-${event.id}`}
                                className={styles.deleteBtn}
                                onClick={() => setDeleteTarget(event)}
                                title="Eliminar evento"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <div className={styles.eventRowBadges}>
                            <span className={styles.modalityBadge}>{event.modality || 'Presencial'}</span>
                            {event.is_active
                              ? <span className={styles.activeBadge}>Activo</span>
                              : <span className={styles.inactiveBadge}>Cancelado</span>
                            }
                            {event.location && (
                              <span className={styles.modalityBadge} style={{ color: '#94a3b8' }}>
                                <MapPin size={10} style={{ display: 'inline', marginRight: 2 }} />
                                {event.location}
                              </span>
                            )}
                          </div>
                        </Motion.div>
                      ))
                    )}
                  </div>
                </div>

                {/* RIGHT: Create / Edit Form */}
                <div className={styles.eventFormCard}>
                  <div className={styles.eventFormHeader}>
                    <h2 className={styles.eventFormTitle}>
                      {editingId ? <><Pencil size={17} style={{ color: '#60a5fa' }} />Editar Evento</> : <><Plus size={17} style={{ color: '#60a5fa' }} />Nuevo Evento</>}
                    </h2>
                    {editingId && (
                      <button className={styles.cancelEditBtn} onClick={handleCancelEdit}>
                        Cancelar edición
                      </button>
                    )}
                  </div>

                  <form className={styles.eventForm} onSubmit={handleEventSubmit}>
                    {/* Title */}
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="ev-title">Título del evento *</label>
                      <input
                        id="ev-title"
                        type="text"
                        className={styles.inputFieldNoIcon}
                        placeholder="Ej: Concierto de Gala"
                        value={formData.title}
                        onChange={e => handleFormChange('title', e.target.value)}
                        required
                      />
                    </div>

                    {/* Organizer + Location */}
                    <div className={styles.eventFormGrid}>
                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="ev-organizer">Organizador</label>
                        <input
                          id="ev-organizer"
                          type="text"
                          className={styles.inputFieldNoIcon}
                          placeholder="Ej: FEUCR"
                          value={formData.organizer}
                          onChange={e => handleFormChange('organizer', e.target.value)}
                        />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="ev-location">Lugar</label>
                        <input
                          id="ev-location"
                          type="text"
                          className={styles.inputFieldNoIcon}
                          placeholder="Ej: Auditorio UCR"
                          value={formData.location}
                          onChange={e => handleFormChange('location', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Dates */}
                    <div className={styles.eventFormGrid}>
                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="ev-date-start">Fecha inicio *</label>
                        <input
                          id="ev-date-start"
                          type="date"
                          className={styles.inputFieldNoIcon}
                          value={formData.event_date_start}
                          onChange={e => handleFormChange('event_date_start', e.target.value)}
                          required
                        />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="ev-date-end">
                          Fecha fin <span className={styles.optional}>(si aplica)</span>
                        </label>
                        <input
                          id="ev-date-end"
                          type="date"
                          className={styles.inputFieldNoIcon}
                          value={formData.event_date_finish}
                          min={formData.event_date_start}
                          onChange={e => handleFormChange('event_date_finish', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Modality + Time */}
                    <div className={styles.eventFormGrid}>
                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="ev-modality">Modalidad</label>
                        <select
                          id="ev-modality"
                          className={styles.selectField}
                          value={formData.modality}
                          onChange={e => handleFormChange('modality', e.target.value)}
                        >
                          <option value="Presencial">Presencial</option>
                          <option value="Virtual">Virtual</option>
                          <option value="Híbrido">Híbrido</option>
                        </select>
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="ev-time">Hora de inicio</label>
                        <input
                          id="ev-time"
                          type="time"
                          className={styles.inputFieldNoIcon}
                          value={formData.start_time}
                          onChange={e => handleFormChange('start_time', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Google Maps */}
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="ev-maps">
                        Google Maps URL <span className={styles.optional}>(opcional)</span>
                      </label>
                      <input
                        id="ev-maps"
                        type="url"
                        className={styles.inputFieldNoIcon}
                        placeholder="https://maps.app.goo.gl/..."
                        value={formData.google_maps}
                        onChange={e => handleFormChange('google_maps', e.target.value)}
                      />
                    </div>

                    {/* Registration Link */}
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="ev-reg">
                        Link de inscripción <span className={styles.optional}>(opcional)</span>
                      </label>
                      <input
                        id="ev-reg"
                        type="url"
                        className={styles.inputFieldNoIcon}
                        placeholder="https://forms.gle/..."
                        value={formData.registration_link}
                        onChange={e => handleFormChange('registration_link', e.target.value)}
                      />
                    </div>

                    {/* Checkboxes */}
                    <div className={styles.checkboxRow}>
                      <label className={styles.checkboxLabel} htmlFor="ev-visible">
                        <input
                          id="ev-visible"
                          type="checkbox"
                          checked={formData.is_visible}
                          onChange={e => handleFormChange('is_visible', e.target.checked)}
                        />
                        Visible públicamente
                      </label>
                      <label className={styles.checkboxLabel} htmlFor="ev-active">
                        <input
                          id="ev-active"
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={e => handleFormChange('is_active', e.target.checked)}
                        />
                        Evento activo
                      </label>
                    </div>

                    <button
                      id="ev-submit"
                      type="submit"
                      className={styles.eventSubmitBtn}
                      disabled={savingEvent}
                    >
                      {savingEvent ? (
                        <>
                          <Motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff' }}
                          />
                          Guardando...
                        </>
                      ) : editingId ? (
                        <><CheckCircle2 size={16} /> Guardar Cambios</>
                      ) : (
                        <><Plus size={16} /> Crear Evento</>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </Motion.div>
          )}

          {/* ── MODULE: ALERTS ────────────────────────────────────── */}
          {activeModule === 'alerts' && (
            <Motion.div
              key="alerts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <div className={styles.eventsModule}>

                {/* LEFT: Alerts List */}
                <div className={styles.eventsListPanel}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>
                      <Bell size={18} style={{ color: '#60a5fa' }} />
                      Alertas Registradas
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={styles.eventsCount}>{alerts.length} total</span>
                      <button
                        onClick={fetchAlerts}
                        disabled={alertsLoading}
                        className={styles.editBtn}
                        title="Recargar alertas"
                        style={{ padding: '0.3rem 0.5rem' }}
                      >
                        <RefreshCw size={14} style={alertsLoading ? { animation: 'spin 1s linear infinite' } : {}} />
                      </button>
                    </div>
                  </div>

                  {/* Result banner for alert ops */}
                  <AnimatePresence mode="wait">
                    {alertResult && (
                      <Motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={alertResult.success ? styles.resultSuccess : styles.resultError}
                        style={{ marginBottom: '1rem' }}
                      >
                        <div className={styles.resultTitle}>
                          {alertResult.success
                            ? <><CheckCircle2 size={15} /><span>{alertResult.message}</span></>
                            : <><XCircle size={15} /><span>Error: {alertResult.error}</span></>
                          }
                        </div>
                      </Motion.div>
                    )}
                  </AnimatePresence>

                  <div className={styles.eventsListScroll}>
                    {alertsLoading ? (
                      <div className={styles.emptyEventsState}>
                        <Motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                          style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6' }}
                        />
                        <p>Cargando alertas...</p>
                      </div>
                    ) : alertsError ? (
                      <div className={styles.emptyEventsState}>
                        <AlertTriangle size={32} style={{ color: '#f87171' }} />
                        <p>{alertsError}</p>
                      </div>
                    ) : alerts.length === 0 ? (
                      <div className={styles.emptyEventsState}>
                        <Bell size={36} style={{ color: '#334155' }} />
                        <p>No hay alertas registradas.</p>
                        <p style={{ fontSize: '0.8rem', color: '#475569' }}>Crea la primera alerta con el formulario.</p>
                      </div>
                    ) : (
                      alerts.map(alert => (
                        <Motion.div
                          key={alert.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`${styles.eventRow} ${editingAlertId === alert.id ? styles.eventRowEditing : ''}`}
                        >
                          <div className={styles.eventRowTop}>
                            <div className={styles.eventRowMeta}>
                              <span className={styles.eventRowTitle} title={alert.title}>
                                {alert.title}
                              </span>
                              <div className={styles.eventRowDates} style={{ fontSize: '0.8rem', opacity: 0.8, color: '#94a3b8' }}>
                                {alert.message}
                              </div>
                            </div>

                            <div className={styles.eventRowActions}>
                              {/* Active/Inactive toggle */}
                              <button
                                id={`toggle-active-${alert.id}`}
                                className={`${styles.visibilityToggle} ${alert.active ? styles.visible : styles.hidden}`}
                                onClick={() => handleToggleAlertActive(alert)}
                                disabled={togglingAlertId === alert.id}
                                title={alert.active ? 'Activa — click para desactivar' : 'Inactiva — click para activar'}
                              >
                                {alert.active ? <Eye size={12} /> : <EyeOff size={12} />}
                                {alert.active ? 'Activa' : 'Inactiva'}
                              </button>
                              {/* Edit */}
                              <button
                                id={`edit-alert-${alert.id}`}
                                className={styles.editBtn}
                                onClick={() => handleEditAlert(alert)}
                                title="Editar alerta"
                              >
                                <Pencil size={13} />
                              </button>
                              {/* Delete */}
                              <button
                                id={`delete-alert-${alert.id}`}
                                className={styles.deleteBtn}
                                onClick={() => setDeleteAlertTarget(alert)}
                                title="Eliminar alerta"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </Motion.div>
                      ))
                    )}
                  </div>
                </div>

                {/* RIGHT: Create / Edit Form */}
                <div className={styles.eventFormCard}>
                  <div className={styles.eventFormHeader}>
                    <h2 className={styles.eventFormTitle}>
                      {editingAlertId ? <><Pencil size={17} style={{ color: '#60a5fa' }} />Editar Alerta</> : <><Plus size={17} style={{ color: '#60a5fa' }} />Nueva Alerta</>}
                    </h2>
                    {editingAlertId && (
                      <button className={styles.cancelEditBtn} onClick={handleCancelAlertEdit}>
                        Cancelar edición
                      </button>
                    )}
                  </div>

                  <form className={styles.eventForm} onSubmit={handleAlertSubmit}>
                    {/* Title */}
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="al-title">Título de la alerta *</label>
                      <input
                        id="al-title"
                        type="text"
                        className={styles.inputFieldNoIcon}
                        placeholder="Ej: Atraso en Ruta Heredia"
                        value={alertFormData.title}
                        onChange={e => handleAlertFormChange('title', e.target.value)}
                        required
                        maxLength={50}
                      />
                    </div>

                    {/* Message */}
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="al-message">Mensaje descriptivo *</label>
                      <textarea
                        id="al-message"
                        className={styles.textarea}
                        style={{ background: 'rgba(15, 23, 42, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '0.75rem', padding: '0.75rem', color: '#fff', outline: 'none' }}
                        placeholder="Detalle de la alerta..."
                        rows={5}
                        value={alertFormData.message}
                        onChange={e => handleAlertFormChange('message', e.target.value)}
                        required
                        maxLength={250}
                      />
                    </div>

                    {/* Checkbox */}
                    <div className={styles.checkboxRow}>
                      <label className={styles.checkboxLabel} htmlFor="al-active">
                        <input
                          id="al-active"
                          type="checkbox"
                          checked={alertFormData.active}
                          onChange={e => handleAlertFormChange('active', e.target.checked)}
                        />
                        Alerta activa (se mostrará a los usuarios)
                      </label>
                    </div>

                    <button
                      id="al-submit"
                      type="submit"
                      className={styles.eventSubmitBtn}
                      disabled={savingAlert}
                    >
                      {savingAlert ? (
                        <>
                          <Motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff' }}
                          />
                          Guardando...
                        </>
                      ) : editingAlertId ? (
                        <><CheckCircle2 size={16} /> Guardar Cambios</>
                      ) : (
                        <><Plus size={16} /> Crear Alerta</>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <Motion.div
            className={styles.deleteConfirmOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteTarget(null)}
          >
            <Motion.div
              className={styles.deleteConfirmModal}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.deleteConfirmTitle}>
                <AlertTriangle size={18} style={{ color: '#f87171' }} />
                Eliminar Evento
              </div>
              <p className={styles.deleteConfirmText}>
                ¿Seguro que deseas eliminar <strong style={{ color: '#f1f5f9' }}>"{deleteTarget.title}"</strong>?
                Esta acción no se puede deshacer.
              </p>
              <div className={styles.deleteConfirmActions}>
                <button
                  id="delete-cancel"
                  className={styles.deleteConfirmCancel}
                  onClick={() => setDeleteTarget(null)}
                >
                  Cancelar
                </button>
                <button
                  id="delete-confirm"
                  className={styles.deleteConfirmDelete}
                  onClick={handleDeleteConfirm}
                >
                  <Trash2 size={14} style={{ display: 'inline', marginRight: 4 }} />
                  Eliminar
                </button>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Delete Alert Confirmation Modal */}
      <AnimatePresence>
        {deleteAlertTarget && (
          <Motion.div
            className={styles.deleteConfirmOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteAlertTarget(null)}
          >
            <Motion.div
              className={styles.deleteConfirmModal}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.deleteConfirmTitle}>
                <AlertTriangle size={18} style={{ color: '#f87171' }} />
                Eliminar Alerta
              </div>
              <p className={styles.deleteConfirmText}>
                ¿Seguro que deseas eliminar la alerta <strong style={{ color: '#f1f5f9' }}>"{deleteAlertTarget.title}"</strong>?
                Esta acción no se puede deshacer y desaparecerá para todos los usuarios.
              </p>
              <div className={styles.deleteConfirmActions}>
                <button
                  id="delete-alert-cancel"
                  className={styles.deleteConfirmCancel}
                  onClick={() => setDeleteAlertTarget(null)}
                >
                  Cancelar
                </button>
                <button
                  id="delete-alert-confirm"
                  className={styles.deleteConfirmDelete}
                  onClick={handleDeleteAlertConfirm}
                >
                  <Trash2 size={14} style={{ display: 'inline', marginRight: 4 }} />
                  Eliminar
                </button>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
