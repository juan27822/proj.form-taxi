import React, { useState, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
import { Booking } from '../types';
import BookingList from '../components/BookingList';
import LoginForm from '../components/LoginForm';
import SearchForm from '../components/SearchForm';
import ConfirmModal from '../components/ConfirmModal'; // Importar ConfirmModal
import { archivePastBookings as apiArchivePastBookings } from '../api'; // Importar la nueva función de la API
import { useBookingStore } from '../store';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './AdminPage.css'; // Import the new CSS file

const AdminPage: React.FC = () => {
  const { t } = useTranslation();
  const { bookings, page, totalPages, pageSize, fetchBookings, searchBookings, addBooking } = useBookingStore();
  const [alarmSound, setAlarmSound] = useState<HTMLAudioElement | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token_v2'));
  const [confirmation, setConfirmation] = useState<{ title: string; message: string; onConfirm: () => void; } | null>(null);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [activeFilter, setActiveFilter] = useState('all');
  const navigate = useNavigate(); // Initialize useNavigate

  const stats = useMemo(() => {
    if (!bookings) return { pendingCount: 0, forTodayCount: 0, earlyMorningCount: 0 };

    const pendingCount = bookings.filter(b => b.status === 'pending').length;
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const forTodayCount = bookings.filter(b => b.arrival_date === todayStr).length;

    const earlyMorningCount = bookings.filter(b => 
      b.arrival_date === tomorrowStr && 
      b.arrival_time >= '01:00' && 
      b.arrival_time <= '09:00'
    ).length;

    return { pendingCount, forTodayCount, earlyMorningCount };
  }, [bookings]);

  // Initialize alarm sound once
  useEffect(() => {
    setAlarmSound(new Audio('/alarm.mp3'));
  }, []);

  // Effect for fetching initial data
  useEffect(() => {
    if (token) {
        fetchBookings(page, currentPageSize);
    }
  }, [token, page, currentPageSize, fetchBookings]);

  // Effect for handling socket connection and events
  useEffect(() => {
    if (!token) return;

    const socketURL = `http://${window.location.hostname}:3001`;
    const socket = io(socketURL);

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('newBooking', (newBooking: Booking) => {
      console.log('New booking received:', newBooking);
      // --- MODIFICACIÓN ---
      // Intentamos reproducir el sonido y capturamos posibles errores.
      alarmSound?.play().catch(error => {
        console.error("Error al reproducir la alarma:", error);
        alert("No se pudo reproducir el sonido de la alarma. Es posible que necesites interactuar con la página primero (hacer clic en algún lugar).");
      });
      // --- FIN DE LA MODIFICACIÓN ---
      addBooking(newBooking);

      if (Notification.permission === "granted") {
        new Notification(t('new_booking_notification_title'), {
          body: t('new_booking_notification_body', { id: newBooking.id, name: newBooking.name }),
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    });

    // Cleanup on component unmount
    return () => {
      console.log('Disconnecting socket');
      socket.disconnect();
    };
  }, [token, alarmSound, t, addBooking]); // Dependencies are stable or managed

  const handleLogin = (newToken: string) => {
    if (newToken) {
      localStorage.setItem('token_v2', newToken);
      setToken(newToken);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token_v2');
    setToken(null);
  };

  const handleSearch = (params: { [key: string]: string }) => {
    searchBookings(params);
  };

  const handleClearSearch = () => {
    fetchBookings(1, currentPageSize);
    setActiveFilter('all');
  };

  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      handleClearSearch();
    } else {
      searchBookings({ status });
      setActiveFilter(status);
    }
  };

  const handleArchivePastBookings = () => {
    setConfirmation({
      title: t('archive_confirm_title'),
      message: t('archive_confirm_message'),
      onConfirm: async () => {
        await apiArchivePastBookings();
        fetchBookings(page, currentPageSize); // Refrescar la lista
        setConfirmation(null);
      },
    });
  };
  const handleNextPage = () => {
    if (page < totalPages) {
      fetchBookings(page + 1, currentPageSize);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      fetchBookings(page - 1, currentPageSize);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    setCurrentPageSize(newSize);
    fetchBookings(1, newSize); // Go back to first page when size changes
  };

  const exportToCsv = () => {
    const headers = [
      'ID', 'Status', 'Received At', 'Name', 'Phone', 'Email', 'People',
      'Has Minors', 'Minors Age', 'Needs Baby Seat', 'Needs Booster', 'Luggage Type',
      'Arrival Date', 'Arrival Time', 'Arrival Flight', 'Destination',
      'Return Date', 'Return Time', 'Return Pickup', 'Return Flight',
      'Additional Info', 'Is Modification', 'Original Booking ID'
    ];
    const rows = bookings.map(b => [
      b.id, b.status, b.receivedAt, b.name, b.phone, b.email, b.people,
      b.hasMinors ? t('yes') : t('no'), b.minorsAge || '', b.needsBabySeat ? t('yes') : t('no'), b.needsBooster ? t('yes') : t('no'), b.luggageType || '',
      b.arrival_date, b.arrival_time, b.arrival_flight_number, b.destination,
      b.return_date || '', b.return_time || '', b.return_pickup_address || '', b.return_flight_number || '',
      b.additional_info || '', b.isModification ? t('yes') : t('no'), b.originalBookingId || ''
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel compatibility
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'bookings.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!token) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>{t('admin_dashboard_title')}</h1>
        <div className="admin-header-actions">
          <button onClick={() => navigate('/charts')}>{t('charts_btn')}</button>
          <button onClick={exportToCsv}>{t('export_csv_btn')}</button>
          <button onClick={() => navigate('/admin/archived')}>{t('view_archived_btn', 'Ver Archivadas')}</button>
          <button onClick={handleArchivePastBookings}>{t('archive_past_bookings_btn')}</button>
          <button onClick={handleLogout}>{t('logout_btn')}</button>
        </div>
      </header>

      {/* <DriverManagement /> */}

      <div className="stat-cards">
        <div className="stat-card" onClick={() => handleStatusFilter('pending')}>
          <span className="stat-value">{stats.pendingCount}</span>
          <span className="stat-label">{t('pending_bookings', 'Pendientes')}</span>
        </div>
        <div className="stat-card" onClick={() => searchBookings({ arrival_date: new Date().toISOString().split('T')[0] })}>
          <span className="stat-value">{stats.forTodayCount}</span>
          <span className="stat-label">{t('bookings_for_today', 'Para Hoy')}</span>
        </div>
        <div className="stat-card" onClick={() => {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr = tomorrow.toISOString().split('T')[0];
          searchBookings({ arrival_date: tomorrowStr, startTime: '01:00', endTime: '09:00' });
        }}>
          <span className="stat-value">{stats.earlyMorningCount}</span>
          <span className="stat-label">{t('tomorrow_early_bookings', 'Mañana (1-9h)')}</span>
        </div>
      </div>

      <div className="quick-filters">
        <button
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => handleStatusFilter('all')}
        >
          {t('all_bookings', 'Todos')}
        </button>
        <button
          className={`filter-btn ${activeFilter === 'pending' ? 'active' : ''}`}
          onClick={() => handleStatusFilter('pending')}
        >
          {t('pending')}
        </button>
        <button
          className={`filter-btn ${activeFilter === 'confirmed' ? 'active' : ''}`}
          onClick={() => handleStatusFilter('confirmed')}
        >
          {t('confirmed')}
        </button>
        <button
          className={`filter-btn ${activeFilter === 'cancelled' ? 'active' : ''}`}
          onClick={() => handleStatusFilter('cancelled')}
        >
          {t('cancelled')}
        </button>
      </div>

      <SearchForm onSearch={handleSearch} onClear={handleClearSearch} />
      <BookingList bookings={bookings} onUpdate={() => fetchBookings(page, currentPageSize)} />

      <div className="pagination-controls">
        <button onClick={handlePrevPage} disabled={page <= 1}>
          {t('previous_btn')}
        </button>
        <span>
          {t('page_indicator', { page, totalPages })}
        </span>
        <button onClick={handleNextPage} disabled={page >= totalPages}>
          {t('next_btn')}
        </button>
        <select value={currentPageSize} onChange={handlePageSizeChange}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {confirmation && (
        <ConfirmModal
          title={confirmation.title}
          message={confirmation.message}
          onConfirm={confirmation.onConfirm}
          onCancel={() => setConfirmation(null)}
        />
      )}
    </div>
  );
};

export default AdminPage;
