import { supabase } from '../lib/supabaseClient';

const BUCKET = 'Aliados';

const sanitizeFolderName = (name) =>
  name.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

export const getAllAds = async () => {
  try {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error in getAllAds:', err);
    throw err;
  }
};

export const createAd = async (adData) => {
  try {
    const { data, error } = await supabase
      .from('ads')
      .insert([adData])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error in createAd:', err);
    throw err;
  }
};

export const updateAd = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('ads')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error in updateAd:', err);
    throw err;
  }
};

export const deleteAd = async (id) => {
  try {
    const { error } = await supabase.from('ads').delete().eq('id', id);
    if (error) throw error;
  } catch (err) {
    console.error('Error in deleteAd:', err);
    throw err;
  }
};

export const uploadAdLogo = async (title, file) => {
  const folder = sanitizeFolderName(title);
  const ext = file.name.split('.').pop();
  const path = `${folder}/Logo.${ext}`;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(data.path).data.publicUrl;
};

export const uploadAdImage = async (title, file, index) => {
  const folder = sanitizeFolderName(title);
  const ext = file.name.split('.').pop();
  const path = `${folder}/Producto${index + 1}.${ext}`;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(data.path).data.publicUrl;
};

export const deleteAdImage = async (url) => {
  const path = url.split('/storage/v1/object/public/Aliados/')[1];
  if (!path) return;
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.error('Error deleting ad image:', error);
};
