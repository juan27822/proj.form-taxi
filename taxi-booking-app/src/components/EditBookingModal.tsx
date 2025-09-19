import React, { useState, useEffect } from 'react';
import { Booking } from '../types';
import { useTranslation } from 'react-i18next';
import { getDrivers } from '../api'; // Import getDrivers

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
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>{t('edit_booking_title')}</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="form-grid">
            {/* Add a dropdown for driver selection */}
            <div>
              <label>{t('assign_driver_label')}</label>
              <select name="driverId" value={updatedBooking.driverId || ''} onChange={handleChange}>
                <option value="">{t('no_driver_option')}</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>{driver.name}</option>
                ))}
              </select>
            </div>

            {Object.keys(booking).map(key => {
              if (['id', 'receivedAt', 'driver', 'driverId'].includes(key)) return null;
              const label = t(`${key}_label`);
              const type = typeof booking[key as keyof Booking];
              let inputType = 'text';
              if (type === 'boolean') inputType = 'checkbox';
              if (type === 'number') inputType = 'number';

              return (
                <div key={key}>
                  <label>{label}</label>
                  {inputType === 'checkbox' ? (
                    <input
                      type="checkbox"
                      name={key}
                      checked={updatedBooking[key as keyof Booking] as boolean}
                      onChange={handleChange}
                    />
                  ) : (
                    <input
                      type={inputType}
                      name={key}
                      value={updatedBooking[key as keyof Booking] as string || ''}
                      onChange={handleChange}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="modal-actions">
            <button type="submit">{t('save_changes_btn')}</button>
            <button type="button" onClick={onClose}>{t('cancel_btn')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBookingModal;
