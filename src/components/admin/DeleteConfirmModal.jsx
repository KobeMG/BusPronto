import { motion as Motion } from 'framer-motion';
import { AlertTriangle, Trash2 } from 'lucide-react';
import styles from './DeleteConfirmModal.module.css';

const DeleteConfirmModal = ({ title, onConfirm, onCancel, children }) => (
  <Motion.div
    className={styles.overlay}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onCancel}
  >
    <Motion.div
      className={styles.modal}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.title}>
        <AlertTriangle size={18} style={{ color: '#f87171' }} />
        {title}
      </div>
      <p className={styles.text}>{children}</p>
      <div className={styles.actions}>
        <button className={styles.cancel} onClick={onCancel}>
          Cancelar
        </button>
        <button className={styles.delete} onClick={onConfirm}>
          <Trash2 size={14} style={{ display: 'inline', marginRight: 4 }} />
          Eliminar
        </button>
      </div>
    </Motion.div>
  </Motion.div>
);

export default DeleteConfirmModal;
