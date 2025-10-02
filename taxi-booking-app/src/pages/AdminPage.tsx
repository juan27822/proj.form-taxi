import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useBookingStore } from '../stores/useBookingStore';
import AdminDashboard from './AdminDashboard';
import DriverManagement from '../components/DriverManagement';
import './AdminPage.css';

const AdminPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { archivePastBookings } = useBookingStore();
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'drivers'

  useEffect(() => {
    const socket = io("http://localhost:3002");

    socket.on('newBooking', (newBooking) => {
      console.log('New booking received via socket, store will update.', newBooking);
    });

    socket.on('flightAlarm', (data) => {
      console.log('Flight alarm received:', data.message);
      const audio = new Audio('/alarm.mp3');
      audio.play().catch(e => console.error("Error playing audio:", e));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleArchive = async () => {
    if (window.confirm(t('archive_confirm_message'))) {
      try {
        const result = await archivePastBookings();
        setNotification({ message: t('archive_success_message', { count: result.count }), type: 'success' });
      } catch (error) {
        setNotification({ message: t('error_archiving_bookings'), type: 'error' });
      }
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>{view === 'dashboard' ? t('admin_dashboard_title') : t('driver_management_title', 'Gestionar Conductores')}</h1>
        <div className="admin-header-actions">
          {view === 'dashboard' ? (
            <button onClick={() => setView('drivers')}>{t('driver_management_btn', 'Gestionar Conductores')}</button>
          ) : (
            <button onClick={() => setView('dashboard')}>{t('back_to_dashboard_btn', 'Volver al Panel')}</button>
          )}
          <button onClick={handleArchive}>{t('archive_past_bookings_btn')}</button>
          <button onClick={() => navigate('/admin/archived')}>{t('view_archived_btn')}</button>
          <button onClick={() => navigate('/charts')}>{t('charts_btn')}</button>
          <button onClick={logout}>{t('logout_btn')}</button>
        </div>
      </header>

      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
          <button onClick={() => setNotification(null)}>&times;</button>
        </div>
      )}
      
      {view === 'dashboard' && <AdminDashboard />}
      {view === 'drivers' && <DriverManagement />}
    </div>
  );
};

export default AdminPage;