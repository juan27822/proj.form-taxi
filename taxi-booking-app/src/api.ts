import axios from 'axios';
import { useAuthStore } from './store/authStore';
import { Booking, Driver, BookingsByPeriod, BookingsByHour, PhoneOriginData, RoundtripOnewayData, DashboardPopularDestinationData, SearchParams, Credentials } from './types';

const api = axios.create({
  baseURL: '/api', // Usar la ruta relativa para que el proxy de Vite funcione
});

// Subscribe to the auth store to get the token
let token: string | null = useAuthStore.getState().token;
useAuthStore.subscribe((state) => {
  token = state.token;
});

// --- Axios Interceptor ---
// This automatically attaches the auth token to every request.
api.interceptors.request.use(
  (config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export { api };

// --- Funciones de Reservas (Bookings) ---

/**
 * Crea una nueva reserva. Esta función es para el formulario público.
 */
export const createBooking = async (bookingData: Omit<Booking, 'id' | 'status' | 'createdAt' | 'receivedAt' | 'driver' | 'driverId'>) => {
  const { data } = await api.post<Booking>('/bookings', bookingData);
  return data;
};

/**
 * Obtiene una lista paginada de reservas. Esta función es para el panel de administración.
 */
export const getBookings = async (
  params: { page: number; pageSize: number }
): Promise<{
  bookings: Booking[]; total: number; page: number; pageSize: number; totalPages: number;
}> => {
    const { data } = await api.get<{ bookings: Booking[]; total: number; page: number; pageSize: number; totalPages: number; }>('/bookings', { params });
    return data;
};


/**
 * Busca y filtra reservas. Esta función es para el panel de administración.
 */
export const searchBookings = async (params: SearchParams): Promise<Booking[]> => {
    const { data } = await api.get<Booking[]>('/bookings/search', { params });
    return data;
};

/**
 * Actualiza el estado de una reserva. Esta función es para el panel de administración.
 */
export const updateBookingStatus = async (id: string, status: string): Promise<Booking> => {
    const { data } = await api.patch<Booking>(`/bookings/${id}/status`, { status });
    return data;
};

/**
 * Obtiene el estado de una reserva por su ID (público). Esta función es para la página de consulta de estado del cliente.
 */
export const getBookingStatus = async (id: string): Promise<Booking> => {
    // Note: This endpoint should be public on the backend.
    const { data } = await api.get<Booking>(`/bookings/${id}`);
    return data;
};

/**
 * Actualiza los detalles completos de una reserva. Esta función es para el panel de administración (ej. desde el modal de edición).
 */
export const updateBooking = async (id: string, bookingData: Partial<Booking>): Promise<Booking> => {
    const { data } = await api.put<Booking>(`/bookings/${id}`, bookingData);
    return data;
};

/**
 * Confirma una reserva específica. Esta función es para el panel de administración.
 */
export const confirmBooking = async (id: string): Promise<Booking> => {
    const { data } = await api.post<Booking>(`/bookings/${id}/confirm`);
    return data;
};

/**
 * Cancela una reserva específica. Esta función es para el panel de administración.
 */
export const cancelBooking = async (id: string): Promise<Booking> => {
    const { data } = await api.post<Booking>(`/bookings/${id}/cancel`);
    return data;
};

/**
 * Solicita el envío de información de la reserva al cliente. Esta función es para el panel de administración.
 */
export const requestInfo = async (id: string, message: string): Promise<void> => {
    // This endpoint should trigger the backend to send booking info (e.g., via email)
    await api.post(`/bookings/${id}/request-info`, { message });
};

// --- Funciones de Administración ---

/**
 * Archiva todas las reservas pasadas que están completadas. Esta función es para el panel de administración.
 */
export const archivePastBookings = async (): Promise<{ count: number }> => {
    const { data } = await api.post<{ count: number }>('/bookings/archive-past', {});
    return data;
};

/**
 * Obtiene la lista de conductores. Esta función es para el panel de administración.
 */
export const getDrivers = async (): Promise<Driver[]> => {
    const { data } = await api.get<Driver[]>('/drivers');
    return data;
};

/**
 * Crea un nuevo conductor. Esta función es para el panel de administración.
 */
export const createDriver = async (driverData: Omit<Driver, 'id'>): Promise<Driver> => {
    const { data } = await api.post<Driver>('/drivers', driverData);
    return data;
};

/**
 * Actualiza un conductor existente. Esta función es para el panel de administración.
 */
export const updateDriver = async (id: string, driverData: Partial<Driver>): Promise<Driver> => {
    const { data } = await api.put<Driver>(`/drivers/${id}`, driverData);
    return data;
};

/**
 * Elimina un conductor. Esta función es para el panel de administración.
 */
export const deleteDriver = async (id: string): Promise<void> => {
    await api.delete(`/drivers/${id}`);
};


// --- Funciones de Dashboard ---

/**
 * Obtiene las reservas por día para el dashboard. Esta función es para el panel de administración.
 */
export const getDashboardBookingsByDay = async (): Promise<BookingsByPeriod[]> => {
    const { data } = await api.get<BookingsByPeriod[]>('/dashboard/bookings-by-day');
    return data;
};

/**
 * Obtiene las reservas por hora para el dashboard. Esta función es para el panel de administración.
 */
export const getDashboardBookingsByHour = async (): Promise<BookingsByHour[]> => {
    const { data } = await api.get<BookingsByHour[]>('/dashboard/bookings-by-hour');
    return data;
};

/**
 * Obtiene la distribución de origen de los teléfonos para el dashboard. Esta función es para el panel de administración.
 */
export const getPhoneOriginDistribution = async (): Promise<PhoneOriginData[]> => {
    const { data } = await api.get<PhoneOriginData[]>('/dashboard/phone-origin');
    return data;
};

/**
 * Obtiene la comparación entre viajes de ida y vuelta y solo ida. Esta función es para el panel de administración.
 */
export const getRoundtripVsOneway = async (): Promise<RoundtripOnewayData[]> => {
    const { data } = await api.get<RoundtripOnewayData[]>('/dashboard/roundtrip-vs-oneway');
    return data;
};

/**
 * Obtiene los destinos más populares para el dashboard. Esta función es para el panel de administración.
 */
export const getDashboardPopularDestinations = async (): Promise<DashboardPopularDestinationData[]> => {
    const { data } = await api.get<DashboardPopularDestinationData[]>('/dashboard/popular-destinations');
    return data;
};


// --- Funciones de Autenticación (Auth) ---

/**
 * Inicia sesión de un usuario.
 */
export const login = async (credentials: Credentials) => {
  const { data } = await api.post<{ accessToken: string }>('/login', credentials);
  return data;
};
