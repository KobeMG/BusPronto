import { Toaster } from 'sileo';
import AdBanner from '../AdBanner';
import Footer from '../Footer';
import styles from './MainLayout.module.css';

const MainLayout = ({ children }) => {
  return (
    <div className={styles.appContainer}>
      <Toaster position="top-right" />
      <AdBanner />

      {children}

      <Footer />
    </div>
  );
};

export default MainLayout;
