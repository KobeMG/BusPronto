import { Outlet } from 'react-router-dom';
import { Toaster } from 'sileo';
import AdBanner from '../AdBanner';
import EmergencyContact from '../EmergencyContact';
import AddBubble from '../AddBubble';

import BottomNav from './BottomNav';
import styles from './MainLayout.module.css';

const MainLayout = () => {
  return (
    <div className={styles.appContainer}>
      <Toaster position="top-right" />
      <AdBanner />

      <main className={styles.mainContent}>
        <Outlet />
      </main>

      <EmergencyContact />
      <AddBubble />
      <BottomNav />
    </div>
  );
};

export default MainLayout;
