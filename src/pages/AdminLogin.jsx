import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import styles from './Admin.module.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/admin', { replace: true });
    }
  };

  return (
    <div className={styles.adminPage}>
      <div className={styles.loginFormPanel}>
        <Motion.div
          className={styles.loginCard}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className={styles.loginHeader}>
            <h2 className={styles.loginTitle}>¡Hola de nuevo!</h2>
            <p className={styles.loginSubtitle}>¿Cómo conquistaremos el mundo hoy?</p>
          </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="email" className={styles.label}>Correo electrónico</label>
                <div className={styles.inputWrapper}>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.inputField}
                    placeholder="admin@ejemplo.com"
                    required
                    autoComplete="email"
                  />
                  <div className={styles.inputIcon}>
                    <Mail size={18} />
                  </div>
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="password" className={styles.label}>Contraseña</label>
                <div className={styles.inputWrapper}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.inputField}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <div className={styles.inputIcon}>
                    <Lock size={18} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.passwordToggle}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <Motion.div
                  className={styles.errorBox}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span>⚠️</span>
                  <span>{error}</span>
                </Motion.div>
              )}

              <Motion.button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {loading ? (
                  <>
                    <Motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        borderTopColor: '#ffffff',
                      }}
                    />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Iniciar sesión</span>
                  </>
                )}
              </Motion.button>
            </form>
        </Motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;
