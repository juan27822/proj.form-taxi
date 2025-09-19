import axios from 'axios';
import { Booking } from './types'; // Asumiendo que types.ts define la interfaz Booking

const API_BASE_URL = 'http://localhost:3001/api';

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export const login = async (credentials: { email: string; pass: string }) => {
  const response = await axios.post(`${API_BASE_URL}/login`, credentials);
  return response.data;
};

export const createBooking = async (bookingData: Booking) => {
  const response = await axios.post(`${API_BASE_URL}/bookings`, bookingData);
  return response.data;
};

export const fetchBookings = async () => {
  const response = await axios.get(`${API_BASE_URL}/bookings`);
  return response.data;
};

export const updateBooking = async (id: string, bookingData: Partial<Booking>) => {
  const response = await axios.put(`${API_BASE_URL}/bookings/${id}`, bookingData);
  return response.data;
};

export const deleteBooking = async (id: string) => {
  const response = await axios.delete(`${API_BASE_URL}/bookings/${id}`);
  return response.data;
};

export const checkBookingStatus = async (id: string) => {
  const response = await axios.get(`${API_BASE_URL}/bookings/${id}/status`);
  return response.data;
};

export const confirmBooking = async (id: string) => {
  const response = await axios.post(`${API_BASE_URL}/bookings/${id}/confirm`);
  return response.data;
};

export const cancelBooking = async (id: string) => {
  const response = await axios.post(`${API_BASE_URL}/bookings/${id}/cancel`);
  return response.data;
};

export const requestInfo = async (id: string, message: string) => {
  const response = await axios.post(`${API_BASE_URL}/bookings/${id}/request-info`, { message });
  return response.data;
};

export const fetchDashboardData = async () => {
  const response = await axios.get(`${API_BASE_URL}/dashboard`);
  return response.data;
};

export const fetchDrivers = async () => {
  const response = await axios.get(`${API_BASE_URL}/drivers`);
  return response.data;
};

export const addDriver = async (driverData: { name: string; phone: string }) => {
  const response = await axios.post(`${API_BASE_URL}/drivers`, driverData);
  return response.data;
};

export const deleteDriver = async (id: string) => {
  const response = await axios.delete(`${API_BASE_URL}/drivers/${id}`);
  return response.data;
};
