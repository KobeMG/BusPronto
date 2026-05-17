import { useEffect } from 'react';
import { BellRing, Loader2 } from 'lucide-react';
import styles from './NotificationPromptModal.module.css';

export function NotificationPromptModal({ isOpen, onClose, onAccept, loading }) {
  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrapper}>
          <BellRing size={32} />
        </div>
        
        <h2 className={styles.title}>Manténgase Informado</h2>
        
        <p className={styles.description}>
          Para avisarle cuando haya cambios en los horarios o buses atrasados, necesitamos su permiso. ¿Desea activar las notificaciones?
        </p>

        <div className={styles.buttonGroup}>
          <button 
            className={styles.acceptBtn} 
            onClick={onAccept}
            disabled={loading}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Sí, activar'}
          </button>
          <button className={styles.cancelBtn} onClick={onClose} disabled={loading}>
            Quizás más tarde
          </button>
        </div>
      </div>
    </div>
  );
}
