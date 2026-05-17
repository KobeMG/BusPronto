import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// Configurar Supabase con la llave de servicio para interactuar con la BD
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configurar Web Push
const publicVapidKey = Deno.env.get('VAPID_PUBLIC_KEY') ?? '';
const privateVapidKey = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';

// mailto: debe ser un correo de contacto válido
webpush.setVapidDetails(
  'mailto:buspronto@kobemg.com',
  publicVapidKey,
  privateVapidKey
);

Deno.serve(async (req) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Manejar el preflight request de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers });
  }

  try {
    // Validar el método POST
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { headers, status: 405 });
    }

    const { title, body, url } = await req.json();

    if (!title || !body) {
      throw new Error('Title and body are required.');
    }

    const payload = JSON.stringify({ title, body, url: url || '/' });

    // Obtener todas las suscripciones de la base de datos
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (error) {
      throw error;
    }

    console.log(`Sending push to ${subscriptions.length} subscribers...`);

    // Enviar notificaciones en paralelo
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(sub.subscription, payload);
          return { status: 'success', id: sub.id };
        } catch (error: any) {
          // Si el error es 410 (Gone) o 404, significa que la suscripción expiró o el usuario denegó permisos
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`Subscription ${sub.id} is invalid. Removing from DB...`);
            await supabase.from('push_subscriptions').delete().eq('id', sub.id);
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
