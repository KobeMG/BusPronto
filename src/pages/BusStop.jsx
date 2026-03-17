import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import horarios from '../data/horarios.json';
import BusTimer from '../components/BusTimer';

const stopNames = {
  facultad_educacion: 'Facultad de Educación',
  artes_plasticas: 'Artes Plásticas',
  facultad_odontologia: 'Facultad de Odontología'
};

const BusStop = () => {
  const { stopId } = useParams();
  const navigate = useNavigate();

  const schedule = horarios[stopId];
  const stopName = stopNames[stopId] || stopId?.replace('_', ' ');

  if (!schedule) {
    return (
      <div className="glass-card">
        <div className="header">
          <button onClick={() => navigate('/')} className="back-button">
            <ArrowLeft size={24} />
          </button>
          <h2 className="stop-name">Parada no encontrada</h2>
        </div>
        <p>No se encontraron horarios para esta ubicación.</p>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <div className="header">
        <button onClick={() => navigate('/')} className="back-button">
          <ArrowLeft size={24} />
        </button>
        <h2 className="stop-name">{stopName}</h2>
      </div>

      <BusTimer schedule={schedule} />
    </div>
  );
};

export default BusStop;
