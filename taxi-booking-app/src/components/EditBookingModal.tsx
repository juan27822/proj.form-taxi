import React, { useState, useEffect } from 'react';
import { Booking } from '../types';
import { useTranslation } from 'react-i18next';
import { getDrivers } from '../api';

interface EditBookingModalProps {
  booking: Booking;
  onClose: () => void;
  onSave: (booking: Booking) => void;
}

interface Driver {
  id: string;
  name: string;
}

const EditBookingModal: React.FC<EditBookingModalProps> = ({ booking, onClose, onSave }) => {
  const { t } = useTranslation();
  const [updatedBooking, setUpdatedBooking] = useState<Booking>(booking);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const driverData = await getDrivers();
        setDrivers(driverData);
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }
    };
    fetchDrivers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: string | number | boolean | null = value;

    if (type === 'checkbox') {
        parsedValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
        parsedValue = value === '' ? null : parseInt(value, 10);
    } else if (name === 'driverId' && value === '') {
        parsedValue = null; // Handle "No Driver" selection
    }

    setUpdatedBooking(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleSave = () => {
    // Create a copy of updatedBooking to avoid direct mutation
    const bookingToSend = { ...updatedBooking };
    // Remove the driver object as the backend only expects driverId
    if (bookingToSend.driver) {
      delete bookingToSend.driver;
    }
    onSave(bookingToSend);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2>{t('edit_booking_title')}</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {/* --- Campos Principales --- */}
            <div className="form-group">
              <label>{t('assign_driver_label')}</label>
              <select name="driverId" value={updatedBooking.driverId || ''} onChange={handleChange}>
                <option value="">{t('no_driver_option')}</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>{driver.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>{t('status_label')}</label>
              <select name="status" value={updatedBooking.status} onChange={handleChange}>
                <option value="pending">{t('pending')}</option>
                <option value="confirmed">{t('confirmed')}</option>
                <option value="cancelled">{t('cancelled')}</option>
                <option value="archived">{t('archived', 'Archivado')}</option>
              </select>
            </div>
            <div className="form-group">
              <label>{t('name_label')}</label>
              <input type="text" name="name" value={updatedBooking.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>{t('phone_label')}</label>
              <input type="tel" name="phone" value={updatedBooking.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>{t('email_label')}</label>
              <input type="email" name="email" value={updatedBooking.email || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>{t('people_label')}</label>
              <input type="number" name="people" value={updatedBooking.people || ''} onChange={handleChange} />
            </div>

            {/* --- Info de Llegada --- */}
            <div className="form-group">
              <label>{t('arrival_date_label')}</label>
              <input type="date" name="arrival_date" value={updatedBooking.arrival_date} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>{t('arrival_time_label')}</label>
              <input type="time" name="arrival_time" value={updatedBooking.arrival_time} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>{t('arrival_flight_number_label')}</label>
              <input type="text" name="arrival_flight_number" value={updatedBooking.arrival_flight_number || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>{t('destination_label')}</label>
              <input type="text" name="destination" value={updatedBooking.destination} onChange={handleChange} />
            </div>

            {/* --- Info de Vuelta --- */}
            <div className="form-group">
              <label>{t('return_date_label')}</label>
              <input type="date" name="return_date" value={updatedBooking.return_date || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>{t('return_time_label')}</label>
              <input type="time" name="return_time" value={updatedBooking.return_time || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>{t('return_pickup_address_label')}</label>
              <input type="text" name="return_pickup_address" value={updatedBooking.return_pickup_address || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>{t('return_flight_number_label')}</label>
              <input type="text" name="return_flight_number" value={updatedBooking.return_flight_number || ''} onChange={handleChange} />
            </div>

            {/* --- Info Adicional y Checkboxes --- */}
            <div className="form-group">
              <label>{t('luggageType_label')}</label>
              <input type="text" name="luggageType" value={updatedBooking.luggageType || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>{t('additional_info_label')}</label>
              <textarea name="additional_info" value={updatedBooking.additional_info || ''} onChange={handleChange} rows={3}></textarea>
            </div>
            <div className="form-group">
              <label>{t('hasMinors_label')}</label>
              <input type="checkbox" name="hasMinors" checked={!!updatedBooking.hasMinors} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>{t('needsBabySeat_label')}</label>
              <input type="checkbox" name="needsBabySeat" checked={!!updatedBooking.needsBabySeat} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>{t('needsBooster_label')}</label>
              <input type="checkbox" name="needsBooster" checked={!!updatedBooking.needsBooster} onChange={handleChange} />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>{t('cancel_btn')}</button>
            <button type="submit" className="btn btn-primary">{t('save_changes_btn')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBookingModal;
