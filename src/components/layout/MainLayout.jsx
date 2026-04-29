import { Toaster } from 'sileo';
import AdBanner from '../AdBanner';
import EmergencyContact from '../EmergencyContact';

import BottomNav from './BottomNav';
import styles from './MainLayout.module.css';

const MainLayout = ({ children }) => {
  return (
    <div className={styles.appContainer}>
      <Toaster position="top-right" />
      <AdBanner />

      <main className={styles.mainContent}>
        {children}
      </main>

      <EmergencyContact />
      <BottomNav />
    </div>
  );
};

export default MainLayout;
