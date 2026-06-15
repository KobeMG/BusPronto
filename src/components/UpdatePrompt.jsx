import { useRegisterSW } from 'virtual:pwa-register/react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import styles from './UpdatePrompt.module.css';

/**
 * Muestra un toast cuando hay una nueva versión de la app disponible.
 * Usa el hook de vite-plugin-pwa para detectar el SW en espera y
 * activarlo al confirmar.
 */
const UpdatePrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const handleUpdate = () => {
    // Envía SKIP_WAITING al SW y recarga la página
    updateServiceWorker(true);
  };

  const handleDismiss = () => {
    setNeedRefresh(false);
  };

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          className={styles.toast}
          role="alert"
          aria-live="polite"
          initial={{ y: 80, opacity: 0, x: '-50%' }}
          animate={{ y: 0, opacity: 1, x: '-50%' }}
          exit={{ y: 80, opacity: 0, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
          <div className={styles.content}>
            <RefreshCw size={18} className={styles.icon} />
            <span className={styles.message}>Nueva versión disponible</span>
          </div>
          <div className={styles.actions}>
            <button
              id="update-prompt-update-btn"
              className={styles.updateBtn}
              onClick={handleUpdate}
            >
              Actualizar
            </button>
            <button
              id="update-prompt-dismiss-btn"
              className={styles.dismissBtn}
              onClick={handleDismiss}
              aria-label="Cerrar"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpdatePrompt;
