import React, { useState, useEffect, useRef } from 'react';
import './BusLogo.css';

const MESSAGES = [
  "¡Tengo una amiga llamada Pepper!",
  "Soy lo mas cercano a una mascota que tenemos en la U",
  "CORRE!",
  "No te vayas sin tomar agüita, hace calor",
  "Apúrate, que arranco!",
  "¿Si prometen las pelis de hoy?",
  "Con estas lluvias me iré en lancha",
  "Hoy estás más guapo/a que ayer",
  "Siempre tengo hambre",
  "Hola, soy Laiky"
];

const BusLogo = ({ className = '', color = '#7e6ee6' }) => {
  const [isGreeting, setIsGreeting] = useState(true);
  const [message, setMessage] = useState('');
  const [isMessageVisible, setIsMessageVisible] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // Tras 2.5 segundos terminamos el saludo inicial (guiño) 
    // y damos paso al parpadeo infinito.
    const timer = setTimeout(() => {
      setIsGreeting(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogoClick = () => {
    // Escoger un mensaje aleatorio
    const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    setMessage(randomMsg);
    setIsMessageVisible(true);

    // Limpiar el timeout anterior si el usuario hace clic varias veces rápido
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Ocultar la burbuja después de 3.5 segundos
    timerRef.current = setTimeout(() => {
      setIsMessageVisible(false);
    }, 3500);
  };

  return (
    <div className={`bus-logo-container ${className}`}>
      {/* Cajita de conversación (Speech Bubble) */}
      <div className={`speech-bubble ${isMessageVisible ? 'visible' : ''}`}>
        {message}
      </div>

      <svg
        viewBox="-5 -15 130 130"
        xmlns="http://www.w3.org/2000/svg"
        onClick={handleLogoClick}
        className="bus-logo-svg"
      >
        <defs>
          <mask id="bus-mask">
            {/* Base: blanco significa opaco (visible) */}
            <rect x="-10" y="-20" width="150" height="150" fill="white" />

            {/* Negro significa transparente (agujeros) */}
            {/* Huecos para las ruedas */}
            <circle cx="35" cy="95" r="14" fill="black" />
            <circle cx="85" cy="95" r="14" fill="black" />

            {/* Ventanas */}
            <rect x="22" y="65" width="14" height="14" rx="2" fill="black" />
            <rect x="40" y="65" width="14" height="14" rx="2" fill="black" />
            <rect x="58" y="65" width="14" height="14" rx="2" fill="black" />
            {/* Ventana frontal - inclinada hacia la derecha */}
            <path d="M 76 65 L 86 65 A 2 2 0 0 1 88 66 L 94 77 A 2 2 0 0 1 92 79 L 76 79 A 2 2 0 0 1 74 77 L 74 67 A 2 2 0 0 1 76 65 Z" fill="black" />
          </mask>
        </defs>

        <g fill={color} stroke={color}>
          {/* Techo / Domo */}
          <path d="M 26 58 A 34 34 0 0 1 94 58" strokeWidth="8" fill="none" />

          {/* Hojitas arriba (Forma de pétalos redondeados, separadas del techo) */}
          <g transform="translate(60, 16) scale(1.6) translate(-60, -24)">
            {/* Hoja central */}
            <path d="M 57.5 24 C 53 4, 67 4, 62.5 24 Z" stroke="none" />
            {/* Hoja izquierda */}
            <path d="M 57.5 24 C 53 4, 67 4, 62.5 24 Z" transform="translate(-6, 0) translate(60, 24) rotate(-65) scale(0.85) translate(-60, -24)" stroke="none" />
            {/* Hoja derecha */}
            <path d="M 57.5 24 C 53 4, 67 4, 62.5 24 Z" transform="translate(6, 0) translate(60, 24) rotate(65) scale(0.85) translate(-60, -24)" stroke="none" />
          </g>

          {/* Chasis del autobús (con máscara para las ventanas) */}
          <rect x="15" y="58" width="90" height="35" rx="6" mask="url(#bus-mask)" stroke="none" />

          {/* Ojo Izquierdo */}
          <circle
            cx="35"
            cy="95"
            r="10"
            className={!isGreeting ? "blinking-eye" : ""}
            style={{ transformOrigin: '35px 95px' }}
            stroke="none"
          />

          {/* Ojo Derecho */}
          <circle
            cx="85"
            cy="95"
            r="10"
            className={isGreeting ? "winking-eye" : "blinking-eye"}
            style={{ transformOrigin: '85px 95px' }}
            stroke="none"
          />

          {/* Sonrisa */}
          <path d="M 52 108 A 12 10 0 0 0 68 108" strokeWidth="4" strokeLinecap="round" fill="none" />
        </g>
      </svg>
    </div>
  );
};

export default BusLogo;
