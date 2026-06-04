import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

// Cliente admin con service role (para leer subscripciones y borrar)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const publicVapidKey = Deno.env.get('VAPID_PUBLIC_KEY') ?? '';
const privateVapidKey = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';

webpush.setVapidDetails(
  'mailto:buspronto@kobemg.com',
  publicVapidKey,
  privateVapidKey
);

Deno.serve(async (req) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers });
  }

  try {
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { headers, status: 405 });
    }

    // Verificar autenticación JWT usando el cliente de Supabase con el token del usuario
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Token de autenticación requerido' }), {
        headers: { ...headers, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const token = authHeader.split(' ')[1];

    // Crear cliente con el token del usuario para validarlo correctamente
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Token inválido o expirado' }), {
        headers: { ...headers, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Verificar rol de administrador en app_metadata
    const role = user?.app_metadata?.role;
    if (role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Acceso denegado: se requiere rol de administrador' }), {
        headers: { ...headers, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    const { title, body, url } = await req.json();

    if (!title || !body) {
      throw new Error('Title and body are required.');
    }

    const payloadObj = JSON.stringify({ title, body, url: url || '/' });

    const { data: subscriptions, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*');

    if (error) {
      throw error;
    }

    console.log(`Sending push to ${subscriptions.length} subscribers...`);

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(sub.subscription, payloadObj);
          return { status: 'success', id: sub.id };
        } catch (error: any) {
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`Subscription ${sub.id} is invalid. Removing from DB...`);
            await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id);
          }
          throw error;
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return new Response(
      JSON.stringify({
        message: 'Push notifications processed',
        stats: { total: subscriptions.length, successful, failed }
      }),
      { headers: { ...headers, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...headers, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
