import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createBooking } from '../api';
import { Booking } from '../types';
import './BookingForm.css';
import axios from 'axios';

const BookingForm: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState<Partial<Booking>>({
    hasMinors: false,
    needsBabySeat: false,
    needsBooster: false,
  });
  const [showReturn, setShowReturn] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    let finalValue: string | number | boolean = value;
    if (type === 'checkbox') {
      finalValue = checked;
    } else if (name === 'people') {
      finalValue = Number(value);
    } else if (value === 'true' || value === 'false') {
      finalValue = value === 'true';
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    try {
      const dataToSend = {
        ...formData,
        lang: i18n.language,
      };
      await createBooking(dataToSend as Booking);
      setStatusMessage({ type: 'success', message: t('booking_success_message') });
      setFormData({}); // Clear form
      setShowReturn(false);
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
            setStatusMessage({ type: 'error', message: error.response.data.message });
        } else {
            setStatusMessage({ type: 'error', message: t('booking_error_message') });
        }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      <h2>{t('customer_info')}</h2>
      <div className="form-group">
        <label>{t('name_label')}</label>
        <input type="text" name="name" value={formData.name || ''} placeholder={t('name_placeholder')} onChange={handleChange} required />
        <small>{t('name_clarification')}</small>
      </div>
      <div className="form-group">
        <label>{t('phone_label')}</label>
        <input type="tel" name="phone" value={formData.phone || ''} placeholder={t('phone_placeholder')} onChange={handleChange} required />
        <small>{t('phone_clarification')}</small>
      </div>
      <div className="form-group">
        <label>{t('email_label')}</label>
        <input type="email" name="email" value={formData.email || ''} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>{t('people_label')}</label>
        <input type="number" name="people" value={formData.people || ''} onChange={handleChange} min="1" required />
      </div>

      {/* New: Minors Info */}
      <div className="form-group">
        <label>{t('has_minors_label')}</label>
        <div className="radio-group">
          <label>
            <input type="radio" name="hasMinors" value="true" checked={formData.hasMinors === true} onChange={handleChange} />
            {t('yes_label')}
          </label>
          <label>
            <input type="radio" name="hasMinors" value="false" checked={formData.hasMinors === false} onChange={handleChange} />
            {t('no_label')}
          </label>
        </div>
      </div>
      {formData.hasMinors && (
        <div className="form-group">
          <label>{t('minors_age_label')}</label>
          <input type="text" name="minorsAge" value={formData.minorsAge || ''} placeholder={t('minors_age_placeholder')} onChange={handleChange} />
        </div>
      )}
      <div className="form-group">
        <label>{t('needs_baby_seat_label')}</label>
        <div className="radio-group">
          <label>
            <input type="radio" name="needsBabySeat" value="true" checked={formData.needsBabySeat === true} onChange={handleChange} />
            {t('yes_label')}
          </label>
          <label>
            <input type="radio" name="needsBabySeat" value="false" checked={formData.needsBabySeat === false} onChange={handleChange} />
            {t('no_label')}
          </label>
        </div>
      </div>
      <div className="form-group">
        <label>{t('needs_booster_label')}</label>
        <div className="radio-group">
          <label>
            <input type="radio" name="needsBooster" value="true" checked={formData.needsBooster === true} onChange={handleChange} />
            {t('yes_label')}
          </label>
          <label>
            <input type="radio" name="needsBooster" value="false" checked={formData.needsBooster === false} onChange={handleChange} />
            {t('no_label')}
          </label>
        </div>
      </div>
      <div className="form-group">
        <label>{t('luggage_type_label')}</label>
        <input type="text" name="luggageType" value={formData.luggageType || ''} placeholder={t('luggage_type_placeholder')} onChange={handleChange} required />
      </div>

      <h2>{t('arrival_info')}</h2>
      <div className="form-group">
        <label>{t('arrival_date_label')}</label>
        <input type="date" name="arrival_date" value={formData.arrival_date || ''} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>{t('arrival_time_label')}</label>
        <input type="time" name="arrival_time" value={formData.arrival_time || ''} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>{t('arrival_flight_label')}</label>
        <input type="text" name="arrival_flight_number" value={formData.arrival_flight_number || ''} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>{t('destination_label')}</label>
        <input type="text" name="destination" value={formData.destination || ''} onChange={handleChange} required />
      </div>

      <h2>{t('return_trip_info')}</h2>
      <div className="form-group">
        <label className="checkbox-label">
          <input type="checkbox" checked={showReturn} onChange={() => setShowReturn(!showReturn)} />
          {t('book_return_trip_label')}
        </label>
      </div>
      {showReturn && (
        <>
          <div className="form-group">
            <label>{t('return_date_label')}</label>
            <input type="date" name="return_date" value={formData.return_date || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>{t('return_time_label')}</label>
            <input type="time" name="return_time" value={formData.return_time || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>{t('return_flight_time_label')}</label>
            <input type="time" name="return_flight_time" value={formData.return_flight_time || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>{t('return_pickup_label')}</label>
            <input type="text" name="return_pickup_address" value={formData.return_pickup_address || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>{t('return_flight_label')}</label>
            <input type="text" name="return_flight_number" value={formData.return_flight_number || ''} onChange={handleChange} />
          </div>
        </>
      )}

      <h2>{t('additional_info')}</h2>
      <textarea name="additional_info" value={formData.additional_info || ''} placeholder={t('additional_info_placeholder')} onChange={handleChange}></textarea>

      {/* New: Modification Info */}
      <h2>{t('modification_info')}</h2>
      <div className="form-group">
        <label className="checkbox-label">
          <input type="checkbox" name="isModification" checked={formData.isModification || false} onChange={handleChange} />
          {t('is_modification_label')}
        </label>
      </div>
      {formData.isModification && (
        <div className="form-group">
          <label>{t('original_booking_id_label')}</label>
          <input type="text" name="originalBookingId" value={formData.originalBookingId || ''} placeholder={t('original_booking_id_placeholder')} onChange={handleChange} />
        </div>
      )}

      <div className="submit-container">
        <button type="submit" className="submit-btn">{t('submit_button')}</button>
        {statusMessage && 
          <div className={`status-message ${statusMessage.type}`}>
            {statusMessage.message}
          </div>
        }
      </div>
    </form>
  );
};

export default BookingForm;