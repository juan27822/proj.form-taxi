import React, { useState, useEffect } from 'react';
import { Booking } from '../types';
import { useTranslation } from 'react-i18next';
import './BookingList.css';
import EditBookingModal from './EditBookingModal';
import RequestInfoModal from './RequestInfoModal'; // Import the new modal
import ConfirmModal from './ConfirmModal';
import dateFormat from 'dateformat'; // Import dateformat
import { generatePdf } from '../utils/pdfGenerator';
import { requestInfo, updateBooking } from '../api';
import { FaEdit, FaEnvelope, FaCheck, FaTimes, FaFilePdf } from 'react-icons/fa'; // Importar iconos
import { useBookingStore } from '../stores/useBookingStore';

interface BookingListProps {
  bookings: Booking[];
  onUpdate?: () => void;
}

const BookingList: React.FC<BookingListProps> = ({ bookings, onUpdate }) => {
  const { t } = useTranslation();
  // Obtenemos los datos y la función para refrescar desde el store
  const { drivers, assignDriverToBooking, updateBookingStatus, fetchBookings } = useBookingStore();
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [contactingBooking, setContactingBooking] = useState<Booking | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmation, setConfirmation] = useState<{ title: string; message: string; onConfirm: () => void; } | null>(null);


  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleApiCall = async <T,>(apiCall: () => Promise<T>, successMessage: string, errorMessage: string) => {
    try {
        await apiCall();
        setNotification({ message: successMessage, type: 'success' });
        if (onUpdate) {
          onUpdate();
        } else {
          fetchBookings(); // Refrescar los datos desde el store
        }
    } catch (error: unknown) {
        console.error(errorMessage, error);
        // The api interceptor in api.ts will handle generic errors.
        // We can check for a specific structure if the error object is expected to have it.
        if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
            const detailedMessage = (error.response.data as { message: string }).message;
            console.error("Detailed error from server:", detailedMessage);
            setNotification({ message: detailedMessage, type: 'error' });
        } else {
            setNotification({ message: errorMessage, type: 'error' });
        }
    }
  };

  const handleConfirm = (id: string) => {
    setConfirmation({
      title: t('confirm_booking_title'),
      message: t('confirm_booking_alert'),
      onConfirm: () => {
        handleApiCall(() => updateBookingStatus(id, 'confirmed'), t('booking_confirmed_success'), t('booking_update_error'));
        setConfirmation(null);
      },
    });
  };

  const handleCancel = (id: string) => {
    setConfirmation({
      title: t('cancel_booking_title'),
      message: t('cancel_booking_alert'),
      onConfirm: () => {
        handleApiCall(() => updateBookingStatus(id, 'cancelled'), t('booking_cancelled_success'), t('booking_update_error'));
        setConfirmation(null);
      },
    });
  };

  const handleSave = (updatedBooking: Booking) => {
    handleApiCall(() => updateBooking(updatedBooking.id, updatedBooking), t('booking_updated_success'), t('booking_update_error'));
    setEditingBooking(null);
  };

  const handleSendQuery = (message: string) => {
    if (!contactingBooking) return;
    handleApiCall(() => requestInfo(contactingBooking.id, message), t('query_sent_success'), t('query_sent_error'));
    setContactingBooking(null);
  };

  const getRowClass = (booking: Booking) => {
    const classes = [`status-${booking.status}`];
    const arrivalDateStr = booking.arrival_date;

    if (booking.isModification) {
      classes.push('edited-booking');
    }

    if (arrivalDateStr) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const arrivalDate = new Date(arrivalDateStr);
      arrivalDate.setHours(0, 0, 0, 0);

      if (arrivalDate.getTime() < today.getTime()) {
        classes.push('past-booking');
      } else if (arrivalDate.getTime() === today.getTime()) {
        classes.push('today-booking');
      }
    }

    if (!booking.driverId && !classes.includes('past-booking')) {
      classes.push('unassigned-booking');
    }

    return classes.join(' ');
  };

  if (!bookings || bookings.length === 0) {
    return <p>{t('no_bookings_yet')}</p>;
  }

  return (
    <>
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}
            <div className="booking-list-container">
              <div className="booking-list">
                {bookings.map((booking) => (
                  <div key={booking.id} className={`booking-item ${getRowClass(booking)}`}>
                    <div className="booking-main-content">
                      <div className="booking-summary">
                        <div className="summary-item"><strong>{t('booking_id_col')}:</strong> {booking.id}</div>
                        <div className="summary-item"><strong>{t('received_at_col')}:</strong> {booking.receivedAt ? dateFormat(new Date(booking.receivedAt), "dd/mm/yyyy HH:MM") : t('n_a')}</div>
                        <div className="summary-item"><strong>{t('arrival_col')}:</strong> {booking.arrival_date} {booking.arrival_time}</div>
                        <div className="summary-item"><strong>{t('customer_col')}:</strong> {booking.name} ({booking.people}p)</div>
                        <div className="summary-item"><strong>{t('destination_col')}:</strong> {booking.destination}</div>
                        <div className="summary-item"><strong>{t('minors_col')}:</strong> {booking.hasMinors ? t('yes') : t('no')}</div>
                        <div className="summary-item"><strong>{t('child_seat_col')}:</strong> {booking.needsBabySeat ? t('yes') : t('no')}</div>
                        <div className="summary-item"><strong>{t('booster_seat_col')}:</strong> {booking.needsBooster ? t('yes') : t('no')}</div>
                      </div>
                      <details className="booking-details">
                        <summary>{t('more_info_btn')}</summary>
                        <div className="details-content">
                          <p><strong>{t('status_col')}:</strong> <span className={`status-label status-label-${booking.status}`}>{t(booking.status)}</span></p>
                          <p><strong>{t('driver_col')}:</strong> {booking.driverId ? drivers.find(d => d.id === booking.driverId)?.name ?? t('n_a') : t('n_a')}</p>
                          <p><strong>{t('contact_col')}:</strong> {booking.phone} | {booking.email}</p>
                          <p><strong>{t('arrival_col')}:</strong> {booking.arrival_date} {booking.arrival_time} - Flight: {booking.arrival_flight_number || 'N/A'} - Destination: {booking.destination}</p>
                          {booking.status === 'pending' && drivers.length > 0 && (
                            <div className="driver-assignment">
                              <select
                                onChange={(e) => assignDriverToBooking(booking.id, e.target.value)}
                                defaultValue=""
                              >
                                <option value="" disabled>{t('assign_driver_placeholder')}</option>
                                {drivers.map((driver) => (
                                  <option key={driver.id} value={driver.id}>{driver.name}</option>
                                ))}
                              </select>
                            </div>
                          )}
                          <p><strong>{t('return_col')}:</strong> {booking.return_date ? `${booking.return_date} ${booking.return_time}` : t('n_a')}{booking.return_flight_time && ` - Flight Time: ${booking.return_flight_time}`}</p>
                          <p><strong>{t('minors_age_col')}:</strong> {booking.minorsAge || 'N/A'}</p>
                          <p><strong>{t('luggage_type_col')}:</strong> {booking.luggageType || 'N/A'}</p>
                          <p><strong>{t('modification_col')}:</strong> {booking.isModification ? `${t('yes')} (${booking.originalBookingId || 'N/A'})` : t('no')}</p>
                        </div>
                      </details>
                    </div>
                    <div className="booking-actions">
                          <button className="btn-edit" onClick={() => setEditingBooking(booking)}><FaEdit /> {t('edit_btn')}</button>
                          <button className="btn-contact" onClick={() => setContactingBooking(booking)}><FaEnvelope /> {t('contact_client_btn')}</button>
                          {booking.status === 'pending' && !booking.driverId && (
                            <>
                              <button className="btn-confirm" onClick={() => handleConfirm(booking.id)}><FaCheck /> {t('confirm_btn')}</button>
                              <button className="btn-cancel" onClick={() => handleCancel(booking.id)}><FaTimes /> {t('cancel_btn')}</button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <button className="btn-cancel" onClick={() => handleCancel(booking.id)}><FaTimes /> {t('cancel_btn')}</button>
                          )}
                          <button className="btn-pdf" onClick={() => generatePdf(booking, true, t)}><FaFilePdf /> {t('pdf_full_btn')}</button>
                          <button className="btn-pdf" onClick={() => generatePdf(booking, false, t)}><FaFilePdf /> {t('pdf_partial_btn')}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        {editingBooking && (
          <EditBookingModal
            booking={editingBooking}
            onClose={() => setEditingBooking(null)}
            onSave={handleSave}
          />
        )}

        {contactingBooking && (
          <RequestInfoModal
            booking={contactingBooking}
            onClose={() => setContactingBooking(null)}
            onSend={handleSendQuery}
          />
        )}

        {confirmation && (
          <ConfirmModal
            title={confirmation.title}
            message={confirmation.message}
            onConfirm={confirmation.onConfirm}
            onCancel={() => setConfirmation(null)}
          />
        )}
    </>
  );
};

export default BookingList;
