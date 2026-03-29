import { createContext, useContext, useState, useEffect } from 'react';
import { sileo } from 'sileo';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  // Cargar favoritos del localStorage al inicializar
  useEffect(() => {
    const savedFavorites = localStorage.getItem('fav_stops');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const toggleFavorite = (stopId, stopName) => {
    setFavorites((prevFavorites) => {
      let newFavorites;
      if (prevFavorites.includes(stopId)) {
        newFavorites = prevFavorites.filter(id => id !== stopId);
        if (stopName) {
            sileo.info({
                title: 'Eliminado',
                description: `Se quitó ${stopName} de sus favoritos.`,
                position: 'top-center',
                duration: 2000
            });
        }
      } else {
        newFavorites = [...prevFavorites, stopId];
        if (stopName) {
            sileo.success({
                title: '¡Guardado!',
                description: `La parada ${stopName} se añadió a sus favoritos.`,
                position: 'top-center',
                duration: 2000
            });
        }
      }
      localStorage.setItem('fav_stops', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const isFavorite = (stopId) => {
    return favorites.includes(stopId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
