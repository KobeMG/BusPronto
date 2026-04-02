import { Loader2 } from 'lucide-react';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({ text = "Cargando información..." }) => {
  return (
    <div className={styles.spinnerContainer}>
      <Loader2 size={32} className={styles.spinner} />
      <p className={styles.loadingText}>{text}</p>
    </div>
  );
};

export default LoadingSpinner;
