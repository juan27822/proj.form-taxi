import axios from 'axios';
import { Credentials, UserData, SearchParams, Booking } from './types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403 && error.response.data.message === 'jwt expired') {
      // Token expired, log out user
      localStorage.removeItem('token');
      window.location.href = '/login'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

export const login = async (credentials: Credentials) => {
  const response = await api.post('/login', credentials);
  if (response.data.accessToken) {
    localStorage.setItem('token', response.data.accessToken);
  }
  return response.data;
};

export const register = async (userData: UserData) => {
  return await api.post('/register', userData);
};

export const getBookings = async (page = 1, pageSize = 10) => {
  const response = await api.get('/bookings', {
    params: { page, pageSize }
  });
  console.log('Bookings data received:', response.data);
  return response.data; // Return response.data directly
};

export const getBookingStatus = async (id: string) => {
    return await api.get(`/bookings/status/${id}`);
};

export const searchBookings = async (params: SearchParams) => {
    const response = await api.get('/bookings/search', { params });
    return response;
};

export const createBooking = async (bookingData: Booking) => {
  return await api.post('/bookings', bookingData);
};

export const confirmBooking = async (id: string) => {
  return await api.post(`/bookings/${id}/confirm`);
};

export const cancelBooking = async (id: string) => {
  return await api.post(`/bookings/${id}/cancel`);
};

export const updateBooking = async (id: string, bookingData: Partial<Booking>) => {
  return await api.put(`/bookings/${id}`, bookingData);
};

export const requestInfo = async (id: string, message: string) => {
  return await api.post(`/bookings/${id}/request-info`, { message });
};

export const getDashboardBookingsByDay = async (period = 'month') => {
  const response = await api.get('/dashboard/bookings-by-period', {
    params: { period }
  });
  return response.data;
};

export const getDashboardPopularDestinations = async (limit = 5) => {
  const response = await api.get('/dashboard/popular-destinations', {
    params: { limit }
  });
  return response.data;
};

export const getPhoneOriginDistribution = async () => {
  const response = await api.get('/dashboard/phone-origin-distribution');
  return response.data;
};

export const getRoundtripVsOneway = async () => {
  const response = await api.get('/dashboard/roundtrip-vs-oneway');
  return response.data;
};

export const getDashboardBookingsByHour = async () => {
  const response = await api.get('/dashboard/bookings-by-hour');
  return response.data;
};

// Driver APIs
export const getDrivers = async () => {
  const response = await api.get('/drivers');
  return response.data;
};

export const createDriver = async (driverData: { name: string; phone: string }) => {
  const response = await api.post('/drivers', driverData);
  return response.data;
};

export const updateDriver = async (id: string, driverData: { name: string; phone: string }) => {
  const response = await api.put(`/drivers/${id}`, driverData);
  return response.data;
};

export const deleteDriver = async (id: string) => {
  await api.delete(`/drivers/${id}`);
};
