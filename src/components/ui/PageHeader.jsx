import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PageHeader = ({ title, icon, description, showBackButton = false, backUrl = "/", actionButton }) => {
  const navigate = useNavigate();

  return (
    <div className="header" style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>

      {/* Top area for BackButton / ActionButton inline with title if needed */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', minHeight: '32px' }}>

        {showBackButton && (
          <button
            onClick={() => navigate(backUrl)}
            className="back-button"
            style={{ position: 'absolute', left: 0 }}
          >
            <ArrowLeft size={24} />
          </button>
        )}

        {/* Title & Icon */}
        <h1 className="title" style={{ margin: 0, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 40px' }}>
          {icon && <span style={{ marginRight: '0.5rem', display: 'flex' }}>{icon}</span>}
          {title}
        </h1>

        {actionButton && (
          <div style={{ position: 'absolute', right: 0 }}>
            {actionButton}
          </div>
        )}
      </div>

      {/* Description */}
      {description && (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '1rem' }}>
          {description}
        </p>
      )}
    </div>
  );
};

export default PageHeader;
