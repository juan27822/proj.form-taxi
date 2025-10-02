import React, { useEffect } from 'react';
import { useBookingStore } from '../stores/useBookingStore';
import BookingList from '../components/BookingList';
import FilterButtons from '../components/FilterButtons';

const AdminDashboard: React.FC = () => {
  // Usamos el hook que creamos para manejar el estado
  const { fetchBookings, fetchDrivers, filteredBookings, loading, error } = useBookingStore();

  // useEffect para cargar los datos iniciales cuando el componente se monta
  useEffect(() => {
    fetchBookings();
    fetchDrivers();
  }, [fetchBookings, fetchDrivers]);

  if (loading && (!filteredBookings || filteredBookings.length === 0)) return <div>Loading bookings...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="admin-dashboard" style={{ padding: '20px' }}>
      <FilterButtons />
      <BookingList bookings={filteredBookings || []} />
    </div>
  );
};

export default AdminDashboard;