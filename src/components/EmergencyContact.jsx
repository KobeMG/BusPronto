import React, { useState } from 'react';
import { Phone, ShieldAlert, X, HeartPulse, Shield } from 'lucide-react';
import styles from './EmergencyContact.module.css';

const EmergencyContact = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Determinar visibilidad una sola vez al cargar
  const hours = new Date().getHours();
  const isNight = hours >= 19 || hours < 6; //Mayor a las 7 PM o menor a las 6 AM

  if (!isNight) return null;

  const emergencyNumbers = [
    {
      name: 'Seguridad UCR',
      number: '25114911',
      icon: <Shield size={20} />,
      description: 'Atención General'
    },
    {
      name: 'Emergencias Médicas',
      number: '25115807',
      icon: <HeartPulse size={20} />,
      description: 'Oficina de Bienestar y Salud'
    },
    {
      name: 'Emergencias 9-1-1',
      number: '911',
      icon: <ShieldAlert size={20} />,
      description: 'Emergencias nacionales'
    }
  ];

  const handleCall = (number) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className={`${styles.container} ${isOpen ? styles.open : ''}`}>
      {isOpen ? (
        <div className={styles.modal}>
          <div className={styles.header}>
            <div className={styles.titleGroup}>
              <ShieldAlert className={styles.headerIcon} size={24} />
              <div>
                <h3>Contactos de emergencia</h3>
                <p>Ni una persona menos 🫂</p>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className={styles.list}>
            {emergencyNumbers.map((item) => (
              <button
                key={item.number}
                className={styles.item}
                onClick={() => handleCall(item.number)}
              >
                <div className={styles.itemIcon}>{item.icon}</div>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemDesc}>{item.description}</span>
                </div>
                <div className={styles.callIcon}>
                  <Phone size={18} />
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button className={styles.fab} onClick={() => setIsOpen(true)}>
          <ShieldAlert size={24} />
        </button>
      )}
    </div>
  );
};

export default EmergencyContact;
