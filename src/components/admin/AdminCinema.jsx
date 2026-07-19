import { useState, useEffect, useCallback } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Calendar,
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  MapPin,
  Video,
  Clock,
  Film,
  RefreshCw,
} from 'lucide-react';
import {
  getAllMoviesAdmin,
  createMovie,
  updateMovie,
  deleteMovie,
  uploadPoster,
} from '../../services/cinema.service';
import styles from './AdminCinema.module.css';
import DeleteConfirmModal from './DeleteConfirmModal';

const EMPTY_FORM = {
  title: '',
  synopsis: '',
  poster_url: '',
  screening_date: '',
  screening_time: '',
  virtual: false,
  location_name: '',
  location_details: '',
};

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date + 'T12:00:00').toLocaleDateString('es-CR', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
};

const PosterImg = ({ src, alt, imgClass, placeholderClass }) => {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className={placeholderClass}>
        <Film size={20} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={imgClass}
      onError={() => setError(true)}
    />
  );
};

const AdminCinema = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [result, setResult] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [posterInputKey, setPosterInputKey] = useState(0);

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllMoviesAdmin();
      setMovies(data);
    } catch (err) {
      setError(err.message || 'Error cargando películas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePosterChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPoster(true);
    try {
      const url = await uploadPoster(file);
      handleFormChange('poster_url', url);
    } catch (err) {
      console.error('Error uploading poster:', err);
    } finally {
      setUploadingPoster(false);
    }
  };

  const handleEditMovie = (movie) => {
    setEditingId(movie.id);
    setFormData({
      title: movie.title || '',
      synopsis: movie.synopsis || '',
      poster_url: movie.poster_url || '',
      screening_date: movie.screening_date || '',
      screening_time: movie.screening_time || '',
      virtual: movie.virtual ?? false,
      location_name: movie.location_name || '',
      location_details: movie.location_details || '',
    });
    setResult(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setResult(null);
    setPosterInputKey(prev => prev + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setResult(null);

    const payload = {
      title: formData.title.trim(),
      synopsis: formData.synopsis.trim() || null,
      poster_url: formData.poster_url.trim() || null,
      screening_date: formData.screening_date || null,
      screening_time: formData.screening_time || null,
      virtual: formData.virtual,
      location_name: formData.location_name.trim() || null,
      location_details: formData.location_details.trim() || null,
    };

    try {
      if (editingId) {
        await updateMovie(editingId, payload);
        setResult({ success: true, message: '¡Película actualizada correctamente!' });
      } else {
        await createMovie(payload);
        setResult({ success: true, message: '¡Película creada correctamente!' });
      }
      setEditingId(null);
      setFormData(EMPTY_FORM);
      setPosterInputKey(prev => prev + 1);
      await fetchMovies();
    } catch (err) {
      setResult({ error: err.message || 'Error al guardar la película.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMovie(deleteTarget.id);
      setMovies(movies.filter((m) => m.id !== deleteTarget.id));
      if (editingId === deleteTarget.id) handleCancelEdit();
    } catch (err) {
      setResult({ error: err.message || 'Error al eliminar la película.' });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <div className={styles.cinemaModule}>
        <div className={styles.cinemaListPanel}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <Film size={18} style={{ color: '#60a5fa' }} />
              Películas Registradas
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={styles.cinemaCount}>{movies.length} total</span>
              <button
                onClick={fetchMovies}
                disabled={loading}
                className={styles.editBtn}
                title="Recargar películas"
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

          <div className={styles.cinemaListScroll}>
            {loading ? (
              <div className={styles.emptyCinemaState}>
                <div className={styles.spinnerLg} />
                <p>Cargando películas...</p>
              </div>
            ) : error ? (
              <div className={styles.emptyCinemaState}>
                <AlertTriangle size={32} style={{ color: '#f87171' }} />
                <p>{error}</p>
                <p style={{ fontSize: '0.75rem', color: '#475569' }}>
                  Verifica que las políticas RLS de Supabase permitan escritura.
                </p>
              </div>
            ) : movies.length === 0 ? (
              <div className={styles.emptyCinemaState}>
                <CalendarDays size={36} style={{ color: '#334155' }} />
                <p>No hay películas registradas.</p>
                <p style={{ fontSize: '0.8rem', color: '#475569' }}>Crea la primera película con el formulario.</p>
              </div>
            ) : (
              movies.map((movie) => (
                <div
                  key={movie.id}
                  className={`${styles.cinemaRow} ${editingId === movie.id ? styles.cinemaRowEditing : ''}`}
                >
                  <div className={styles.cinemaRowTop}>
                    <div className={styles.cinemaRowLeft}>
                      <PosterImg
                        key={movie.poster_url || 'none'}
                        src={movie.poster_url}
                        alt={movie.title}
                        imgClass={styles.posterThumb}
                        placeholderClass={styles.posterThumbPlaceholder}
                      />
                      <div className={styles.cinemaRowMeta}>
                        <span className={styles.cinemaRowTitle} title={movie.title}>
                          {movie.title}
                        </span>
                        <div className={styles.cinemaRowDates}>
                          <Calendar size={11} />
                          {formatDate(movie.screening_date)}
                          {movie.screening_time && (
                            <>
                              <Clock size={11} />
                              {movie.screening_time.slice(0, 5)}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={styles.cinemaRowActions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => handleEditMovie(movie)}
                        title="Editar película"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => setDeleteTarget(movie)}
                        title="Eliminar película"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.cinemaRowBadges}>
                    {movie.virtual ? (
                      <span className={styles.virtualBadge}>
                        <Video size={10} style={{ display: 'inline', marginRight: 2 }} />
                        Zoom
                      </span>
                    ) : (
                      <span className={styles.presencialBadge}>
                        <MapPin size={10} style={{ display: 'inline', marginRight: 2 }} />
                        Presencial
                      </span>
                    )}
                    {movie.location_name && (
                      <span className={styles.locationBadge}>
                        <MapPin size={10} style={{ display: 'inline', marginRight: 2 }} />
                        {movie.location_name}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.cinemaFormCard}>
          <div className={styles.cinemaFormHeader}>
            <h2 className={styles.cinemaFormTitle}>
              {editingId ? (
                <>
                  <Pencil size={17} style={{ color: '#60a5fa' }} />
                  Editar Película
                </>
              ) : (
                <>
                  <Plus size={17} style={{ color: '#60a5fa' }} />
                  Nueva Película
                </>
              )}
            </h2>
            {editingId && (
              <button className={styles.cancelEditBtn} onClick={handleCancelEdit}>
                Cancelar edición
              </button>
            )}
          </div>

          <form className={styles.cinemaForm} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="ci-title">Título *</label>
              <input
                id="ci-title"
                type="text"
                className={styles.inputFieldNoIcon}
                placeholder="Ej: El Padrino"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="ci-synopsis">
                Sinopsis <span className={styles.optional}>(opcional)</span>
              </label>
              <textarea
                id="ci-synopsis"
                className={styles.inputFieldNoIcon}
                placeholder="Breve descripción de la película..."
                value={formData.synopsis}
                onChange={(e) => handleFormChange('synopsis', e.target.value)}
                rows={3}
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="ci-poster">
                Poster <span className={styles.optional}>(opcional)</span>
              </label>
              <div className={styles.posterFieldRow}>
                <div className={styles.posterFieldInput}>
                  <input
                    key={posterInputKey}
                    id="ci-poster"
                    type="file"
                    accept="image/*"
                    className={styles.inputFieldNoIcon}
                    onChange={handlePosterChange}
                    disabled={uploadingPoster}
                  />
                  {uploadingPoster && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Subiendo...</span>}
                </div>
                <PosterImg
                  key={formData.poster_url || 'none'}
                  src={formData.poster_url}
                  alt="Preview"
                  imgClass={styles.posterPreview}
                  placeholderClass={styles.posterPreviewPlaceholder}
                />
              </div>
            </div>

            <div className={styles.cinemaFormGrid}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="ci-date">Fecha de función *</label>
                <input
                  id="ci-date"
                  type="date"
                  className={styles.inputFieldNoIcon}
                  value={formData.screening_date}
                  onChange={(e) => handleFormChange('screening_date', e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="ci-time">
                  Hora <span className={styles.optional}>(opcional)</span>
                </label>
                <input
                  id="ci-time"
                  type="time"
                  className={styles.inputFieldNoIcon}
                  value={formData.screening_time}
                  onChange={(e) => handleFormChange('screening_time', e.target.value)}
                />
              </div>
            </div>

            <div className={styles.cinemaFormGrid}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="ci-location">Nombre del lugar</label>
                <input
                  id="ci-location"
                  type="text"
                  className={styles.inputFieldNoIcon}
                  placeholder="Ej: Auditorio UCR / Zoom"
                  value={formData.location_name}
                  onChange={(e) => handleFormChange('location_name', e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="ci-details">
                  Detalles de ubicación <span className={styles.optional}>(opcional)</span>
                </label>
                <input
                  id="ci-details"
                  type="text"
                  className={styles.inputFieldNoIcon}
                  placeholder="Enlace de Zoom o dirección"
                  value={formData.location_details}
                  onChange={(e) => handleFormChange('location_details', e.target.value)}
                />
              </div>
            </div>

            {formData.location_details && (
              <p className={styles.fieldHint}>
                Si es un enlace (http...), se mostrará como botón clickeable en la página pública.
              </p>
            )}

            <div className={styles.checkboxRow}>
              <label className={styles.checkboxLabel} htmlFor="ci-virtual">
                <input
                  id="ci-virtual"
                  type="checkbox"
                  checked={formData.virtual}
                  onChange={(e) => handleFormChange('virtual', e.target.checked)}
                />
                Función virtual (Zoom)
              </label>
            </div>

            <button
              type="submit"
              className={styles.cinemaSubmitBtn}
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
                  <Plus size={16} /> Crear Película
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirmModal
            title="Eliminar Película"
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTarget(null)}
          >
            ¿Seguro que deseas eliminar <strong style={{ color: '#f1f5f9' }}>"{deleteTarget.title}"</strong>?
            Esta acción no se puede deshacer.
          </DeleteConfirmModal>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminCinema;
