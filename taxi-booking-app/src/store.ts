import { create } from 'zustand';
import { Booking, SearchParams } from './types';
import { getBookings, searchBookings as searchBookingsApi } from './api';

interface BookingState {
  bookings: Booking[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  fetchBookings: (page?: number, pageSize?: number) => Promise<void>;
  searchBookings: (params: SearchParams) => Promise<void>;
  addBooking: (booking: Booking) => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  fetchBookings: async (page = 1, pageSize = 10) => {
    console.log(`Attempting to fetch bookings for page ${page}...`);
    const data = await getBookings(page, pageSize);
    console.log('Data received in store:', data);
    set({ 
      bookings: data.bookings,
      total: data.total,
      page: data.page,
      pageSize: data.pageSize,
      totalPages: data.totalPages
    });
  },
  searchBookings: async (params: SearchParams) => {
    const bookingsData = await searchBookingsApi(params);
    set({ bookings: bookingsData, totalPages: 1, page: 1 }); // Reset pagination for search results
  },
  addBooking: (booking) => {
    set((state) => ({ bookings: [booking, ...state.bookings] }));
  },
}));
