import { supabase } from '../lib/supabaseClient';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

const callManageUsers = async (body) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('Sesión expirada. Inicia sesión de nuevo.');

    const response = await fetch(`${supabaseUrl}/functions/v1/manage-users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) throw new Error(data.error || 'Error gestionando usuarios');
    return data;
};

export const getUsers = () => callManageUsers({ action: 'list' });

export const createUser = (email, password, roleId) => callManageUsers({
    action: 'create',
    email,
    password,
    roleId,
});

export const updateUserRoles = (userId, roleIds) => callManageUsers({
    action: 'update-roles',
    userId,
    roleIds,
});

export const toggleUserBan = (userId, banned) => callManageUsers({
    action: 'toggle-ban',
    userId,
    banned,
});
