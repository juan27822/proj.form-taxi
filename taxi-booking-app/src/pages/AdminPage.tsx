import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Booking } from '../types';
import BookingList from '../components/BookingList';
import LoginForm from '../components/LoginForm';
import SearchForm from '../components/SearchForm';
import Dashboard from '../components/Dashboard'; // Import Dashboard

import { useBookingStore } from '../store';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const AdminPage: React.FC = () => {
  const { t } = useTranslation();
  const { bookings, page, totalPages, pageSize, fetchBookings, searchBookings, addBooking } = useBookingStore();
  const [alarmSound, setAlarmSound] = useState<HTMLAudioElement | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const navigate = useNavigate(); // Initialize useNavigate

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

    const socket = io('http://localhost:3001');

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('newBooking', (newBooking: Booking) => {
      console.log('New booking received:', newBooking);
      alarmSound?.play();
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
    localStorage.setItem('token', newToken);
    setToken( newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const handleSearch = (field: string, value: string) => {
    searchBookings({ [field]: value });
  };

  const handleClearSearch = () => {
    fetchBookings(1, currentPageSize);
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
    <div style={{padding: '20px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1>{t('admin_dashboard_title')}</h1>
        <div>
          <button onClick={() => navigate('/charts')} style={{padding: '10px 20px', fontSize: '16px', backgroundColor: 'var(--primary-blue)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px'}}>{t('charts_btn')}</button>
          <button onClick={exportToCsv} style={{padding: '10px 20px', fontSize: '16px', backgroundColor: 'var(--primary-blue)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px'}}>{t('export_csv_btn')}</button>
          <button onClick={handleLogout} style={{padding: '10px 20px', fontSize: '16px', backgroundColor: 'var(--primary-blue)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>{t('logout_btn')}</button>
        </div>
      </div>

      <Dashboard />

      {/* <DriverManagement /> */}

      <SearchForm onSearch={handleSearch} onClear={handleClearSearch} />
      <BookingList bookings={bookings} onUpdate={() => fetchBookings(page, currentPageSize)} />

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <button onClick={handlePrevPage} disabled={page <= 1} style={{ padding: '8px 16px', margin: '0 5px', cursor: 'pointer' }}>
          {t('previous_btn')}
        </button>
        <span>
          {t('page_indicator', { page, totalPages })}
        </span>
        <button onClick={handleNextPage} disabled={page >= totalPages} style={{ padding: '8px 16px', margin: '0 5px', cursor: 'pointer' }}>
          {t('next_btn')}
        </button>
        <select value={currentPageSize} onChange={handlePageSizeChange} style={{ marginLeft: '20px', padding: '8px' }}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
};

export default AdminPage;

