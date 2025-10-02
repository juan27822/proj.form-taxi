import { Booking } from '../types';

const firstNames = ['Juan', 'Maria', 'Carlos', 'Ana', 'Luis', 'Elena', 'Jorge', 'Sofia', 'Miguel', 'Lucia'];
const lastNames = ['García', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez', 'Torres'];
const destinations = ['Hotel Palma Real', 'Aeropuerto', 'Centro Histórico', 'Playa del Sol', 'Resort Montaña Azul'];
const statuses: Booking['status'][] = ['pending', 'confirmed', 'cancelled'];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export const generateMockBookings = (count: number): Booking[] => {
  const bookings: Booking[] = [];

  for (let i = 0; i < count; i++) {
    const receivedAt = getRandomDate(new Date(2023, 0, 1), new Date());
    const arrivalDateTime = getRandomDate(new Date(), new Date(2024, 11, 31));

    const booking: Booking = {
      id: `MOCK-${receivedAt.getTime()}-${i}`,
      receivedAt: receivedAt,
      name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
      phone: `+34 6${String(Math.random()).substring(2, 10)}`,
      email: `test${i}@example.com`,
      people: Math.floor(Math.random() * 4) + 1,
      arrival_date: arrivalDateTime.toISOString().split('T')[0],
      arrival_time: arrivalDateTime.toTimeString().substring(0, 5),
      destination: getRandomElement(destinations),
      status: getRandomElement(statuses),
      hasMinors: Math.random() > 0.8,
      needsBabySeat: Math.random() > 0.9,
      needsBooster: Math.random() > 0.9,
      luggageType: `${Math.floor(Math.random() * 3) + 1} maletas`,
      isModification: false,
      driverId: null,
      // Add all optional fields to be fully compliant
      minorsAge: null,
      arrival_flight_number: null,
      return_date: null,
      return_time: null,
      return_flight_time: null,
      return_pickup_address: null,
      return_flight_number: null,
      additional_info: null,
      originalBookingId: null,
      lang: 'es',
    };

    bookings.push(booking);
  }

  return bookings.sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime());
};