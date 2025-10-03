import jsPDF from 'jspdf';
import { TFunction } from 'i18next';
import { Booking } from '../types';

export const generatePdf = (booking: Booking, full: boolean, t: TFunction) => {
  const doc = new jsPDF();
  let y = 10;

  const addText = (label: string, value: string | number | boolean | undefined | null) => {
    if (value !== undefined && value !== null && value !== '') {
      doc.text(`${label}: ${value}`, 20, y);
      y += 10;
    }
  };

  doc.text('Booking Details', 20, y); y += 10;
  addText('ID', booking.id);
  addText('Status', t(booking.status));
  if (booking.receivedAt) {
    addText('Received At', new Date(booking.receivedAt).toLocaleString());
  }
  addText('Name', booking.name);
  addText('Phone', booking.phone);
  addText('Email', booking.email);
  addText('People', booking.people);
  if (booking.hasMinors) {
    addText('Has Minors', t('yes'));
    addText('Minors Age', booking.minorsAge);
  }
  if (booking.needsBabySeat) addText('Needs Baby Seat', t('yes'));
  if (booking.needsBooster) addText('Needs Booster', t('yes'));
  addText('Luggage Type', booking.luggageType);
  y += 5; doc.text('--- Arrival ---', 20, y); y += 10;
  addText('Date', booking.arrival_date);
  addText('Time', booking.arrival_time);
  addText('Flight', booking.arrival_flight_number);
  addText('Destination', booking.destination);
  if (full) {
    if (booking.return_date) {
      y += 5; doc.text('--- Return ---', 20, y); y += 10;
      addText('Date', booking.return_date);
      addText('Time', booking.return_time);
      addText('Flight Time', booking.return_flight_time);
      addText('Pickup', booking.return_pickup_address);
      addText('Flight', booking.return_flight_number);
    }
    if (booking.additional_info) {
      y += 5; doc.text('--- Additional Info ---', 20, y); y += 10;
      addText('Info', booking.additional_info);
    }
    if (booking.isModification) {
      y += 5; doc.text('--- Modification Info ---', 20, y); y += 10;
      addText('Is Modification', t('yes'));
      addText('Original Booking ID', booking.originalBookingId);
    }
  }
  doc.save(`booking-${booking.id}-${full ? 'full' : 'partial'}.pdf`);
};
