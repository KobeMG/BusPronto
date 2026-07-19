import { useState, useEffect, Suspense } from 'react';
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import {
  Bell, CalendarDays, Send, MessageSquare, Clock, Film,
  LogOut, Menu, X, Activity, ShieldAlert, Store,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { usePermissions } from '../../hooks/usePermissions';
import styles from './AdminLayout.module.css';

const MODULE_PERMISSIONS = {
  cinema: 'module.cinema',
  aliados: 'module.aliados',
  notifications: 'module.notifications',
  events: 'module.events',
  alerts: 'module.alerts',
  schedules: 'module.schedules',
  suggestions: 'module.suggestions',
};

const NAV_ITEMS = [
  { key: 'cinema', label: 'Cine', icon: Film },
  { key: 'aliados', label: 'Aliados', icon: Store },
  { key: 'notifications', label: 'Notificaciones Push', icon: Send },
  { key: 'events', label: 'Eventos', icon: CalendarDays },
  { key: 'alerts', label: 'Notificaciones', icon: Bell },
  { key: 'schedules', label: 'Horarios', icon: Clock },
  { key: 'suggestions', label: 'Sugerencias', icon: MessageSquare },
];

/** Index route: redirige al primer módulo con permiso */
export const AdminIndex = () => {
  const { hasPermission, loading } = usePermissions();
  if (loading) return null;
  const first = Object.entries(MODULE_PERMISSIONS).find(([, perm]) => hasPermission(perm));
  return <Navigate to={`/admin/${first ? first[0] : 'notifications'}`} replace />;
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const { permissions, roleName, loading, hasPermission } = usePermissions();
  const [userEmail, setUserEmail] = useState('');
  const [pendingSuggestions, setPending] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) setUserEmail(session.user.email);
    });

    // ponytail: count-only query, no full load
    supabase
      .from('suggestions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .then(({ count }) => setPending(count ?? 0));
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login', { replace: true });
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
        <p>Verificando permisos...</p>
      </div>
    );
  }

  if (permissions.length === 0) {
    return (
      <div className={styles.loadingScreen}>
        <ShieldAlert size={48} className={styles.deniedIcon} />
        <h2>Acceso Denegado</h2>
        <p>No tienes permisos para acceder al panel de administración.</p>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <LogOut size={15} /> Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <span className={styles.logo}>BusPronto</span>
          <button className={styles.iconBtn} onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS
            .filter(({ key }) => hasPermission(MODULE_PERMISSIONS[key]))
            .map(({ key, label, icon: Icon }) => (
              <NavLink
                key={key}
                to={`/admin/${key}`}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={17} />
                <span>{label}</span>
                {key === 'suggestions' && pendingSuggestions > 0 && (
                  <span className={styles.badge}>{pendingSuggestions}</span>
                )}
              </NavLink>
            ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <Activity size={13} />
            <span className={styles.userEmail}>{userEmail || '...'}</span>
            {roleName && <span className={styles.roleBadge}>{roleName}</span>}
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={15} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <div className={styles.content}>
        <header className={styles.topBar}>
          <button className={styles.iconBtn} onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <h1 className={styles.pageTitle}>Panel de Administración</h1>
          <div className={styles.statusPill}>
            <span className={styles.pulsingDot} />
            <span>En línea</span>
          </div>
        </header>

        <main className={styles.main}>
          <Suspense fallback={
            <div className={styles.loadingScreen}>
              <div className={styles.spinner} />
              <p>Cargando módulo...</p>
            </div>
          }>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
