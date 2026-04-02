import React from 'react';
import styles from './ViewToggle.module.css';
import { Zap, Calendar } from 'lucide-react';

const ViewToggle = ({ activeView, onViewChange }) => {
  return (
    <div className={styles.toggleContainer}>
      <div 
        className={`${styles.glider} ${activeView === 'schedule' ? styles.right : styles.left}`}
      />
      <button 
        className={`${styles.toggleButton} ${activeView === 'timer' ? styles.active : ''}`}
        onClick={() => onViewChange('timer')}
      >
        <Zap size={16} />
        <span>En vivo</span>
      </button>
      <button 
        className={`${styles.toggleButton} ${activeView === 'schedule' ? styles.active : ''}`}
        onClick={() => onViewChange('schedule')}
      >
        <Calendar size={16} />
        <span>Horarios</span>
      </button>
    </div>
  );
};

export default ViewToggle;
