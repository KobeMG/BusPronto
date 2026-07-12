import { useState, useEffect, useCallback } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  X,
  Clock,
  MapPin,
  RefreshCw
} from 'lucide-react';
import {
  getTransportSystems,
  getRoutesBySystem,
  getStops,
  getSchedulesByRoute,
  createSchedules,
  deleteSchedule
} from '../../services/schedules.service';
import styles from './AdminSchedules.module.css';

const DAYS_OF_WEEK = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
];

const guessStopsForRoute = (routeName, allStops) => {
  if (!routeName || !allStops || allStops.length === 0) return { originId: '', destId: '' };

  const parts = routeName.split(' a ');
  if (parts.length !== 2) return { originId: '', destId: '' };

  const [originPart, destPart] = parts.map(p => p.trim());

  const findBestStop = (partText, otherPartText) => {
    if (partText.toLowerCase() === 'ucr') {
      const otherKeyword = otherPartText.toLowerCase();
      const match = allStops.find(s => 
        s.name.toLowerCase().includes('ucr') && 
        s.name.toLowerCase().includes(otherKeyword)
      );
      if (match) return match.id.toString();
    }

    const containsMatch = allStops.find(s => 
      s.name.toLowerCase().includes(partText.toLowerCase()) && 
      !s.name.toLowerCase().includes('ucr')
    );
    if (containsMatch) return containsMatch.id.toString();

    const fallbackMatch = allStops.find(s => s.name.toLowerCase().includes(partText.toLowerCase()));
    return fallbackMatch ? fallbackMatch.id.toString() : '';
  };

  const originId = findBestStop(originPart, destPart);
  const destId = findBestStop(destPart, originPart);

  return { originId, destId };
};

const AdminSchedules = () => {
  const [systems, setSystems] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const [selectedSystem, setSelectedSystem] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('');

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    origin_stop_id: '',
    destination_stop_id: '',
    days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
  });
  const [timeInput, setTimeInput] = useState('');
  const [timesList, setTimesList] = useState([]);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingInitial(true);
      try {
        const [sysData, stopsData] = await Promise.all([
          getTransportSystems(),
          getStops()
        ]);
        setSystems(sysData);
        setStops(stopsData);
      } catch (err) {
        setError('Error al cargar datos iniciales.');
      } finally {
        setLoadingInitial(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedSystem) {
      getRoutesBySystem(selectedSystem).then(data => {
        setRoutes(data);
        setSelectedRoute('');
        setSchedules([]);
      }).catch(err => {
        setError('Error al cargar las rutas.');
      });
    } else {
      setRoutes([]);
      setSelectedRoute('');
      setSchedules([]);
    }
  }, [selectedSystem]);

  const loadSchedules = useCallback(async (routeId) => {
    if (!routeId) return;
    setLoadingSchedules(true);
    try {
      const data = await getSchedulesByRoute(routeId);
      setSchedules(data);
    } catch (err) {
      setError('Error al cargar horarios.');
    } finally {
      setLoadingSchedules(false);
    }
  }, []);

  useEffect(() => {
    if (selectedRoute) {
      loadSchedules(selectedRoute);
      
      // Auto-populate stops based on route name format "Origin a Destination"
      const currentRoute = routes.find(r => r.id.toString() === selectedRoute);
      if (currentRoute && stops.length > 0) {
        const { originId, destId } = guessStopsForRoute(currentRoute.name, stops);
        setFormData(prev => ({
          ...prev,
          origin_stop_id: originId,
          destination_stop_id: destId
        }));
      }
    }
  }, [selectedRoute, loadSchedules, routes, stops]);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleDay = (day) => {
    setFormData(prev => {
      if (prev.days.includes(day)) {
        return { ...prev, days: prev.days.filter(d => d !== day) };
      } else {
        return { ...prev, days: [...prev.days, day] };
      }
    });
  };

  const handleTimeKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTimeFromInput();
    }
  };

  const addTimeFromInput = () => {
    const times = timeInput.split(',').map(t => t.trim()).filter(t => t !== '');
    const validTimes = [];
    
    times.forEach(t => {
      // Basic time validation HH:MM
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (timeRegex.test(t)) {
        // pad with 0 if needed
        const formatted = t.length === 4 ? `0${t}` : t;
        if (!timesList.includes(formatted)) {
          validTimes.push(formatted);
        }
      }
    });

    if (validTimes.length > 0) {
      setTimesList(prev => [...prev, ...validTimes].sort());
      setTimeInput('');
    }
  };

  const removeTime = (timeToRemove) => {
    setTimesList(prev => prev.filter(t => t !== timeToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoute) {
      setResult({ error: 'Debes seleccionar una ruta primero.' });
      return;
    }
    if (timesList.length === 0) {
      setResult({ error: 'Debes agregar al menos una hora.' });
      return;
    }
    if (!formData.origin_stop_id || !formData.destination_stop_id) {
      setResult({ error: 'Debes seleccionar origen y destino.' });
      return;
    }
    if (formData.days.length === 0) {
      setResult({ error: 'Debes seleccionar al menos un día.' });
      return;
    }

    setSaving(true);
    setResult(null);

    // Create array of schedule objects to insert
    const schedulesToInsert = timesList.map(time => {
       // Ensure time format matches time column (HH:MM:SS is often expected by postgres, but HH:MM works if mapped)
       const departureTime = time.includes(':') && time.length === 5 ? `${time}:00` : time;
       return {
         route_id: parseInt(selectedRoute),
         origin_stop_id: parseInt(formData.origin_stop_id),
         destination_stop_id: parseInt(formData.destination_stop_id),
         departure_time: departureTime,
         days: formData.days
       };
    });

    try {
      await createSchedules(schedulesToInsert);
      setResult({ success: true, message: `¡${schedulesToInsert.length} horarios creados exitosamente!` });
      setTimesList([]); // Reset times after success
      await loadSchedules(selectedRoute);
    } catch (err) {
      setResult({ error: err.message || 'Error al guardar los horarios.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSchedule(deleteTarget.id);
      setSchedules(prev => prev.filter(s => s.id !== deleteTarget.id));
    } catch (err) {
      console.error('Error deleting schedule:', err);
    } finally {
      setDeleteTarget(null);
    }
  };

  // Utility to format time (e.g. 06:20:00 -> 06:20)
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5);
  };

  if (loadingInitial) {
    return (
      <div className={styles.emptyState}>
        <Motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6' }}
        />
        <p>Cargando sistemas de transporte...</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.schedulesModule}>
        <div className={styles.schedulesListPanel}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <CalendarDays size={18} style={{ color: '#60a5fa' }} />
              Gestión de Horarios
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={styles.schedulesCount}>{schedules.length} horarios</span>
              {selectedRoute && (
                <button
                  onClick={() => loadSchedules(selectedRoute)}
                  disabled={loadingSchedules}
                  className={styles.deleteBtn}
                  title="Recargar horarios"
                  style={{ padding: '0.3rem 0.5rem', background: 'transparent', border: 'none', color: '#94a3b8' }}
                >
                  <RefreshCw size={14} style={loadingSchedules ? { animation: 'spin 1s linear infinite' } : {}} />
                </button>
              )}
            </div>
          </div>

          <div className={styles.filtersRow}>
            <select
              className={styles.filterSelect}
              value={selectedSystem}
              onChange={(e) => setSelectedSystem(e.target.value)}
            >
              <option value="">-- Seleccionar Sistema --</option>
              {systems.map(sys => (
                <option key={sys.id} value={sys.id}>{sys.name}</option>
              ))}
            </select>

            <select
              className={styles.filterSelect}
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              disabled={!selectedSystem}
            >
              <option value="">-- Seleccionar Ruta --</option>
              {routes.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.schedulesListScroll}>
            {loadingSchedules ? (
              <div className={styles.emptyState}>
                 <Motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6' }}
                />
                <p>Cargando horarios...</p>
              </div>
            ) : !selectedRoute ? (
               <div className={styles.emptyState}>
                 <CalendarDays size={36} style={{ color: '#334155' }} />
                 <p>Selecciona un sistema y una ruta para ver los horarios.</p>
               </div>
            ) : schedules.length === 0 ? (
              <div className={styles.emptyState}>
                <Clock size={36} style={{ color: '#334155' }} />
                <p>No hay horarios registrados para esta ruta.</p>
              </div>
            ) : (
              schedules.map(schedule => (
                <Motion.div
                  key={schedule.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={styles.scheduleRow}
                >
                  <div className={styles.scheduleInfo}>
                    <div className={styles.scheduleTime}>
                      {formatTime(schedule.departure_time)}
                    </div>
                    <div className={styles.scheduleStops}>
                      {schedule.origin_stop?.name} → {schedule.destination_stop?.name}
                    </div>
                    <div className={styles.scheduleDays}>
                      {schedule.days?.join(', ')}
                    </div>
                  </div>
                  <div>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => setDeleteTarget(schedule)}
                      title="Eliminar horario"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </Motion.div>
              ))
            )}
          </div>
        </div>

        {/* Carga Masiva Form */}
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>
              <Plus size={17} style={{ color: '#60a5fa' }} />
              Carga Masiva de Horarios
            </h2>
          </div>
          
          <form className={styles.formBody} onSubmit={handleSubmit}>
             <AnimatePresence mode="wait">
              {result && (
                <Motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={result.success ? styles.resultSuccess : styles.resultError}
                >
                  <div className={styles.resultTitle}>
                    {result.success ? (
                      <><CheckCircle2 size={15} /> <span>{result.message}</span></>
                    ) : (
                      <><XCircle size={15} /> <span>{result.error}</span></>
                    )}
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>

            <div className={styles.field}>
              <label className={styles.label}>Ruta de Destino *</label>
              <div style={{ color: selectedRoute ? '#4ade80' : '#ef4444', fontSize: '0.85rem' }}>
                {selectedRoute ? routes.find(r => r.id.toString() === selectedRoute)?.name : 'Ninguna ruta seleccionada'}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}><MapPin size={12} style={{display:'inline'}}/> Parada de Origen *</label>
              <select
                className={styles.inputField}
                value={formData.origin_stop_id}
                onChange={(e) => handleFormChange('origin_stop_id', e.target.value)}
                required
              >
                <option value="">Seleccionar...</option>
                {stops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}><MapPin size={12} style={{display:'inline'}}/> Parada de Destino *</label>
              <select
                className={styles.inputField}
                value={formData.destination_stop_id}
                onChange={(e) => handleFormChange('destination_stop_id', e.target.value)}
                required
              >
                <option value="">Seleccionar...</option>
                {stops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Días de Operación *</label>
              <div className={styles.checkboxGrid}>
                {DAYS_OF_WEEK.map(day => (
                  <label key={day} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.days.includes(day)}
                      onChange={() => toggleDay(day)}
                    />
                    {day}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Horas de Salida (Formato 24h, ej: 06:20) *</label>
              <div className={styles.timesInputContainer}>
                 <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      className={styles.inputField}
                      placeholder="06:20, 07:00..."
                      value={timeInput}
                      onChange={(e) => setTimeInput(e.target.value)}
                      onKeyDown={handleTimeKeyDown}
                      onBlur={addTimeFromInput}
                    />
                    <button 
                      type="button" 
                      onClick={addTimeFromInput}
                      style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '0.5rem', padding: '0 1rem', color: '#fff', cursor: 'pointer' }}
                    >
                      Añadir
                    </button>
                 </div>
                 
                 {timesList.length > 0 && (
                   <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem' }}>
                     {timesList.map(time => (
                       <span key={time} className={styles.timeTag}>
                         {time}
                         <button type="button" onClick={() => removeTime(time)} className={styles.removeTimeBtn}>
                           <X size={12} />
                         </button>
                       </span>
                     ))}
                   </div>
                 )}
                 <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                   * Presiona Enter o usa comas para separar múltiples horas.
                 </div>
              </div>
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={saving || !selectedRoute}
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
              ) : (
                <>
                  <Plus size={16} /> Crear Horarios ({timesList.length})
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
                Eliminar Horario
              </div>
              <p className={styles.deleteConfirmText}>
                ¿Seguro que deseas eliminar el horario de las <strong style={{ color: '#f1f5f9' }}>{formatTime(deleteTarget.departure_time)}</strong>?
              </p>
              <div className={styles.deleteConfirmActions}>
                <button
                  className={styles.deleteConfirmCancel}
                  onClick={() => setDeleteTarget(null)}
                >
                  Cancelar
                </button>
                <button
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

export default AdminSchedules;
