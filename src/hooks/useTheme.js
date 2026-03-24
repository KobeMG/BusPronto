import { useEffect } from 'react';

/**
 * Hook personalizado para gestionar el tema visual según la temporada o festividad.
 */
const useTheme = () => {
  useEffect(() => {
    const detectTheme = () => {
      const now = new Date();
      //const month = now.getMonth();
      const month = 11
      // Lógica de temas
      // Por ejemplo: Marzo o Abril (meses típicos de Semana Santa)
      // Nota: En una app real podríamos usar una librería de festividades
      if (month === 2 || month === 3) {
        return 'semana-santa';
      }

      // Navidad (Diciembre - Mes 11)
      if (month === 11) {
        return 'christmas';
      }

      return null;
    };

    const theme = detectTheme();

    if (theme) {
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);
};

export default useTheme;
