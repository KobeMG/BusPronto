import { useState, useEffect, useCallback, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  getAllAlertsAdmin,
  createAlert,
  updateAlert,
  deleteAlert,
  toggleAlertActive,
} from '../../services/alerts.service';
import styles from './AdminAlerts.module.css';
import DeleteConfirmModal from './DeleteConfirmModal';

const AdminAlerts = ({ onStatsUpdate }) => {
  const onStatsUpdateRef = useRef(onStatsUpdate);
  onStatsUpdateRef.current = onStatsUpdate;

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ title: '', message: '', active: true });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllAlertsAdmin();
      setAlerts(data);
      if (onStatsUpdateRef.current) onStatsUpdateRef.current(data);
    } catch (err) {
      setError(err.message || 'Error cargando alertas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = (alert) => {
    setEditingId(alert.id);
    setFormData({
      title: alert.title || '',
      message: alert.message || '',
      active: alert.active ?? true,
    });
    setResult(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', message: '', active: true });
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setResult(null);

    const payload = {
      title: formData.title.trim(),
      message: formData.message.trim(),
      active: formData.active,
    };

    try {
      if (editingId) {
        await updateAlert(editingId, payload);
        setResult({ success: true, message: '\u00a1Alerta actualizada correctamente!' });
      } else {
        await createAlert(payload);
        setResult({ success: true, message: '\u00a1Alerta creada correctamente!' });
      }
      setEditingId(null);
      setFormData({ title: '', message: '', active: true });
      await fetchAlerts();
    } catch (err) {
      setResult({ error: err.message || 'Error al guardar la alerta.' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (alert) => {
    setTogglingId(alert.id);
    try {
      await toggleAlertActive(alert.id, alert.active);
      const updated = alerts.map((a) =>
        a.id === alert.id ? { ...a, active: !a.active } : a
      );
      setAlerts(updated);
      if (onStatsUpdateRef.current) onStatsUpdateRef.current(updated);
    } catch (err) {
      console.error('Error toggling alert active state:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAlert(deleteTarget.id);
      const updated = alerts.filter((a) => a.id !== deleteTarget.id);
      setAlerts(updated);
      if (onStatsUpdateRef.current) onStatsUpdateRef.current(updated);
      if (editingId === deleteTarget.id) handleCancelEdit();
    } catch (err) {
      console.error('Error deleting alert:', err);
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <div className={styles.eventsModule}>
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
                disabled={loading}
                className={styles.editBtn}
                title="Recargar alertas"
                style={{ padding: '0.3rem 0.5rem' }}
              >
                <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {result && (
              <Motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={result.success ? styles.resultSuccess : styles.resultError}
                style={{ marginBottom: '1rem' }}
              >
                <div className={styles.resultTitle}>
                  {result.success ? (
                    <>
                      <CheckCircle2 size={15} />
                      <span>{result.message}</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={15} />
                      <span>Error: {result.error}</span>
                    </>
                  )}
                </div>
              </Motion.div>
            )}
          </AnimatePresence>

          <div className={styles.eventsListScroll}>
            {loading ? (
              <div className={styles.emptyEventsState}>
                <div className={styles.spinnerLg} />
                <p>Cargando alertas...</p>
              </div>
            ) : error ? (
              <div className={styles.emptyEventsState}>
                <AlertTriangle size={32} style={{ color: '#f87171' }} />
                <p>{error}</p>
              </div>
            ) : alerts.length === 0 ? (
              <div className={styles.emptyEventsState}>
                <Bell size={36} style={{ color: '#334155' }} />
                <p>No hay alertas registradas.</p>
                <p style={{ fontSize: '0.8rem', color: '#475569' }}>Crea la primera alerta con el formulario.</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`${styles.eventRow} ${editingId === alert.id ? styles.eventRowEditing : ''}`}
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
                      <button
                        id={`toggle-active-${alert.id}`}
                        className={`${styles.visibilityToggle} ${alert.active ? styles.visible : styles.hidden}`}
                        onClick={() => handleToggleActive(alert)}
                        disabled={togglingId === alert.id}
                        title={alert.active ? 'Activa \u2014 click para desactivar' : 'Inactiva \u2014 click para activar'}
                      >
                        {alert.active ? <Eye size={12} /> : <EyeOff size={12} />}
                        {alert.active ? 'Activa' : 'Inactiva'}
                      </button>
                      <button
                        id={`edit-alert-${alert.id}`}
                        className={styles.editBtn}
                        onClick={() => handleEdit(alert)}
                        title="Editar alerta"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        id={`delete-alert-${alert.id}`}
                        className={styles.deleteBtn}
                        onClick={() => setDeleteTarget(alert)}
                        title="Eliminar alerta"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.eventFormCard}>
          <div className={styles.eventFormHeader}>
            <h2 className={styles.eventFormTitle}>
              {editingId ? (
                <>
                  <Pencil size={17} style={{ color: '#60a5fa' }} />
                  Editar Alerta
                </>
              ) : (
                <>
                  <Plus size={17} style={{ color: '#60a5fa' }} />
                  Nueva Alerta
                </>
              )}
            </h2>
            {editingId && (
              <button className={styles.cancelEditBtn} onClick={handleCancelEdit}>
                Cancelar edición
              </button>
            )}
          </div>

          <form className={styles.eventForm} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="al-title">Título de la alerta *</label>
              <input
                id="al-title"
                type="text"
                className={styles.inputFieldNoIcon}
                placeholder="Ej: Atraso en Ruta Heredia"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                required
                maxLength={50}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="al-message">Mensaje descriptivo *</label>
              <textarea
                id="al-message"
                className={styles.textarea}
                style={{ background: 'rgba(15, 23, 42, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '0.75rem', padding: '0.75rem', color: '#fff', outline: 'none' }}
                placeholder="Detalle de la alerta..."
                rows={5}
                value={formData.message}
                onChange={(e) => handleFormChange('message', e.target.value)}
                required
                maxLength={250}
              />
            </div>

            <div className={styles.checkboxRow}>
              <label className={styles.checkboxLabel} htmlFor="al-active">
                <input
                  id="al-active"
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => handleFormChange('active', e.target.checked)}
                />
                Alerta activa (se mostrará a los usuarios)
              </label>
            </div>

            <button
              id="al-submit"
              type="submit"
              className={styles.eventSubmitBtn}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className={styles.spinnerSm} />
                  Guardando...
                </>
              ) : editingId ? (
                <>
                  <CheckCircle2 size={16} /> Guardar Cambios
                </>
              ) : (
                <>
                  <Plus size={16} /> Crear Alerta
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirmModal
            title="Eliminar Alerta"
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTarget(null)}
          >
            ¿Seguro que deseas eliminar la alerta <strong style={{ color: '#f1f5f9' }}>"{deleteTarget.title}"</strong>?
            Esta acción no se puede deshacer y desaparecerá para todos los usuarios.
          </DeleteConfirmModal>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminAlerts;
