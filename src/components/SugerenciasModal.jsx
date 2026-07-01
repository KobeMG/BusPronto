import { useState, useEffect } from 'react';
import { MessageSquare, Loader2, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import styles from './SugerenciasModal.module.css';

export function SugerenciasModal({ isOpen, onClose }) {
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null

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

  // Resetear status al cerrar
  useEffect(() => {
    if (!isOpen) setStatus(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setStatus(null);

    try {
      const { error } = await supabase
        .from('suggestions')
        .insert([{ content: content.trim(), contact: contact.trim() || null }]);

      if (error) throw error;

      setStatus('success');
      setContent('');
      setContact('');
    } catch (err) {
      console.error('Error enviando sugerencia:', err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar modal">
          <X size={20} />
        </button>

        <div className={styles.iconWrapper}>
          <MessageSquare size={28} />
        </div>

        <h2 className={styles.title}>Opiniones y Sugerencias</h2>
        <p className={styles.description}>
          Ayúdenos a mejorar BusPronto. Cuéntenos qué le gusta, qué falla o qué le gustaría ver en la app.
        </p>

        {status === 'success' && (
          <div className={styles.statusBannerSuccess}>
            <CheckCircle2 size={18} />
            <span>¡Gracias por su mensaje! Lo revisaremos pronto.</span>
          </div>
        )}

        {status === 'error' && (
          <div className={styles.statusBannerError}>
            <AlertTriangle size={18} />
            <span>Hubo un problema al enviar su sugerencia. Inténtelo de nuevo.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="suggestion-content" className={styles.label}>
              Su sugerencia u opinión <span className={styles.required}>*</span>
            </label>
            <textarea
              id="suggestion-content"
              rows={4}
              className={styles.textarea}
              placeholder="Escriba su comentario aquí..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={loading}
              maxLength={1000}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="suggestion-contact" className={styles.label}>
              Medio de contacto <span className={styles.optional}>(opcional)</span>
            </label>
            <input
              id="suggestion-contact"
              type="text"
              className={styles.input}
              placeholder="Instagram, WhatsApp, correo..."
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading || !content.trim()}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Enviando...
                </>
              ) : (
                'Enviar sugerencia'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
