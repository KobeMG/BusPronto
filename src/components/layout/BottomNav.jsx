import { Link, useLocation } from 'react-router-dom';
import { Bus, Film, Heart, Settings, Calendar } from 'lucide-react';
import styles from './BottomNav.module.css';

const NAV_ITEMS = [
  { to: '/', label: 'Buses', Icon: Bus, isActive: (p) => p === '/' || p.startsWith('/rutas-internas') || p.startsWith('/rutas-externas') },
  { to: '/cinema', label: 'Cine', Icon: Film, isActive: (p) => p.startsWith('/cinema') },
  { to: '/aliados', label: 'Aliados', Icon: Heart, isActive: (p) => p.startsWith('/aliados') },
  { to: '/eventos', label: 'Eventos', Icon: Calendar, isActive: (p) => p.startsWith('/eventos') },
  { to: '/configuracion', label: 'Config.', Icon: Settings, isActive: (p) => p.startsWith('/configuracion') },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <div className={styles.bottomNavWrapper}>
      <nav className={styles.glassPill}>
        {NAV_ITEMS.map(({ to, label, Icon, isActive }) => {
          const activeNow = isActive(location.pathname);
          return (
            <Link
              key={to}
              to={to}
              className={`${styles.navItem} ${activeNow ? styles.active : ''}`}
            >
              <div className={styles.iconContainer}>
                <Icon size={20} strokeWidth={activeNow ? 2.5 : 2} />
              </div>
              <span className={styles.label}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;
