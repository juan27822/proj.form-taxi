import React, { useState, useEffect } from 'react';
import { Booking } from '../types';
import { useTranslation } from 'react-i18next';
import './BookingList.css';
import EditBookingModal from './EditBookingModal';
import RequestInfoModal from './RequestInfoModal'; // Import the new modal
import ConfirmModal from './ConfirmModal';
import { generatePdf } from '../utils/pdfGenerator';
import { confirmBooking, cancelBooking, updateBooking, requestInfo } from '../api';
import axios, { AxiosResponse } from 'axios';

interface BookingListProps {
  bookings: Booking[];
  onUpdate: () => void; // Function to refresh the booking list
}

const BookingList: React.FC<BookingListProps> = ({ bookings, onUpdate }) => {
  const { t } = useTranslation();
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [contactingBooking, setContactingBooking] = useState<Booking | null>(null);
  const [now, setNow] = useState(new Date());
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmation, setConfirmation] = useState<{ title: string; message: string; onConfirm: () => void; } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000); // Update every minute

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleApiCall = async (apiCall: () => Promise<AxiosResponse<any>>, successMessage: string, errorMessage: string) => {
    try {
        await apiCall();
        setNotification({ message: successMessage, type: 'success' });
        onUpdate();
    } catch (error: unknown) {
        console.error(errorMessage, error);
        if (axios.isAxiosError(error) && error.response) {
            const message = error.response?.data?.message || errorMessage;
            setNotification({ message, type: 'error' });
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
        handleApiCall(() => confirmBooking(id), t('booking_confirmed_success'), t('booking_update_error'));
        setConfirmation(null);
      },
    });
  };

  const handleCancel = (id: string) => {
    setConfirmation({
      title: t('cancel_booking_title'),
      message: t('cancel_booking_alert'),
      onConfirm: () => {
        handleApiCall(() => cancelBooking(id), t('booking_cancelled_success'), t('booking_update_error'));
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
    const THREE_HOURS_IN_MS = 3 * 60 * 60 * 1000;
    const relevantDate = booking.return_date || booking.arrival_date;
    const relevantTime = booking.return_date ? (booking.return_time || '23:59') : (booking.arrival_time || '23:59');
    if (relevantDate && relevantTime) {
      const bookingDateTime = new Date(`${relevantDate}T${relevantTime}`);
      if (bookingDateTime < now) {
        classes.push('past-booking');
        return classes.join(' ');
      }
    }
    if (booking.status === 'confirmed' && booking.arrival_date && booking.arrival_time) {
      const arrivalDateTime = new Date(`${booking.arrival_date}T${booking.arrival_time}`);
      const timeDiff = arrivalDateTime.getTime() - now.getTime();
      if (timeDiff > 0 && timeDiff < THREE_HOURS_IN_MS) {
        classes.push('booking-amber');
      }
    }
    return classes.join(' ');
  };

  if (bookings.length === 0) {
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
          <table>
          <thead>
            <tr>
              <th>{t('booking_id_col')}</th>
              <th>{t('received_at_col')}</th>
              <th>{t('status_col')}</th>
              <th>{t('driver_col')}</th>
              <th>{t('customer_col')}</th>
              <th>{t('contact_col')}</th>
              <th>{t('arrival_col')}</th>
              <th>{t('return_col')}</th>
              <th>{t('minors_luggage_col')}</th>
              <th>{t('modification_col')}</th>
              <th>{t('actions_col')}</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className={getRowClass(booking)}>
                <td>{booking.id}</td>
                <td>{new Date(booking.receivedAt).toLocaleString()}</td>
                <td><span className={`status-label status-label-${booking.status}`}>{t(booking.status)}</span></td>
                <td>{booking.driver ? booking.driver.name : t('n_a')}</td>
                <td>{booking.name} ({booking.people}p)</td>
                <td>{booking.phone}<br />{booking.email}</td>
                <td>{booking.arrival_date} {booking.arrival_time}<br />{booking.arrival_flight_number}<br />{booking.destination}</td>
                <td>
                  {booking.return_date ? (
                    <>
                      {`${booking.return_date} ${booking.return_time}`}
                      {booking.return_flight_time && <><br />{`Flight Time: ${booking.return_flight_time}`}</>}
                    </>
                  ) : (
                    t('n_a')
                  )}
                </td>
                <td>
                  {booking.hasMinors && `M: ${booking.minorsAge || 'N/A'}`}<br />
                  {booking.needsBabySeat && `BS: ${t('yes')}`}<br />
                  {booking.needsBooster && `B: ${t('yes')}`}<br />
                  {booking.luggageType && `L: ${booking.luggageType}`}
                </td>
                <td>{booking.isModification ? `${t('yes')} (${booking.originalBookingId || 'N/A'})` : t('no')}</td>
                <td className="actions-cell">
                  <button className="action-button edit" onClick={() => setEditingBooking(booking)}>{t('edit_btn')}</button>
                  <button className="action-button contact" onClick={() => setContactingBooking(booking)}>{t('contact_client_btn')}</button>
                  {booking.status === 'pending' && (
                    <>
                      <button className="action-button confirm" onClick={() => handleConfirm(booking.id)}>{t('confirm_btn')}</button>
                      <button className="action-button cancel" onClick={() => handleCancel(booking.id)}>{t('cancel_btn')}</button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <button className="action-button cancel" onClick={() => handleCancel(booking.id)}>{t('cancel_btn')}</button>
                  )}
                  <button className="action-button pdf" onClick={() => generatePdf(booking, true, t)}>{t('pdf_full_btn')}</button>
                  <button className="action-button pdf" onClick={() => generatePdf(booking, false, t)}>{t('pdf_partial_btn')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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
      </div>
    </>
  );
};

export default BookingList;
