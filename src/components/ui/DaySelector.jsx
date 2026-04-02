import React from 'react';
import styles from './DaySelector.module.css';

const DaySelector = ({ selectedDay, onDayChange }) => {
  const options = [
    { id: 'Lunes', label: 'L-V' },
    { id: 'Sábado', label: 'Sáb' },
    { id: 'Domingo', label: 'Dom' }
  ];

  return (
    <div className={styles.container}>
      {options.map((opt) => (
        <button
          key={opt.id}
          className={`${styles.dayBtn} ${selectedDay === opt.id ? styles.active : ''}`}
          onClick={() => onDayChange(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default DaySelector;
