import React from 'react';
import { 
  Info, 
  Sparkles, 
  Bug, 
  Heart, 
  MessageCircle, 
  UtensilsCrossed, 
  Store 
} from 'lucide-react';

/**
 * Mapa centralizado de componentes de iconos para anuncios.
 */
export const AD_ICON_COMPONENTS = {
  info: Info,
  entrepreneur: Sparkles,
  bug: Bug,
  community: Heart,
  suggestion: MessageCircle,
  restaurant: UtensilsCrossed,
  store: Store
};

/**
 * Retorna el componente de icono correspondiente al tipo de anuncio con el tamaño especificado.
 * @param {string} type 
 * @param {number} size 
 * @returns {React.ReactNode}
 */
export const getAdIcon = (type, size = 24) => {
  const IconComponent = AD_ICON_COMPONENTS[type] || AD_ICON_COMPONENTS.info;
  return <IconComponent size={size} />;
};

/**
 * Temas visuales centralizados para los anuncios.
 */
export const AD_THEMES = {
  restaurant: {
    icon: <UtensilsCrossed size={24} />,
    color: 'var(--ad-restaurant-start)',
    gradient: 'linear-gradient(135deg, var(--ad-restaurant-start) 0%, var(--ad-restaurant-end) 100%)',
  },
  entrepreneur: {
    icon: <Sparkles size={24} />,
    color: 'var(--ad-entrepreneur-start)',
    gradient: 'linear-gradient(135deg, var(--ad-entrepreneur-start) 0%, var(--ad-entrepreneur-end) 100%)',
  },
  store: {
    icon: <Store size={24} />,
    color: 'var(--ad-store-start)',
    gradient: 'linear-gradient(135deg, var(--ad-store-start) 0%, var(--ad-store-end) 100%)',
  },
  community: {
    icon: <Heart size={24} />,
    color: '#f43f5e',
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)',
  },
  bug: {
    icon: <Bug size={24} />,
    color: 'var(--error)',
    gradient: 'linear-gradient(135deg, var(--error) 0%, #ff6b6b 100%)',
  },
  suggestion: {
    icon: <MessageCircle size={24} />,
    color: 'var(--accent-primary)',
    gradient: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
  },
  default: {
    icon: <Info size={24} />,
    color: 'var(--ad-default-start)',
    gradient: 'linear-gradient(135deg, var(--ad-default-start) 0%, var(--ad-default-end) 100%)',
  }
};
