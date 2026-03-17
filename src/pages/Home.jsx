import { Link } from 'react-router-dom';
import { Bus, ChevronRight } from 'lucide-react';
import horarios from '../data/horarios.json';

const stopNames = {
  facultad_educacion: 'Facultad de Educación',
  artes_plasticas: 'Artes Plásticas',
  facultad_odontologia: 'Facultad de Odontología'
};

const Home = () => {
  const stops = Object.keys(horarios);

  return (
    <div className="glass-card">
      <h1 className="title">
        <Bus size={32} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
        BusPronto
      </h1>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Seleccione su parada actual para ver cuánto falta para el próximo bus.
      </p>

      <div className="stop-list">
        {stops.map((stop) => (
          <Link to={`/parada/${stop}`} key={stop} className="stop-link">
            <span>{stopNames[stop] || stop.replace('_', ' ')}</span>
            <ChevronRight size={20} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;
