import { Instagram, Github, Globe, Linkedin } from 'lucide-react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <p className={styles.developedBy}>
          Desarrollado con ❤️ por <a href="https://kobemg.com/" target="_blank" rel="noopener noreferrer" className={styles.brand}>Kode Creative</a>
          <span className={styles.disclaimer}>
            Proyecto no oficial de la UCR ni de las empresas de autobuses.
          </span>
        </p>
        <div className={styles.socialLinks}>
          <a href="https://instagram.com/kobemg" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
            <Instagram size={18} />
          </a>
          <a href="https://github.com/kobemg" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
            <Github size={18} />
          </a>
          <a href="https://kobemg.com/" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
            <Globe size={18} />
          </a>
          <a href="https://linkedin.com/in/kobemg" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
            <Linkedin size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
