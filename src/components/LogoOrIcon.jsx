import { useState } from 'react';

const LogoOrIcon = ({ logo, fallbackIcon, title, className }) => {
  const [hasError, setHasError] = useState(false);

  if (logo && !hasError) {
    return (
      <img
        src={logo}
        alt={title}
        className={className}
        onError={() => setHasError(true)}
      />
    );
  }

  return fallbackIcon;
};

export default LogoOrIcon;
