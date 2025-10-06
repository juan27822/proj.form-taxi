import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';
import { useBookingStore } from '../stores/useBookingStore';
import AdminDashboard from './AdminDashboard';
import DriverManagement from '../components/DriverManagement';
import './AdminPage.css';

const AdminPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { archivePastBookings, fetchBookings } = useBookingStore();
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'drivers'
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMutedRef = useRef(isMuted);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    audioRef.current = new Audio('/alarm.mp3');

    const socket = io("http://localhost:3002");

    socket.on('newBooking', (newBooking) => {
      console.log('New booking received via socket, updating bookings.', newBooking);
      fetchBookings();
      if (!isMutedRef.current) {
        console.log('Playing sound for new booking.');
        audioRef.current?.play().catch(e => console.error("Error playing audio:", e));
      }
    });

    socket.on('flightAlarm', (data) => {
      console.log('Flight alarm received:', data.message);
      if (!isMutedRef.current) {
        audioRef.current?.play().catch(e => console.error("Error playing audio:", e));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchBookings]);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (!newMuted && audioRef.current) {
      // On first unmute, play and pause to unlock audio
      audioRef.current.play().then(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
      }).catch(e => console.error("Error unlocking audio:", e));
    }
  };

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
          <button onClick={toggleMute}>
            {isMuted ? t('unmute_btn') : t('mute_btn')}
          </button>
          {view === 'dashboard' ? (
            <button onClick={() => setView('drivers')}>{t('driver_management_btn', 'Gestionar Conductores')}</button>
          ) : (
            <button onClick={() => setView('dashboard')}>{t('backToDashboardBtn', 'Volver al Panel')}</button>
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