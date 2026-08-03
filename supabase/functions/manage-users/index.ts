import { createClient } from '@supabase/supabase-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const response = (body: Record<string, unknown>, status = 200) => new Response(
  JSON.stringify(body),
  {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  },
);

const getAuthenticatedAdmin = async (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw Object.assign(new Error('Token de autenticación requerido'), { status: 401 });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    throw Object.assign(new Error('Token de autenticación requerido'), { status: 401 });
  }

  const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user }, error: authError } = await supabaseUser.auth.getUser();

  if (authError || !user) {
    throw Object.assign(new Error('Token inválido o expirado'), { status: 401 });
  }

  const { data: userRoles, error: roleError } = await supabaseAdmin
    .from('user_roles')
    .select('role:roles(name)')
    .eq('user_id', user.id);

  if (roleError) throw roleError;
  if (!userRoles?.some((row: any) => row.role?.name === 'admin')) {
    throw Object.assign(new Error('Acceso denegado: se requiere rol de administrador'), { status: 403 });
  }

  return user;
};

const getValidRoles = async (roleIds: string[]) => {
  const uniqueRoleIds = [...new Set(roleIds)];
  if (uniqueRoleIds.some((id) => typeof id !== 'string' || !id)) {
    throw Object.assign(new Error('Los roles enviados no son válidos'), { status: 400 });
  }

  if (!uniqueRoleIds.length) return [];

  const { data, error } = await supabaseAdmin
    .from('roles')
    .select('id, name')
    .in('id', uniqueRoleIds);

  if (error) throw error;
  if (!data || data.length !== uniqueRoleIds.length) {
    throw Object.assign(new Error('Uno o más roles no existen'), { status: 400 });
  }

  return data;
};

const listUsers = async () => {
  const authUsers = [];
  const perPage = 1000;
  let page = 1;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    authUsers.push(...data.users);
    if (data.users.length < perPage) break;
    page += 1;
  }

  const [{ data: assignments, error: assignmentsError }, { data: roles, error: rolesError }] = await Promise.all([
    supabaseAdmin.from('user_roles').select('user_id, role:roles(id, name)'),
    supabaseAdmin.from('roles').select('id, name').order('name'),
  ]);

  if (assignmentsError) throw assignmentsError;
  if (rolesError) throw rolesError;

  const rolesByUser = new Map<string, Array<{ id: string; name: string }>>();
  for (const assignment of assignments ?? []) {
    const role = assignment.role;
    if (!role) continue;
    const userRoles = rolesByUser.get(assignment.user_id) ?? [];
    userRoles.push(role);
    rolesByUser.set(assignment.user_id, userRoles);
  }

  return {
    users: authUsers.map((user) => ({
      id: user.id,
      email: user.email ?? '',
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      banned_until: user.banned_until,
      banned: Boolean(
        user.banned_until &&
        user.banned_until !== 'none' &&
        new Date(user.banned_until).getTime() > Date.now(),
      ),
      roles: rolesByUser.get(user.id) ?? [],
    })),
    roles: roles ?? [],
  };
};

const createUser = async (payload: any) => {
  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  const password = typeof payload.password === 'string' ? payload.password : '';
  const roleId = typeof payload.roleId === 'string' ? payload.roleId : '';

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw Object.assign(new Error('Ingresa un correo electrónico válido'), { status: 400 });
  }
  if (password.length < 6) {
    throw Object.assign(new Error('La contraseña temporal debe tener al menos 6 caracteres'), { status: 400 });
  }

  const roles = await getValidRoles([roleId]);
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) throw error;

  const { error: roleError } = await supabaseAdmin
    .from('user_roles')
    .insert({ user_id: data.user.id, role_id: roles[0].id });

  if (roleError) {
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    throw roleError;
  }

  return { user: { id: data.user.id, email: data.user.email }, role: roles[0] };
};

const updateRoles = async (actorId: string, payload: any) => {
  const userId = typeof payload.userId === 'string' ? payload.userId : '';
  const roleIds = Array.isArray(payload.roleIds) ? payload.roleIds : null;

  if (!userId || !roleIds) {
    throw Object.assign(new Error('Usuario y roles son requeridos'), { status: 400 });
  }

  const roles = await getValidRoles(roleIds);
  const { data: currentAssignments, error: currentError } = await supabaseAdmin
    .from('user_roles')
    .select('role_id, role:roles(name)')
    .eq('user_id', userId);

  if (currentError) throw currentError;

  const keepsAdminRole = roles.some((role) => role.name === 'admin');
  if (userId === actorId && !keepsAdminRole) {
    throw Object.assign(new Error('No puedes quitarte tu propio rol admin'), { status: 400 });
  }

  const previousRoleIds = (currentAssignments ?? []).map((assignment) => assignment.role_id);
  const { error: deleteError } = await supabaseAdmin
    .from('user_roles')
    .delete()
    .eq('user_id', userId);

  if (deleteError) throw deleteError;

  try {
    if (roles.length) {
      const { error: insertError } = await supabaseAdmin
        .from('user_roles')
        .insert(roles.map((role) => ({ user_id: userId, role_id: role.id })));
      if (insertError) throw insertError;
    }
  } catch (error) {
    if (previousRoleIds.length) {
      await supabaseAdmin
        .from('user_roles')
        .insert(previousRoleIds.map((roleId) => ({ user_id: userId, role_id: roleId })));
    }
    throw error;
  }

  return { userId, roles };
};

const toggleBan = async (actorId: string, payload: any) => {
  const userId = typeof payload.userId === 'string' ? payload.userId : '';
  if (!userId || typeof payload.banned !== 'boolean') {
    throw Object.assign(new Error('Usuario y estado de baneo son requeridos'), { status: 400 });
  }
  if (userId === actorId) {
    throw Object.assign(new Error('No puedes bloquearte a ti mismo'), { status: 400 });
  }

  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    ban_duration: payload.banned ? '876000h' : 'none',
  });
  if (error) throw error;

  return { userId: data.user.id, banned: payload.banned };
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return response({ error: 'Método no permitido' }, 405);

  try {
    const actor = await getAuthenticatedAdmin(req);
    const payload = await req.json();
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return response({ error: 'Cuerpo de petición no válido' }, 400);
    }

    switch (payload.action) {
      case 'list':
        return response(await listUsers());
      case 'create':
        return response(await createUser(payload), 201);
      case 'update-roles':
        return response(await updateRoles(actor.id, payload));
      case 'toggle-ban':
        return response(await toggleBan(actor.id, payload));
      default:
        return response({ error: 'Acción no válida' }, 400);
    }
  } catch (error: any) {
    console.error('Error in manage-users:', error);
    return response({ error: error.message || 'Error interno' }, error.status || 500);
  }
});
