import { create } from 'zustand';
import { getBookings, getDrivers, updateBooking, archivePastBookings } from '../api';
import { Booking, Driver } from '../types';

// Define el tipo para el estado del store
interface BookingState {
  bookings: Booking[];
  drivers: Driver[];
  filteredBookings: Booking[];
  filter: string;
  loading: boolean;
  error: string | null;
  fetchBookings: () => Promise<void>;
  fetchDrivers: () => Promise<void>;
  setFilter: (filter: string) => void;
  updateBookingStatus: (id: string, status: string, driverId?: string) => Promise<void>;
  assignDriverToBooking: (bookingId: string, driverId: string) => Promise<void>;
  archivePastBookings: () => Promise<{ count: number }>;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  drivers: [],
  filteredBookings: [],
  filter: 'all',
  loading: false,
  error: null,

  // Acción para obtener todas las reservas desde el backend
  fetchBookings: async () => {
    set({ loading: true, error: null });
    try {
      // Usar la función específica de la API
      const { bookings } = await getBookings({ page: 1, pageSize: 1000 }); // Pedimos un número grande para obtener todas
      set({ bookings, loading: false });
      get().setFilter(get().filter); // Re-aplicar el filtro actual
    } catch (error) {
      console.error('Error fetching bookings:', error);
      set({ error: 'Failed to fetch bookings', loading: false });
    }
  },

  // Acción para obtener todos los conductores
  fetchDrivers: async () => {
    try {
      const drivers = await getDrivers();
      set({ drivers });
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  },

  // Acción para actualizar el filtro y recalcular las reservas filtradas
  setFilter: (filter) => {
    set({ filter });
    const { bookings } = get();
    let filtered: Booking[] = [];

    if (filter === 'unassigned') {
      // Lógica corregida para filtrar reservas sin conductor asignado
      console.log('Filtering for unassigned bookings...');
      filtered = bookings.filter((booking) => booking.driverId === null || booking.driverId === undefined);
    } else if (filter === 'all') {
      filtered = bookings;
    } else {
      // Filtra por otros estados (pending, confirmed, etc.)
      filtered = bookings.filter((booking) => booking.status === filter);
    }
    set({ filteredBookings: filtered });
  },

  // Acción para actualizar el estado de una reserva
  updateBookingStatus: async (id, status, driverId) => {
    try {
      await updateBooking(id, { status, driverId });
      // Volver a obtener las reservas para reflejar el cambio
      get().fetchBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      set({ error: 'Failed to update booking status' });
    }
  },
  
  // Acción para asignar un conductor a una reserva
  assignDriverToBooking: async (bookingId, driverId) => {
    await get().updateBookingStatus(bookingId, 'confirmed', driverId);
  },

  // Acción para archivar reservas pasadas
  archivePastBookings: async () => {
    set({ loading: true });
    try {
      const result = await archivePastBookings();
      get().fetchBookings(); // Refrescar la lista de reservas
      return result;
    } catch (error) {
      console.error('Error archiving past bookings:', error);
      set({ error: 'Failed to archive past bookings' });
      throw error; // Re-lanzar el error para que el componente pueda manejarlo
    }
  },
}));
