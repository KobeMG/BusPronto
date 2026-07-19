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
    try {
        const { data, error } = await supabase
            .from('university_cinema')
            .select('*')
            .order('screening_date', { ascending: true })
            .order('screening_time', { ascending: true });

        if (error) throw error;

        return data || [];
    } catch (err) {
        console.error('Error in getUpcomingMovies:', err);
        throw err;
    }
};

export const getAllMoviesAdmin = async () => {
    try {
        const { data, error } = await supabase
            .from('university_cinema')
            .select('*')
            .order('screening_date', { ascending: true })
            .order('screening_time', { ascending: true });

        if (error) throw error;

        return data || [];
    } catch (err) {
        console.error('Error in getAllMoviesAdmin:', err);
        throw err;
    }
};

export const createMovie = async (movieData) => {
    try {
        const { data, error } = await supabase
            .from('university_cinema')
            .insert([movieData])
            .select()
            .single();

        if (error) throw error;

        return data;
    } catch (err) {
        console.error('Error in createMovie:', err);
        throw err;
    }
};

export const updateMovie = async (id, updates) => {
    try {
        const { data, error } = await supabase
            .from('university_cinema')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return data;
    } catch (err) {
        console.error('Error in updateMovie:', err);
        throw err;
    }
};

export const deleteMovie = async (id) => {
    try {
        const { error } = await supabase
            .from('university_cinema')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (err) {
        console.error('Error in deleteMovie:', err);
        throw err;
    }
};
