import { useState, useEffect, useCallback, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Calendar,
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  MapPin,
  Clock,
  RefreshCw,
} from 'lucide-react';
import {
  getAllEventsAdmin,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEventVisibility,
} from '../../services/semanaU.service';
import styles from '../../pages/Admin.module.css';

const EMPTY_FORM = {
  title: '',
  organizer: '',
  location: '',
  modality: 'Presencial',
  start_time: '',
  event_date_start: '',
  event_date_finish: '',
  google_maps: '',
  registration_link: '',
  is_visible: true,
  is_active: true,
};

const formatDateRange = (start, finish) => {
  if (!start) return '\u2014';
  const opts = { day: 'numeric', month: 'short', timeZone: 'UTC' };
  const s = new Date(start + 'T12:00:00').toLocaleDateString('es-CR', opts);
  if (!finish || finish === start) return s;
  const f = new Date(finish + 'T12:00:00').toLocaleDateString('es-CR', opts);
  return `${s} \u2192 ${f}`;
};

const AdminEvents = ({ onStatsUpdate }) => {
  const onStatsUpdateRef = useRef(onStatsUpdate);
  onStatsUpdateRef.current = onStatsUpdate;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllEventsAdmin();
      setEvents(data);
      if (onStatsUpdateRef.current) onStatsUpdateRef.current(data);
    } catch (err) {
      setError(err.message || 'Error cargando eventos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditEvent = (event) => {
    setEditingId(event.id);
    setFormData({
      title: event.title || '',
      organizer: event.organizer || '',
      location: event.location || '',
      modality: event.modality || 'Presencial',
      start_time: event.start_time || '',
      event_date_start: event.event_date_start || '',
      event_date_finish: event.event_date_finish || '',
      google_maps: event.google_maps || '',
      registration_link: event.registration_link || '',
      is_visible: event.is_visible ?? true,
      is_active: event.is_active ?? true,
    });
    setResult(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setResult(null);

    if (formData.event_date_finish && formData.event_date_finish < formData.event_date_start) {
      setResult({ error: 'La fecha de fin no puede ser anterior a la fecha de inicio.' });
      setSaving(false);
      return;
    }

    const payload = {
      title: formData.title.trim(),
      organizer: formData.organizer.trim() || null,
      location: formData.location.trim() || null,
      modality: formData.modality,
      start_time: formData.start_time || null,
      event_date_start: formData.event_date_start,
      event_date_finish: formData.event_date_finish || formData.event_date_start,
      google_maps: formData.google_maps.trim() || null,
      registration_link: formData.registration_link.trim() || null,
      is_visible: formData.is_visible,
      is_active: formData.is_active,
    };

    try {
      if (editingId) {
        await updateEvent(editingId, payload);
        setResult({ success: true, message: '\u00a1Evento actualizado correctamente!' });
      } else {
        await createEvent(payload);
        setResult({ success: true, message: '\u00a1Evento creado correctamente!' });
      }
      setEditingId(null);
      setFormData(EMPTY_FORM);
      await fetchEvents();
    } catch (err) {
      setResult({ error: err.message || 'Error al guardar el evento.' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = async (event) => {
    setTogglingId(event.id);
    try {
      await toggleEventVisibility(event.id, event.is_visible);
      const updated = events.map((e) =>
        e.id === event.id ? { ...e, is_visible: !e.is_visible } : e
      );
      setEvents(updated);
      if (onStatsUpdateRef.current) onStatsUpdateRef.current(updated);
    } catch (err) {
      console.error('Error toggling visibility:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteEvent(deleteTarget.id);
      const updated = events.filter((e) => e.id !== deleteTarget.id);
      setEvents(updated);
      if (onStatsUpdateRef.current) onStatsUpdateRef.current(updated);
      if (editingId === deleteTarget.id) handleCancelEdit();
    } catch (err) {
      console.error('Error deleting event:', err);
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
              <Calendar size={18} style={{ color: '#60a5fa' }} />
              Eventos Registrados
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={styles.eventsCount}>{events.length} total</span>
              <button
                onClick={fetchEvents}
                disabled={loading}
                className={styles.editBtn}
                title="Recargar eventos"
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
                <Motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6' }}
                />
                <p>Cargando eventos...</p>
              </div>
            ) : error ? (
              <div className={styles.emptyEventsState}>
                <AlertTriangle size={32} style={{ color: '#f87171' }} />
                <p>{error}</p>
                <p style={{ fontSize: '0.75rem', color: '#475569' }}>
                  Verifica que las políticas RLS de Supabase permitan escritura.
                </p>
              </div>
            ) : events.length === 0 ? (
              <div className={styles.emptyEventsState}>
                <CalendarDays size={36} style={{ color: '#334155' }} />
                <p>No hay eventos registrados.</p>
                <p style={{ fontSize: '0.8rem', color: '#475569' }}>Crea el primer evento con el formulario.</p>
              </div>
            ) : (
              events.map((event) => (
                <Motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${styles.eventRow} ${editingId === event.id ? styles.eventRowEditing : ''}`}
                >
                  <div className={styles.eventRowTop}>
                    <div className={styles.eventRowMeta}>
                      <span className={styles.eventRowTitle} title={event.title}>
                        {event.title}
                      </span>
                      <div className={styles.eventRowDates}>
                        <Calendar size={11} />
                        {formatDateRange(event.event_date_start, event.event_date_finish)}
                        {event.start_time && (
                          <>
                            <Clock size={11} />
                            {event.start_time.slice(0, 5)}
                          </>
                        )}
                      </div>
                    </div>

                    <div className={styles.eventRowActions}>
                      <button
                        id={`toggle-visibility-${event.id}`}
                        className={`${styles.visibilityToggle} ${event.is_visible ? styles.visible : styles.hidden}`}
                        onClick={() => handleToggleVisibility(event)}
                        disabled={togglingId === event.id}
                        title={event.is_visible ? 'Visible \u2014 click para ocultar' : 'Oculto \u2014 click para publicar'}
                      >
                        {event.is_visible ? <Eye size={12} /> : <EyeOff size={12} />}
                        {event.is_visible ? 'Visible' : 'Oculto'}
                      </button>
                      <button
                        id={`edit-event-${event.id}`}
                        className={styles.editBtn}
                        onClick={() => handleEditEvent(event)}
                        title="Editar evento"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        id={`delete-event-${event.id}`}
                        className={styles.deleteBtn}
                        onClick={() => setDeleteTarget(event)}
                        title="Eliminar evento"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.eventRowBadges}>
                    <span className={styles.modalityBadge}>{event.modality || 'Presencial'}</span>
                    {event.is_active
                      ? <span className={styles.activeBadge}>Activo</span>
                      : <span className={styles.inactiveBadge}>Cancelado</span>}
                    {event.location && (
                      <span className={styles.modalityBadge} style={{ color: '#94a3b8' }}>
                        <MapPin size={10} style={{ display: 'inline', marginRight: 2 }} />
                        {event.location}
                      </span>
                    )}
                  </div>
                </Motion.div>
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
                  Editar Evento
                </>
              ) : (
                <>
                  <Plus size={17} style={{ color: '#60a5fa' }} />
                  Nuevo Evento
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
              <label className={styles.label} htmlFor="ev-title">Título del evento *</label>
              <input
                id="ev-title"
                type="text"
                className={styles.inputFieldNoIcon}
                placeholder="Ej: Concierto de Gala"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                required
              />
            </div>

            <div className={styles.eventFormGrid}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="ev-organizer">Organizador</label>
                <input
                  id="ev-organizer"
                  type="text"
                  className={styles.inputFieldNoIcon}
                  placeholder="Ej: FEUCR"
                  value={formData.organizer}
                  onChange={(e) => handleFormChange('organizer', e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="ev-location">Lugar</label>
                <input
                  id="ev-location"
                  type="text"
                  className={styles.inputFieldNoIcon}
                  placeholder="Ej: Auditorio UCR"
                  value={formData.location}
                  onChange={(e) => handleFormChange('location', e.target.value)}
                />
              </div>
            </div>

            <div className={styles.eventFormGrid}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="ev-date-start">Fecha inicio *</label>
                <input
                  id="ev-date-start"
                  type="date"
                  className={styles.inputFieldNoIcon}
                  value={formData.event_date_start}
                  onChange={(e) => handleFormChange('event_date_start', e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="ev-date-end">
                  Fecha fin <span className={styles.optional}>(si aplica)</span>
                </label>
                <input
                  id="ev-date-end"
                  type="date"
                  className={styles.inputFieldNoIcon}
                  value={formData.event_date_finish}
                  min={formData.event_date_start}
                  onChange={(e) => handleFormChange('event_date_finish', e.target.value)}
                />
              </div>
            </div>

            <div className={styles.eventFormGrid}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="ev-modality">Modalidad</label>
                <select
                  id="ev-modality"
                  className={styles.selectField}
                  value={formData.modality}
                  onChange={(e) => handleFormChange('modality', e.target.value)}
                >
                  <option value="Presencial">Presencial</option>
                  <option value="Virtual">Virtual</option>
                  <option value="Híbrido">Híbrido</option>
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="ev-time">Hora de inicio</label>
                <input
                  id="ev-time"
                  type="time"
                  className={styles.inputFieldNoIcon}
                  value={formData.start_time}
                  onChange={(e) => handleFormChange('start_time', e.target.value)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="ev-maps">
                Google Maps URL <span className={styles.optional}>(opcional)</span>
              </label>
              <input
                id="ev-maps"
                type="url"
                className={styles.inputFieldNoIcon}
                placeholder="https://maps.app.goo.gl/..."
                value={formData.google_maps}
                onChange={(e) => handleFormChange('google_maps', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="ev-reg">
                Link de inscripción <span className={styles.optional}>(opcional)</span>
              </label>
              <input
                id="ev-reg"
                type="url"
                className={styles.inputFieldNoIcon}
                placeholder="https://forms.gle/..."
                value={formData.registration_link}
                onChange={(e) => handleFormChange('registration_link', e.target.value)}
              />
            </div>

            <div className={styles.checkboxRow}>
              <label className={styles.checkboxLabel} htmlFor="ev-visible">
                <input
                  id="ev-visible"
                  type="checkbox"
                  checked={formData.is_visible}
                  onChange={(e) => handleFormChange('is_visible', e.target.checked)}
                />
                Visible públicamente
              </label>
              <label className={styles.checkboxLabel} htmlFor="ev-active">
                <input
                  id="ev-active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleFormChange('is_active', e.target.checked)}
                />
                Evento activo
              </label>
            </div>

            <button
              id="ev-submit"
              type="submit"
              className={styles.eventSubmitBtn}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff' }}
                  />
                  Guardando...
                </>
              ) : editingId ? (
                <>
                  <CheckCircle2 size={16} /> Guardar Cambios
                </>
              ) : (
                <>
                  <Plus size={16} /> Crear Evento
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {deleteTarget && (
          <Motion.div
            className={styles.deleteConfirmOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteTarget(null)}
          >
            <Motion.div
              className={styles.deleteConfirmModal}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.deleteConfirmTitle}>
                <AlertTriangle size={18} style={{ color: '#f87171' }} />
                Eliminar Evento
              </div>
              <p className={styles.deleteConfirmText}>
                ¿Seguro que deseas eliminar <strong style={{ color: '#f1f5f9' }}>"{deleteTarget.title}"</strong>?
                Esta acción no se puede deshacer.
              </p>
              <div className={styles.deleteConfirmActions}>
                <button
                  id="delete-cancel"
                  className={styles.deleteConfirmCancel}
                  onClick={() => setDeleteTarget(null)}
                >
                  Cancelar
                </button>
                <button
                  id="delete-confirm"
                  className={styles.deleteConfirmDelete}
                  onClick={handleDeleteConfirm}
                >
                  <Trash2 size={14} style={{ display: 'inline', marginRight: 4 }} />
                  Eliminar
                </button>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminEvents;
