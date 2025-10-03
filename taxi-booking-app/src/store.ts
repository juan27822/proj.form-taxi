import { create } from 'zustand';
import { Booking, SearchParams } from './types';
import { getBookings, searchBookings as searchBookingsApi, archivePastBookings } from './api';

interface BookingState {
  bookings: Booking[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  fetchBookings: (page?: number, pageSize?: number) => Promise<void>;
  searchBookings: (params: SearchParams) => Promise<void>;
  addBooking: (booking: Booking) => void;
  archiveBookings: () => Promise<{ count: number }>;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  isLoading: false,
  error: null,
  fetchBookings: async (page = 1, pageSize = 10) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getBookings({ page, pageSize });
      set({ 
        bookings: data.bookings || [],
        total: data.total,
        page: data.page,
        pageSize: data.pageSize,
        totalPages: data.totalPages,
        isLoading: false,
      });
    } catch (err) {
      set({ error: 'Error fetching bookings', isLoading: false });
    }
  },
  searchBookings: async (params: SearchParams) => {
    set({ isLoading: true, error: null });
    try {
      const bookingsData = await searchBookingsApi(params);
      set({ bookings: bookingsData, totalPages: 1, page: 1, isLoading: false }); // Reset pagination for search results
    } catch (err) {
      set({ error: 'Error searching bookings', isLoading: false });
    }
  },
  addBooking: (booking) => {
    set((state) => ({ bookings: [booking, ...state.bookings] }));
  },
  archiveBookings: async () => {
    const result = await archivePastBookings();
    return result;
  }
}));
