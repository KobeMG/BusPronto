import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = "Cargando información..." }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
      <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary-color)', marginBottom: '1rem' }} />
      <p style={{ color: 'var(--text-secondary)' }}>{text}</p>
    </div>
  );
};

export default LoadingSpinner;
