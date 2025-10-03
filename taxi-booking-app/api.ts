import axios from 'axios';
import type { Booking, Driver, User } from '@prisma/client';
import { useAuthStore } from './store/authStore';

// Usar variables de entorno para la URL de la API.
// En desarrollo, esto será '/api' para usar el proxy de Vite.
// En producción, se configurará una variable de entorno en el servicio de hosting (Vercel, Netlify, etc.).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'; // El valor por defecto '/api' usará el proxy de Vite

const api = axios.create({
  baseURL: API_BASE_URL,
});

type Credentials = Pick<User, 'username' | 'password'>;

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const login = async (credentials: Credentials) => {
  const response = await api.post<{ accessToken: string }>('/login', credentials);
  return response.data;
};

export const createBooking = async (bookingData: Booking) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

export const fetchBookings = async () => {
  const response = await api.get<Booking[]>('/bookings');
  return response.data;
};

export const updateBooking = async (id: string, bookingData: Partial<Booking>) => {
  const response = await api.put(`/bookings/${id}`, bookingData);
  return response.data;
};

export const deleteBooking = async (id: string) => {
  const response = await api.delete(`/bookings/${id}`);
  return response.data;
};

export const checkBookingStatus = async (id: string) => {
  const response = await api.get(`/bookings/${id}/status`);
  return response.data;
};

export const confirmBooking = async (id: string) => {
  const response = await api.post(`/bookings/${id}/confirm`);
  return response.data;
};

export const cancelBooking = async (id: string) => {
  const response = await api.post(`/bookings/${id}/cancel`);
  return response.data;
};

export const requestInfo = async (id: string, message: string) => {
  const response = await api.post(`/bookings/${id}/request-info`, { message });
  return response.data;
};

export const fetchDashboardData = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

export const fetchDrivers = async () => {
  const response = await api.get<Driver[]>('/drivers');
  return response.data;
};

export const addDriver = async (driverData: Pick<Driver, 'name' | 'phone'>) => {
  const response = await api.post('/drivers', driverData);
  return response.data;
};

export const deleteDriver = async (id: string): Promise<void> => {
  const response = await api.delete(`/drivers/${id}`);
  return response.data;
};
