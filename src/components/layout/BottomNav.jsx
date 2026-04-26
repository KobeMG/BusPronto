import { Link, useLocation } from 'react-router-dom';
import { Bus, Film, Calendar, Info } from 'lucide-react';
import styles from './BottomNav.module.css';

const BottomNav = () => {
  const location = useLocation();

  // Función para determinar si el tab de buses está activo.
  // Será true si estamos en el Home (/) o en cualquier ruta de rutas internas o externas.
  const isBusesActive =
    location.pathname === '/' ||
    location.pathname.startsWith('/rutas-internas') ||
    location.pathname.startsWith('/rutas-externas');

  const isCinemaActive = location.pathname.startsWith('/cinema');
  const isSemanaUActive = location.pathname.startsWith('/semana-u');
  const isAcercaActive = location.pathname.startsWith('/acerca');

  return (
    <div className={styles.bottomNavWrapper}>
      <nav className={styles.glassPill}>
        <Link
          to="/"
          className={`${styles.navItem} ${isBusesActive ? styles.active : ''}`}
        >
          <div className={styles.iconContainer}>
            <Bus size={20} strokeWidth={isBusesActive ? 2.5 : 2} />
          </div>
          <span className={styles.label}>Buses</span>
        </Link>

        <Link
          to="/cinema"
          className={`${styles.navItem} ${isCinemaActive ? styles.active : ''}`}
        >
          <div className={styles.iconContainer}>
            <Film size={20} strokeWidth={isCinemaActive ? 2.5 : 2} />
          </div>
          <span className={styles.label}>Cine</span>
        </Link>

        {/* <Link 
          to="/semana-u" 
          className={`${styles.navItem} ${isSemanaUActive ? styles.active : ''}`}
        >
          <div className={styles.iconContainer}>
            <Calendar size={20} strokeWidth={isSemanaUActive ? 2.5 : 2} />
          </div>
          <span className={styles.label}>Semana U</span>
        </Link> */}

        <Link
          to="/acerca"
          className={`${styles.navItem} ${isAcercaActive ? styles.active : ''}`}
        >
          <div className={styles.iconContainer}>
            <Info size={20} strokeWidth={isAcercaActive ? 2.5 : 2} />
          </div>
          <span className={styles.label}>Acerca</span>
        </Link>
      </nav>
    </div>
  );
};

export default BottomNav;
