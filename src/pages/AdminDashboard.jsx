import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  Users,
  Activity,
  Bell,
  CalendarDays,
  Send,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import AdminPushNotifications from '../components/admin/AdminPushNotifications';
import AdminEvents from '../components/admin/AdminEvents';
import AdminAlerts from '../components/admin/AdminAlerts';
import styles from './Admin.module.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState('notifications');
  const [userEmail, setUserEmail] = useState('');
  const [stats, setStats] = useState({ events: [], alerts: [], lastPushResult: null });

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

  const pushResult = stats.lastPushResult;

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
        </section>

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
            <Send size={15} />
            Alertas de Bus
          </button>
        </nav>

        <AnimatePresence mode="wait">
          {activeModule === 'notifications' && (
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

          {activeModule === 'events' && (
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

          {activeModule === 'alerts' && (
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
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
