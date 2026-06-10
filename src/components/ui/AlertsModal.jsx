import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Bell, ExternalLink, Loader2, Info } from 'lucide-react';
import styles from './AlertsModal.module.css';

/**
 * AlertsModal displays the latest bus alerts and updates local storage
 * to mark all current alerts as seen.
 */
const AlertsModal = ({ isOpen, onClose, alerts = [], loading = false, error = false, onSeenUpdated }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && alerts.length > 0) {
      // Save all active alert IDs to localStorage
      try {
        const activeIds = alerts.map((alert) => alert.id);
        localStorage.setItem('bp_seen_alerts', JSON.stringify(activeIds));

        // Notify parent to refresh/clear the badge
        if (onSeenUpdated) {
          onSeenUpdated();
        }
      } catch (err) {
        console.warn('Error saving seen alerts to localStorage:', err);
      }
    }
  }, [isOpen, alerts, onSeenUpdated]);

  if (!isOpen) return null;

  const handleReminderClick = (e) => {
    e.preventDefault();
    onClose();
    navigate('/configuracion');
  };

  // Format date helper
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose} id="alerts-modal-overlay">
      <div
        className={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="alerts-modal-title"
      >
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <Bell size={22} className={styles.bellIcon} />
            <h2 id="alerts-modal-title" className={styles.title}>Alertas Recientes</h2>
          </div>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Cerrar modal"
            id="alerts-modal-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.emptyState}>
              <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
              <p className={styles.emptyText}>Cargando alertas...</p>
            </div>
          ) : error ? (
            <div className={styles.emptyState}>
              <Info size={32} style={{ color: 'var(--status-critical, #ef4444)' }} />
              <p className={styles.emptyText}>Hubo un problema al cargar las alertas.</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className={styles.emptyState}>
              <Info size={32} />
              <p className={styles.emptyText}>No hay cambios en el servicio por el momento.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className={styles.alertCard}>
                <div className={styles.alertHeader}>
                  <h3 className={styles.alertTitle}>{alert.title}</h3>

                </div>
                <p className={styles.alertMessage}>{alert.message}</p>
                <span className={styles.alertDate}>{formatDate(alert.created_at)}</span>
              </div>
            ))
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.reminderBox}>
            <p className={styles.reminderText}>
              ¿Quiere recibir alertas instantáneas en su celular incluso con la app cerrada?
            </p>
            <a
              href="/configuracion"
              onClick={handleReminderClick}
              className={styles.reminderLink}
              id="alerts-modal-setup-link"
            >
              Activar notificaciones push <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsModal;
