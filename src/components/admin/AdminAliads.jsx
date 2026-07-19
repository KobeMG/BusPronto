import { useState, useEffect, useCallback } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Store,
  X,
  Image,
  Link,
} from 'lucide-react';
import {
  getAllAds,
  createAd,
  updateAd,
  deleteAd,
  uploadAdLogo,
  uploadAdImage,
} from '../../services/ads.service';
import styles from './AdminAliads.module.css';
import DeleteConfirmModal from './DeleteConfirmModal';

const EMPTY_FORM = {
  title: '',
  description: '',
  link: '',
  link_text: 'Ver más',
  active: true,
  type: 'entrepreneur',
  addBannerMessage: '',
  addBubbleMessage: '',
  uber_eats: '',
  google_maps: '',
  whatsapp: '',
  logo: '',
  images: [],
  phrases: [],
};

const TYPE_OPTIONS = [
  { value: 'entrepreneur', label: 'Emprendedor' },
  { value: 'restaurant', label: 'Restaurante' },
  { value: 'default', label: 'General' },
];

const LogoImg = ({ src, alt, imgClass, placeholderClass }) => {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className={placeholderClass}>
        <Store size={20} />
      </div>
    );
  }
  return (
    <img src={src} alt={alt} className={imgClass} onError={() => setError(true)} />
  );
};

const ChipInput = ({ phrases, onChange }) => {
  const [input, setInput] = useState('');

  const addChip = () => {
    const trimmed = input.trim();
    if (trimmed && !phrases.includes(trimmed)) {
      onChange([...phrases, trimmed]);
      setInput('');
    }
  };

  const removeChip = (phrase) => {
    onChange(phrases.filter((p) => p !== phrase));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addChip();
    }
  };

  return (
    <div className={styles.chipInputContainer}>
      <div className={styles.chips}>
        {phrases.map((phrase) => (
          <span key={phrase} className={styles.chip}>
            {phrase}
            <button type="button" onClick={() => removeChip(phrase)} className={styles.chipRemove}>
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <div className={styles.chipInputRow}>
        <input
          type="text"
          className={styles.chipTextInput}
          placeholder="Nueva frase..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button type="button" onClick={addChip} className={styles.chipAddBtn}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
};

const AdminAliads = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [result, setResult] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [logoInputKey, setLogoInputKey] = useState(0);

  const fetchAds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllAds();
      setAds(data);
    } catch (err) {
      setError(err.message || 'Error cargando aliados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await uploadAdLogo(formData.title || 'temp', file);
      handleFormChange('logo', url);
    } catch (err) {
      console.error('Error uploading logo:', err);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleImagesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingImages(true);
    try {
      const currentImages = formData.images || [];
      const startIndex = currentImages.length;
      const newUrls = await Promise.all(
        files.map((file, i) => uploadAdImage(formData.title || 'temp', file, startIndex + i))
      );
      handleFormChange('images', [...currentImages, ...newUrls]);
    } catch (err) {
      console.error('Error uploading images:', err);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleEditAd = (ad) => {
    setEditingId(ad.id);
    setFormData({
      title: ad.title || '',
      description: ad.description || '',
      link: ad.link || '',
      link_text: ad.link_text || 'Ver más',
      active: ad.active ?? true,
      type: ad.type || 'entrepreneur',
      addBannerMessage: ad.addBannerMessage || '',
      addBubbleMessage: ad.addBubbleMessage || '',
      uber_eats: ad.uber_eats || '',
      google_maps: ad.google_maps || '',
      whatsapp: ad.whatsapp || '',
      logo: ad.logo || '',
      images: ad.images || [],
      phrases: ad.phrases || [],
    });
    setResult(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setResult(null);
    setLogoInputKey((prev) => prev + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setResult(null);

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      link: formData.link.trim() || null,
      link_text: formData.link_text.trim() || null,
      active: formData.active,
      type: formData.type,
      addBannerMessage: formData.addBannerMessage.trim() || null,
      addBubbleMessage: formData.addBubbleMessage.trim() || null,
      uber_eats: formData.uber_eats.trim() || null,
      google_maps: formData.google_maps.trim() || null,
      whatsapp: formData.whatsapp.trim() || null,
      logo: formData.logo || null,
      images: formData.images || [],
      phrases: formData.phrases || [],
    };

    try {
      if (editingId) {
        await updateAd(editingId, payload);
        setResult({ success: true, message: '¡Aliado actualizado correctamente!' });
      } else {
        await createAd(payload);
        setResult({ success: true, message: '¡Aliado creado correctamente!' });
      }
      setEditingId(null);
      setFormData(EMPTY_FORM);
      setLogoInputKey((prev) => prev + 1);
      await fetchAds();
    } catch (err) {
      setResult({ error: err.message || 'Error al guardar el aliado.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAd(deleteTarget.id);
      setAds(ads.filter((a) => a.id !== deleteTarget.id));
      if (editingId === deleteTarget.id) handleCancelEdit();
    } catch (err) {
      setResult({ error: err.message || 'Error al eliminar el aliado.' });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <div className={styles.aliadsModule}>
        <div className={styles.aliadsListPanel}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <Store size={18} style={{ color: '#60a5fa' }} />
              Aliados Registrados
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={styles.aliadsCount}>{ads.length} total</span>
              <button
                onClick={fetchAds}
                disabled={loading}
                className={styles.editBtn}
                title="Recargar aliados"
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

          <div className={styles.aliadsListScroll}>
            {loading ? (
              <div className={styles.emptyState}>
                <div className={styles.spinnerLg} />
                <p>Cargando aliados...</p>
              </div>
            ) : error ? (
              <div className={styles.emptyState}>
                <AlertTriangle size={32} style={{ color: '#f87171' }} />
                <p>{error}</p>
              </div>
            ) : ads.length === 0 ? (
              <div className={styles.emptyState}>
                <Store size={36} style={{ color: '#334155' }} />
                <p>No hay aliados registrados.</p>
              </div>
            ) : (
              ads.map((ad) => (
                <div
                  key={ad.id}
                  className={`${styles.aliadRow} ${editingId === ad.id ? styles.aliadRowEditing : ''}`}
                >
                  <div className={styles.aliadRowTop}>
                    <div className={styles.aliadRowLeft}>
                      <LogoImg
                        src={ad.logo}
                        alt={ad.title}
                        imgClass={styles.logoThumb}
                        placeholderClass={styles.logoThumbPlaceholder}
                      />
                      <div className={styles.aliadRowMeta}>
                        <span className={styles.aliadRowTitle} title={ad.title}>
                          {ad.title}
                        </span>
                        <span className={styles.aliadRowType}>{ad.type}</span>
                      </div>
                    </div>
                    <div className={styles.aliadRowActions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => handleEditAd(ad)}
                        title="Editar aliado"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => setDeleteTarget(ad)}
                        title="Eliminar aliado"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div className={styles.aliadRowBadges}>
                    {ad.active ? (
                      <span className={styles.activeBadge}>Activo</span>
                    ) : (
                      <span className={styles.inactiveBadge}>Inactivo</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.aliadsFormCard}>
          <div className={styles.aliadsFormHeader}>
            <h2 className={styles.aliadsFormTitle}>
              {editingId ? (
                <>
                  <Pencil size={17} style={{ color: '#60a5fa' }} />
                  Editar Aliado
                </>
              ) : (
                <>
                  <Plus size={17} style={{ color: '#60a5fa' }} />
                  Nuevo Aliado
                </>
              )}
            </h2>
            {editingId && (
              <button className={styles.cancelEditBtn} onClick={handleCancelEdit}>
                Cancelar
              </button>
            )}
          </div>

          <form className={styles.aliadsForm} onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="ad-title">Nombre *</label>
                <input
                  id="ad-title"
                  type="text"
                  className={styles.inputField}
                  placeholder="Ej: Pupusería Shambitas"
                  value={formData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="ad-type">Tipo</label>
                <select
                  id="ad-type"
                  className={styles.inputField}
                  value={formData.type}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="ad-description">
                Descripción <span className={styles.optional}>(opcional)</span>
              </label>
              <textarea
                id="ad-description"
                className={styles.inputField}
                placeholder="Descripción del negocio..."
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                rows={2}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="ad-logo">Logo</label>
              <div className={styles.logoFieldRow}>
                <div className={styles.logoFieldInput}>
                  <input
                    key={logoInputKey}
                    id="ad-logo"
                    type="file"
                    accept="image/*"
                    className={styles.inputField}
                    onChange={handleLogoChange}
                    disabled={uploadingLogo}
                  />
                  {uploadingLogo && <span className={styles.uploadHint}>Subiendo...</span>}
                </div>
                <LogoImg
                  src={formData.logo}
                  alt="Logo preview"
                  imgClass={styles.logoPreview}
                  placeholderClass={styles.logoPreviewPlaceholder}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="ad-images">
                Imágenes <span className={styles.optional}>(opcional)</span>
              </label>
              <input
                id="ad-images"
                type="file"
                accept="image/*"
                multiple
                className={styles.inputField}
                onChange={handleImagesChange}
                disabled={uploadingImages}
              />
              {uploadingImages && <span className={styles.uploadHint}>Subiendo...</span>}
              {formData.images && formData.images.length > 0 && (
                <div className={styles.imagesGallery}>
                  {formData.images.map((img, idx) => (
                    <div key={idx} className={styles.imageThumbWrapper}>
                      <img src={img} alt={`Producto ${idx + 1}`} className={styles.imageThumb} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.checkboxRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => handleFormChange('active', e.target.checked)}
                />
                Activo
              </label>
            </div>

            <div className={styles.sectionTitle}>Mensajes</div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="ad-bubble">
                Mensaje Bubble <span className={styles.optional}>(opcional)</span>
              </label>
              <textarea
                id="ad-bubble"
                className={styles.inputField}
                placeholder="Mensaje que aparece en la burbuja flotante..."
                value={formData.addBubbleMessage}
                onChange={(e) => handleFormChange('addBubbleMessage', e.target.value)}
                rows={2}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="ad-banner">
                Mensaje Banner <span className={styles.optional}>(opcional)</span>
              </label>
              <textarea
                id="ad-banner"
                className={styles.inputField}
                placeholder="Mensaje que aparece en el banner..."
                value={formData.addBannerMessage}
                onChange={(e) => handleFormChange('addBannerMessage', e.target.value)}
                rows={2}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Frases <span className={styles.optional}>(opcional)</span>
              </label>
              <ChipInput
                phrases={formData.phrases}
                onChange={(phrases) => handleFormChange('phrases', phrases)}
              />
            </div>

            <div className={styles.sectionTitle}>Contacto</div>

            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="ad-link">Link principal</label>
                <input
                  id="ad-link"
                  type="url"
                  className={styles.inputField}
                  placeholder="https://..."
                  value={formData.link}
                  onChange={(e) => handleFormChange('link', e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="ad-link-text">Texto del link</label>
                <input
                  id="ad-link-text"
                  type="text"
                  className={styles.inputField}
                  placeholder="Ver más"
                  value={formData.link_text}
                  onChange={(e) => handleFormChange('link_text', e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="ad-whatsapp">WhatsApp</label>
                <input
                  id="ad-whatsapp"
                  type="text"
                  className={styles.inputField}
                  placeholder="50663103166"
                  value={formData.whatsapp}
                  onChange={(e) => handleFormChange('whatsapp', e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="ad-uber">Uber Eats</label>
                <input
                  id="ad-uber"
                  type="url"
                  className={styles.inputField}
                  placeholder="https://..."
                  value={formData.uber_eats}
                  onChange={(e) => handleFormChange('uber_eats', e.target.value)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="ad-maps">Google Maps</label>
              <input
                id="ad-maps"
                type="url"
                className={styles.inputField}
                placeholder="https://..."
                value={formData.google_maps}
                onChange={(e) => handleFormChange('google_maps', e.target.value)}
              />
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
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
                  <Plus size={16} /> Crear Aliado
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirmModal
            title="Eliminar Aliado"
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

export default AdminAliads;
