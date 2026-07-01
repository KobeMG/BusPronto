import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  Users,
  Activity,
  Bell,
  CalendarDays,
  Send,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { usePermissions } from '../hooks/usePermissions';
import AdminPushNotifications from '../components/admin/AdminPushNotifications';
import AdminEvents from '../components/admin/AdminEvents';
import AdminAlerts from '../components/admin/AdminAlerts';
import AdminSuggestions from '../components/admin/AdminSuggestions';
import styles from './Admin.module.css';

const MODULE_PERMISSIONS = {
  notifications: 'module.notifications',
  events: 'module.events',
  alerts: 'module.alerts',
  suggestions: 'module.suggestions',
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { permissions, roleName, loading: permissionsLoading, hasPermission } = usePermissions();
  const [requestedModule, setRequestedModule] = useState('notifications');
  const [userEmail, setUserEmail] = useState('');
  const [stats, setStats] = useState({ events: [], alerts: [], lastPushResult: null, suggestions: [] });

  const activeModule = useMemo(() => {
    if (hasPermission(MODULE_PERMISSIONS[requestedModule])) {
      return requestedModule;
    }
    const firstPermitted = Object.keys(MODULE_PERMISSIONS).find(
      (module) => hasPermission(MODULE_PERMISSIONS[module])
    );
    return firstPermitted || requestedModule;
  }, [requestedModule, hasPermission]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    });

    // Conteo rápido para el badge del dashboard
    supabase
      .from('suggestions')
      .select('id, status')
      .then(({ data }) => {
        if (data) setStats((s) => ({ ...s, suggestions: data }));
      });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login', { replace: true });
  };

  const pushResult = stats.lastPushResult;

  if (permissionsLoading) {
    return (
      <div className={styles.adminPage}>
        <div className={styles.accessDeniedContainer}>
          <Activity size={32} className="animate-spin" />
          <p>Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (permissions.length === 0) {
    return (
      <div className={styles.adminPage}>
        <div className={styles.accessDeniedContainer}>
          <ShieldAlert size={48} className={styles.accessDeniedIcon} />
          <h2 className={styles.accessDeniedTitle}>Acceso Denegado</h2>
          <p className={styles.accessDeniedText}>
            No tienes permisos para acceder al panel de administración.
          </p>
          <button onClick={handleLogout} className={styles.accessDeniedBtn}>
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminPage}>
      <div className={styles.dashboardContainer}>
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
              {roleName && <span className={styles.roleBadge}>{roleName}</span>}
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

          {hasPermission(MODULE_PERMISSIONS.notifications) && (
            <Motion.div
              className={styles.statCard}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className={styles.statInfo}>
                <h3>Tasa de Entrega</h3>
                <div className={styles.statValue}>
                  {pushResult?.stats
                    ? `${Math.round((pushResult.stats.successful / pushResult.stats.total) * 100)}%`
                    : 'N/A'}
                </div>
                {pushResult?.stats ? (
                  <span className={`${styles.statBadge} ${styles.statBadgePositive}`}>
                    {pushResult.stats.successful}/{pushResult.stats.total} dispositivos
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
          )}

          <Motion.div
            className={styles.statCard}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className={styles.statInfo}>
              <h3>Eventos Registrados</h3>
              <div className={styles.statValue}>{stats.events.length || '\u2014'}</div>
              <span className={`${styles.statBadge} ${styles.statBadgeNeutral}`}>
                {stats.events.filter((e) => e.is_visible).length} visibles
              </span>
            </div>
            <div className={styles.statIconContainer}>
              <CalendarDays size={22} />
            </div>
          </Motion.div>

          {hasPermission(MODULE_PERMISSIONS.alerts) && (
            <Motion.div
              className={styles.statCard}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className={styles.statInfo}>
                <h3>Alertas de Bus</h3>
                <div className={styles.statValue}>{stats.alerts.length || '\u2014'}</div>
                <span className={`${styles.statBadge} ${styles.statBadgeNeutral}`}>
                  {stats.alerts.filter((a) => a.active).length} activas
                </span>
              </div>
              <div className={styles.statIconContainer}>
                <Bell size={22} />
              </div>
            </Motion.div>
          )}

          {hasPermission(MODULE_PERMISSIONS.suggestions) && (
            <Motion.div
              className={styles.statCard}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <div className={styles.statInfo}>
                <h3>Sugerencias</h3>
                <div className={styles.statValue}>{stats.suggestions.length || '\u2014'}</div>
                <span className={`${styles.statBadge} ${styles.statBadgeNeutral}`}>
                  {stats.suggestions.filter((s) => s.status === 'pending').length} pendientes
                </span>
              </div>
              <div className={styles.statIconContainer}>
                <MessageSquare size={22} />
              </div>
            </Motion.div>
          )}
        </section>

        <nav className={styles.moduleTabNav}>
          {hasPermission(MODULE_PERMISSIONS.notifications) && (
            <button
              id="tab-notifications"
              className={`${styles.moduleTabBtn} ${activeModule === 'notifications' ? styles.moduleTabBtnActive : ''}`}
              onClick={() => setRequestedModule('notifications')}
            >
              <Bell size={15} />
              Notificaciones en Tiempo Real
            </button>
          )}
          {hasPermission(MODULE_PERMISSIONS.events) && (
            <button
              id="tab-events"
              className={`${styles.moduleTabBtn} ${activeModule === 'events' ? styles.moduleTabBtnActive : ''}`}
              onClick={() => setRequestedModule('events')}
            >
              <CalendarDays size={15} />
              Eventos
            </button>
          )}
          {hasPermission(MODULE_PERMISSIONS.alerts) && (
            <button
              id="tab-alerts"
              className={`${styles.moduleTabBtn} ${activeModule === 'alerts' ? styles.moduleTabBtnActive : ''}`}
              onClick={() => setRequestedModule('alerts')}
            >
              <Send size={15} />
              Alertas de Bus
            </button>
          )}
          {hasPermission(MODULE_PERMISSIONS.suggestions) && (
            <button
              id="tab-suggestions"
              className={`${styles.moduleTabBtn} ${activeModule === 'suggestions' ? styles.moduleTabBtnActive : ''}`}
              onClick={() => setRequestedModule('suggestions')}
            >
              <MessageSquare size={15} />
              Sugerencias
              {stats.suggestions.filter((s) => s.status === 'pending').length > 0 && (
                <span style={{
                  marginLeft: '0.5rem',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  fontSize: '0.7rem',
                  padding: '0.15rem 0.35rem',
                  borderRadius: '999px',
                  fontWeight: 'bold',
                  lineHeight: 1
                }}>
                  {stats.suggestions.filter((s) => s.status === 'pending').length}
                </span>
              )}
            </button>
          )}
        </nav>

        <AnimatePresence mode="wait">
          {activeModule === 'notifications' && hasPermission(MODULE_PERMISSIONS.notifications) && (
            <Motion.div
              key="notifications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <AdminPushNotifications
                onResult={(r) => setStats((s) => ({ ...s, lastPushResult: r }))}
              />
            </Motion.div>
          )}

          {activeModule === 'events' && hasPermission(MODULE_PERMISSIONS.events) && (
            <Motion.div
              key="events"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <AdminEvents
                onStatsUpdate={(events) => setStats((s) => ({ ...s, events }))}
              />
            </Motion.div>
          )}

          {activeModule === 'alerts' && hasPermission(MODULE_PERMISSIONS.alerts) && (
            <Motion.div
              key="alerts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <AdminAlerts
                onStatsUpdate={(alerts) => setStats((s) => ({ ...s, alerts }))}
              />
            </Motion.div>
          )}

          {activeModule === 'suggestions' && hasPermission(MODULE_PERMISSIONS.suggestions) && (
            <Motion.div
              key="suggestions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <AdminSuggestions
                onStatsUpdate={(suggestions) => setStats((s) => ({ ...s, suggestions }))}
              />
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
