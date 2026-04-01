import { Toaster } from 'sileo';
import AdBanner from '../AdBanner';
import Footer from '../Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Toaster position="top-right" />
      <AdBanner />

      {children}

      <Footer />
    </div>
  );
};

export default MainLayout;
