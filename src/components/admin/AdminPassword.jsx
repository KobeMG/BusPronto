import { useState } from 'react';
import { AlertTriangle, CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import styles from './AdminCinema.module.css';

const AdminPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setResult(null);

    if (password.length < 6) {
      setResult({ error: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    if (password !== confirmation) {
      setResult({ error: 'Las contraseñas no coinciden.' });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setPassword('');
      setConfirmation('');
      setResult({ success: true, message: 'Contraseña actualizada correctamente.' });
    } catch (error) {
      setResult({ error: error.message || 'No se pudo actualizar la contraseña.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '560px' }}>
      <div className={styles.cinemaFormCard}>
        <div className={styles.cinemaFormHeader}>
          <h2 className={styles.cinemaFormTitle}>
            <KeyRound size={17} style={{ color: '#60a5fa' }} />
            Cambiar contraseña
          </h2>
        </div>

        {result && (
          <div
            className={result.success ? styles.resultSuccess : styles.resultError}
            style={{ marginBottom: '1.25rem' }}
            role="status"
          >
            <div className={styles.resultTitle}>
              {result.success ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
              <span>{result.success ? result.message : result.error}</span>
            </div>
          </div>
        )}

        <form className={styles.cinemaForm} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="new-password">Nueva contraseña</label>
            <input
              id="new-password"
              type="password"
              className={styles.inputFieldNoIcon}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
              autoComplete="new-password"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirm-password">Confirmar contraseña</label>
            <input
              id="confirm-password"
              type="password"
              className={styles.inputFieldNoIcon}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              minLength={6}
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className={styles.cinemaSubmitBtn} disabled={saving}>
            {saving ? (
              <><div className={styles.spinnerSm} /> Actualizando...</>
            ) : (
              <><ShieldCheck size={16} /> Actualizar contraseña</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPassword;
