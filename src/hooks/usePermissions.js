import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function usePermissions() {
  const [permissions, setPermissions] = useState([]);
  const [roleName, setRoleName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setPermissions([]);
          setRoleName(null);
          setLoading(false);
          return;
        }

        const { data, error: err } = await supabase
          .from('user_roles')
          .select('role_id(name, role_permissions(permission))')
          .eq('user_id', user.id);

        if (err) throw err;

        const perms = data?.flatMap(r =>
          r.role_id?.role_permissions?.map(p => p.permission) || []
        ) || [];

        const role = data?.[0]?.role_id?.name || null;

        setPermissions([...new Set(perms)]);
        setRoleName(role);
      } catch (err) {
        console.error('Error fetching permissions:', err);
        setError(err);
        setPermissions([]);
        setRoleName(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const hasPermission = (permission) => permissions.includes(permission);

  return { permissions, roleName, loading, error, hasPermission };
}
