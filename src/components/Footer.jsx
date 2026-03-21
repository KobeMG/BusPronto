import { Instagram, Github, Globe , Linkedin} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="developed-by">
          Desarrollado con ❤️ por <a href="https://kobemg.com/" target="_blank" rel="noopener noreferrer" className="brand">Kode Creative</a>
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
          <a href="https://linkedin.com/in/kobemg" target="_blank" rel="noopener noreferrer" className="social-icon">
            <Linkedin size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
