import { supabase } from '../lib/supabaseClient';

export const fetchAdsData = async () => {
  try {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('active', true)
      .order('priority', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching ads:', err);
    return [];
  }
};

export const getAppBounds = (screenWidth) => {
  const appWidth = Math.min(screenWidth, 500);
  const appLeft = Math.max(0, (screenWidth - 500) / 2);
  const appRight = appLeft + appWidth;
  return { appLeft, appRight, appWidth };
};

export const calculateSnapX = (currentX, screenWidth) => {
  const { appLeft, appRight } = getAppBounds(screenWidth);
  const appCenter = appLeft + (appRight - appLeft) / 2;
  return currentX > appCenter ? appRight - 70 : appLeft + 10;
};

export const trackAdClick = async (id) => {
  try {
    await supabase.rpc('increment_ad_clicks', { ad_id: id });
  } catch (err) {
    console.error('Error tracking click:', err);
  }
};

export const trackAdImpression = async (id) => {
  try {
    await supabase.rpc('increment_ad_impressions', { ad_id: id });
  } catch (err) {
    console.error('Error tracking impression:', err);
  }
};
