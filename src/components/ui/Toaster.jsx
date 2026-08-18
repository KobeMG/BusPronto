import { useEffect, useState } from 'react';
import { onToast } from '../../utils/toast';
import styles from './Toaster.module.css';

const Toaster = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => onToast((t) => {
    setToasts((prev) => [...prev, t]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== t.id));
    }, t.duration);
  }), []);

  return (
    <div className={styles.toaster}>
      {toasts.map((t) => (
        <div key={t.id} className={`${styles.toast} ${styles[t.variant]}`}>
          <strong className={styles.title}>{t.title}</strong>
          <span className={styles.description}>{t.description}</span>
        </div>
      ))}
    </div>
  );
};

export default Toaster;
