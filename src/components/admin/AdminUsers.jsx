import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Ban, CheckCircle2, Plus, RefreshCw, Save, ShieldAlert, ShieldCheck, Users } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import {
  createUser as createManagedUser,
  getUsers,
  toggleUserBan,
  updateUserRoles,
} from '../../services/users.service';
import styles from './AdminCinema.module.css';

// ponytail: reuse the existing admin form primitives instead of adding another stylesheet.
const EMPTY_FORM = { email: '', password: '', roleId: '' };

const formatDate = (value) => {
  if (!value) return 'Nunca';
  return new Date(value).toLocaleDateString('es-CR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const AdminUsers = () => {
  const { permissions, loading: permissionsLoading } = usePermissions();
  const canManageUsers = permissions.includes('module.users');
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [roleDrafts, setRoleDrafts] = useState({});
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyAction, setBusyAction] = useState(null);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      const nextUsers = data.users || [];
      setUsers(nextUsers);
      setRoles(data.roles || []);
      setRoleDrafts(Object.fromEntries(
        nextUsers.map((user) => [user.id, user.roles.map((role) => role.id)]),
      ));
    } catch (err) {
      setError(err.message || 'Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!permissionsLoading && canManageUsers) loadUsers();
  }, [canManageUsers, loadUsers, permissionsLoading]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setResult(null);
    try {
      await createManagedUser(formData.email.trim(), formData.password, formData.roleId);
      setFormData(EMPTY_FORM);
      setResult({ success: true, message: 'Usuario creado correctamente.' });
      await loadUsers();
    } catch (err) {
      setResult({ error: err.message || 'Error creando usuario.' });
    } finally {
      setSaving(false);
    }
  };

  const handleRoleToggle = (userId, roleId) => {
    setRoleDrafts((current) => {
      const selected = current[userId] || [];
      const next = selected.includes(roleId)
        ? selected.filter((id) => id !== roleId)
        : [...selected, roleId];
      return { ...current, [userId]: next };
    });
  };

  const handleSaveRoles = async (user) => {
    setBusyAction(`roles:${user.id}`);
    setResult(null);
    try {
      await updateUserRoles(user.id, roleDrafts[user.id] || []);
      setResult({ success: true, message: `Roles actualizados para ${user.email}.` });
      await loadUsers();
    } catch (err) {
      setResult({ error: err.message || 'Error actualizando roles.' });
    } finally {
      setBusyAction(null);
    }
  };

  const handleToggleBan = async (user) => {
    const action = user.banned ? 'reactivar' : 'bloquear';
    if (!window.confirm(`¿Deseas ${action} a ${user.email}?`)) return;

    setBusyAction(`ban:${user.id}`);
    setResult(null);
    try {
      await toggleUserBan(user.id, !user.banned);
      setResult({
        success: true,
        message: user.banned ? 'Usuario reactivado.' : 'Usuario bloqueado.',
      });
      await loadUsers();
    } catch (err) {
      setResult({ error: err.message || 'Error cambiando el estado del usuario.' });
    } finally {
      setBusyAction(null);
    }
  };

  if (permissionsLoading) {
    return <div className={styles.emptyCinemaState}>Verificando permisos...</div>;
  }

  if (!canManageUsers) {
    return (
      <div className={styles.emptyCinemaState}>
        <ShieldAlert size={36} style={{ color: '#f87171' }} />
        <p>No tienes permiso para administrar usuarios.</p>
      </div>
    );
  }

  return (
    <div className={styles.cinemaModule}>
      <div className={styles.cinemaListPanel}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <Users size={18} style={{ color: '#60a5fa' }} />
            Usuarios registrados
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className={styles.cinemaCount}>{users.length} total</span>
            <button
              type="button"
              onClick={loadUsers}
              disabled={loading}
              className={styles.editBtn}
              title="Recargar usuarios"
            >
              <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
            </button>
          </div>
        </div>

        {result && (
          <div className={result.success ? styles.resultSuccess : styles.resultError} style={{ marginBottom: '1rem' }}>
            <div className={styles.resultTitle}>
              {result.success ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
              <span>{result.success ? result.message : `Error: ${result.error}`}</span>
            </div>
          </div>
        )}

        <div className={styles.cinemaListScroll}>
          {loading ? (
            <div className={styles.emptyCinemaState}>
              <div className={styles.spinnerLg} />
              <p>Cargando usuarios...</p>
            </div>
          ) : error ? (
            <div className={styles.emptyCinemaState}>
              <AlertTriangle size={32} style={{ color: '#f87171' }} />
              <p>{error}</p>
            </div>
          ) : users.length === 0 ? (
            <div className={styles.emptyCinemaState}>
              <Users size={36} style={{ color: '#334155' }} />
              <p>No hay usuarios registrados.</p>
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className={styles.cinemaRow}>
                <div className={styles.cinemaRowTop}>
                  <div className={styles.cinemaRowLeft}>
                    <div className={styles.cinemaRowMeta}>
                      <span className={styles.cinemaRowTitle} title={user.email}>{user.email}</span>
                      <div className={styles.cinemaRowDates}>
                        Creado {formatDate(user.created_at)} · Último acceso {formatDate(user.last_sign_in_at)}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={user.banned ? styles.editBtn : styles.deleteBtn}
                    onClick={() => handleToggleBan(user)}
                    disabled={busyAction === `ban:${user.id}`}
                    title={user.banned ? 'Reactivar usuario' : 'Bloquear usuario'}
                  >
                    {user.banned ? <ShieldCheck size={14} /> : <Ban size={14} />}
                  </button>
                </div>

                <div className={styles.cinemaRowBadges}>
                  <span className={user.banned ? styles.deleteBtn : styles.virtualBadge} style={{ cursor: 'default' }}>
                    {user.banned ? 'Baneado' : 'Activo'}
                  </span>
                  {user.roles.map((role) => (
                    <span key={role.id} className={styles.locationBadge}>{role.name}</span>
                  ))}
                </div>

                <div className={styles.checkboxRow} style={{ flexWrap: 'wrap', gap: '0.65rem', marginTop: '0.35rem' }}>
                  {roles.map((role) => (
                    <label key={role.id} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={(roleDrafts[user.id] || []).includes(role.id)}
                        onChange={() => handleRoleToggle(user.id, role.id)}
                      />
                      {role.name}
                    </label>
                  ))}
                  <button
                    type="button"
                    className={styles.editBtn}
                    onClick={() => handleSaveRoles(user)}
                    disabled={busyAction === `roles:${user.id}`}
                    title="Guardar roles"
                  >
                    <Save size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={styles.cinemaFormCard}>
        <div className={styles.cinemaFormHeader}>
          <h2 className={styles.cinemaFormTitle}>
            <Plus size={17} style={{ color: '#60a5fa' }} />
            Crear usuario
          </h2>
        </div>

        <form className={styles.cinemaForm} onSubmit={handleCreate}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="user-email">Correo electrónico *</label>
            <input
              id="user-email"
              type="email"
              className={styles.inputFieldNoIcon}
              value={formData.email}
              onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
              required
              autoComplete="off"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="user-password">Contraseña temporal *</label>
            <input
              id="user-password"
              type="password"
              className={styles.inputFieldNoIcon}
              value={formData.password}
              onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
              minLength={6}
              required
              autoComplete="new-password"
            />
            <span className={styles.fieldHint}>Entrégasela al usuario por un canal seguro.</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="user-role">Rol inicial *</label>
            <select
              id="user-role"
              className={styles.inputFieldNoIcon}
              value={formData.roleId}
              onChange={(event) => setFormData((current) => ({ ...current, roleId: event.target.value }))}
              required
            >
              <option value="">Selecciona un rol</option>
              {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
            </select>
          </div>

          <button type="submit" className={styles.cinemaSubmitBtn} disabled={saving || !roles.length}>
            {saving ? (
              <><div className={styles.spinnerSm} /> Creando...</>
            ) : (
              <><ShieldCheck size={16} /> Crear usuario</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminUsers;
