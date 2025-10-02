import type {
  Booking as PrismaBooking,
  Driver as PrismaDriver,
} from '@prisma/client';

// Re-exportamos los tipos de Prisma para usarlos en toda la aplicación.
// Esto asegura que el frontend y el backend siempre estén sincronizados.
export type Booking = PrismaBooking;
export type Driver = PrismaDriver;
// Puedes añadir aquí otros tipos que necesites exportar desde Prisma
export * from '@prisma/client';

// --- Tipos Adicionales para la Aplicación ---

// Tipos para parámetros de búsqueda de reservas
export interface SearchParams {
  name?: string;
  phone?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

// Tipos para dashboard
export interface BookingsByPeriod {
  date: string;
  count: number;
}

export interface BookingsByHour {
  hour: string;
  count: number;
}

export interface PhoneOriginData {
  origin: string;
  count: number;
}

export interface RoundtripOnewayData {
  type: 'roundtrip' | 'oneway';
  count: number;
}

export interface DashboardPopularDestinationData {
  destination: string;
  count: number;
}

// Tipos para autenticación
export interface Credentials {
  username: string;
  password: string;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}