import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Booking } from '../types';
import BookingList from '../components/BookingList';
import { searchBookings as apiSearchBookings } from '../api';
import './AdminPage.css';

const ArchivedBookingsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [archivedBookings, setArchivedBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchArchivedBookings = async () => {
    setIsLoading(true);
    try {
      const data = await apiSearchBookings({ status: 'archived' });
      setArchivedBookings(data);
    } catch (error) {
      console.error("Error fetching archived bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token_v2');
    if (!token) {
      navigate('/admin'); // Si no hay token, vuelve al login/admin
      return;
    }
    fetchArchivedBookings();
  }, [navigate]);

  const handleUpdate = () => {
    // Si se edita una reserva archivada (ej. para desarchivarla), se refresca la lista
    fetchArchivedBookings();
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="page-title">
          <h1>{t('archived_bookings_title', 'Reservas Archivadas')}</h1>
          {!isLoading && <span className="total-count">({archivedBookings.length})</span>}
        </div>
        <div className="admin-header-actions">
          <button onClick={() => navigate('/admin')}>
            {t('back_to_dashboard_btn', 'Volver al Panel')}
          </button>
        </div>
      </header>

      {isLoading ? (
        <p>{t('loading', 'Cargando...')}</p>
      ) : (
        <BookingList bookings={archivedBookings} onUpdate={handleUpdate} />
      )}
    </div>
  );
};

export default ArchivedBookingsPage;