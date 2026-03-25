import React from 'react';
import '../styles/components/AdBanner.css';

const AdBanner = () => {
  return (
    <div className="ad-banner glass-card">
      <div className="ad-content">
        <span className="ad-tag">PRÓXIMAMENTE</span>
        <p className="ad-text">¡Implementarémos buses externos, estén atentos!</p>
      </div>
    </div>
  );
};

export default AdBanner;
