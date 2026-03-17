import { Instagram, Github, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="developed-by">
          Desarrollado con ❤️ por <span className="brand">Kode Creative</span>
        </p>
        <div className="social-links">
          <a href="https://instagram.com/kobemg" target="_blank" rel="noopener noreferrer" className="social-icon">
            <Instagram size={18} />
          </a>
          <a href="https://github.com/kobemg" target="_blank" rel="noopener noreferrer" className="social-icon">
            <Github size={18} />
          </a>
          <a href="https://kobemg.com/" target="_blank" rel="noopener noreferrer" className="social-icon">
            <Globe size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
