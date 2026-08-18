import { supabase } from '../lib/supabaseClient';

const BUCKET = 'MovieCovers';

export const uploadPoster = async (file) => {
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type });
    if (error) throw error;
    return supabase.storage.from(BUCKET).getPublicUrl(data.path).data.publicUrl;
};

/**
 * Fetches all upcoming movies from the university cinema table.
 * @returns {Promise<Array>} A list of movies ordered by screening date.
 */
export const getUpcomingMovies = async () => {
    const { data, error } = await supabase
        .from('university_cinema')
        .select('*')
        .order('screening_date', { ascending: true })
        .order('screening_time', { ascending: true });

    if (error) throw error;

    return data || [];
};

export const createMovie = async (movieData) => {
    const { data, error } = await supabase
        .from('university_cinema')
        .insert([movieData])
        .select()
        .single();

    if (error) throw error;

    return data;
};

export const updateMovie = async (id, updates) => {
    const { data, error } = await supabase
        .from('university_cinema')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;

    return data;
};

export const deleteMovie = async (id) => {
    const { error } = await supabase
        .from('university_cinema')
        .delete()
        .eq('id', id);

    if (error) throw error;
};
