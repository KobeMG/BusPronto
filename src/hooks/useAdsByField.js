import { useMemo } from 'react';
import { useAdsQuery } from './useAdsQuery';

/**
 * Hook que retorna solo los anuncios que tienen un campo específico con valor.
 * @param {string} field - El nombre del campo a verificar (ej: 'addBannerMessage').
 * @returns {Object} query object con los anuncios filtrados en `data`.
 */
export const useAdsByField = (field) => {
  const { data: adsRaw = [], ...rest } = useAdsQuery();

  const data = useMemo(() => {
    return adsRaw.filter(ad => ad[field] && ad[field].trim() !== '');
  }, [adsRaw, field]);

  return { data, ...rest };
};
