import { useState, useEffect, useCallback, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  CheckCircle,
  Archive,
  Trash2,
  Inbox,
  User,
  Clock,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import styles from './AdminSuggestions.module.css';
import DeleteConfirmModal from './DeleteConfirmModal';

const AdminSuggestions = ({ onStatsUpdate }) => {
  const onStatsUpdateRef = useRef(onStatsUpdate);
  onStatsUpdateRef.current = onStatsUpdate;

  const [suggestions, setSuggestions] = useState([]);
  const [filter, setFilter] = useState('pending'); // 'pending' | 'read' | 'archived'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setSuggestions(data || []);

      if (onStatsUpdateRef.current) {
        onStatsUpdateRef.current(data || []);
      }
    } catch (err) {
      console.error('Error cargando sugerencias:', err);
      setError('No se pudieron cargar las sugerencias.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  useEffect(() => {
    if (onStatsUpdateRef.current) onStatsUpdateRef.current(suggestions);
  }, [suggestions]);

  const updateStatus = async (id, newStatus) => {
    try {
      const { error: err } = await supabase
        .from('suggestions')
        .update({ status: newStatus })
        .eq('id', id);

      if (err) throw err;

      setSuggestions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
      );
    } catch (err) {
      console.error('Error actualizando sugerencia:', err);
      alert('Error al actualizar el estado de la sugerencia.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      const { error: err } = await supabase
        .from('suggestions')
        .delete()
        .eq('id', deleteTarget.id);

      if (err) throw err;

      setSuggestions((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error eliminando sugerencia:', err);
      alert('Error al eliminar la sugerencia.');
    }
  };

  const filteredSuggestions = suggestions.filter((s) => s.status === filter);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <MessageSquare size={20} className={styles.titleIcon} />
          <h2>Opiniones y Sugerencias</h2>
          <span className={styles.badgeCount}>
            {filteredSuggestions.length}
          </span>
        </div>
        <button
          onClick={fetchSuggestions}
          disabled={loading}
          className={styles.refreshBtn}
          title="Actualizar lista"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      <nav className={styles.tabs}>
        <button
          className={`${styles.tabBtn} ${filter === 'pending' ? styles.tabBtnActive : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pendientes
          {suggestions.filter((s) => s.status === 'pending').length > 0 && (
            <span className={styles.pendingDot} />
          )}
        </button>
        <button
          className={`${styles.tabBtn} ${filter === 'read' ? styles.tabBtnActive : ''}`}
          onClick={() => setFilter('read')}
        >
          Leídas
        </button>
        <button
          className={`${styles.tabBtn} ${filter === 'archived' ? styles.tabBtnActive : ''}`}
          onClick={() => setFilter('archived')}
        >
          Archivadas
        </button>
      </nav>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.listContainer}>
        {loading && suggestions.length === 0 ? (
          <div className={styles.emptyState}>
            <RotateCcw size={32} className="animate-spin" />
            <p>Cargando sugerencias...</p>
          </div>
        ) : filteredSuggestions.length === 0 ? (
          <div className={styles.emptyState}>
            <Inbox size={32} />
            <p>No hay sugerencias en esta categoría.</p>
          </div>
        ) : (
          <div className={styles.suggestionsGrid}>
            <AnimatePresence mode="popLayout">
              {filteredSuggestions.map((item) => (
                <Motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={styles.card}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.metaInfo}>
                      <span className={styles.metaItem}>
                        <Clock size={12} />
                        {formatDate(item.created_at)}
                      </span>
                      {item.contact && (
                        <span className={styles.contactBadge} title="Método de contacto brindado">
                          <User size={12} />
                          {item.contact}
                        </span>
                      )}
                    </div>

                    <div className={styles.actions}>
                      {item.status === 'pending' && (
                        <button
                          onClick={() => updateStatus(item.id, 'read')}
                          className={`${styles.actionBtn} ${styles.actionBtnCheck}`}
                          title="Marcar como leída"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}

                      {item.status !== 'archived' ? (
                        <button
                          onClick={() => updateStatus(item.id, 'archived')}
                          className={`${styles.actionBtn} ${styles.actionBtnArchive}`}
                          title="Archivar"
                        >
                          <Archive size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => updateStatus(item.id, 'pending')}
                          className={`${styles.actionBtn} ${styles.actionBtnRestore}`}
                          title="Restaurar a pendientes"
                        >
                          <RotateCcw size={16} />
                        </button>
                      )}

                      <button
                        onClick={() => setDeleteTarget(item)}
                        className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                        title="Eliminar permanentemente"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className={styles.messageContent}>{item.content}</p>
                </Motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      </div>

      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirmModal
            title="Eliminar Sugerencia"
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTarget(null)}
          >
            ¿Seguro que deseas eliminar esta sugerencia? Esta acción no se puede deshacer.
          </DeleteConfirmModal>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminSuggestions;
