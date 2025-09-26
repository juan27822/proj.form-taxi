export interface Driver {
  id: string;
  name: string;
  phone: string;
}

export interface Booking {
  id: string;
  receivedAt: string; // Date and time when the booking was received
  status: 'pending' | 'confirmed' | 'cancelled';

  // Customer info
  name: string;
  phone: string;
  email?: string;
  people: number;
  hasMinors?: boolean; // New: if minors are coming
  minorsAge?: string; // New: age of minors
  needsBabySeat?: boolean; // New: if baby seat is needed
  needsBooster?: boolean; // New: if booster is needed
  luggageType?: string; // New: type of luggage

  // Arrival info
  arrival_date: string;
  arrival_time: string;
  arrival_flight_number?: string;
  destination: string;

  // Return trip info (optional)
  return_date?: string;
  return_time?: string;
  return_flight_time?: string;
  return_pickup_address?: string;
  return_flight_number?: string;

  // Additional info
  additional_info?: string;

  // Modification info
  isModification?: boolean; // New: if this booking is a modification
  originalBookingId?: string; // New: original booking ID if it's a modification
  driver?: Driver;
  driverId?: string | null;
}

export interface Credentials {
  username: string;
  password: string;
}

export interface UserData {
  name: string;
  email: string;
  pass: string;
}

export interface SearchParams {
  name?: string;
  phone?: string;
  arrival_date?: string;
  id?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'archived';
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
}

// Chart-related types
export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface PhoneOriginData {
  origin: string;
  count: number;
}

export interface RoundtripOnewayData {
  type: string;
  count: number;
}

export interface BookingsByPeriod {
  period: string;
  oneWay: number;
  roundTrip: number;
}

export interface BookingsByHour {
  hour: string;
  count: number;
}
