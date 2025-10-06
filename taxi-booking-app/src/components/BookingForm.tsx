import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { createBooking } from '../api';
import { Booking } from '../types';
import './BookingForm.css';
import { FaUser, FaPhone, FaEnvelope, FaUsers, FaChild, FaCar, FaPlaneDeparture, FaPlaneArrival, FaCalendarAlt, FaClock, FaInfoCircle, FaLuggageCart } from 'react-icons/fa';

type BookingFormData = Omit<Booking, 'id' | 'status' | 'receivedAt' | 'driver' | 'driverId'>;

const BookingForm: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'success' | 'error' | null>(null);
  const [isReturnTrip, setIsReturnTrip] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue, trigger } = useForm<BookingFormData>({
    defaultValues: { lang: i18n.language },
    mode: 'onChange',
  });

  const hasMinors = watch("hasMinors");

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    setSubmissionStatus(null);
    try {
      await createBooking(data);
      setSubmissionStatus('success');
    } catch (error: unknown) {
      setSubmissionStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = async () => {
    const fieldsToValidate: (keyof BookingFormData)[] = [
      'arrival_date', 'arrival_time', 'destination', 'people'
    ];
    if (isReturnTrip) {
      fieldsToValidate.push('return_date', 'return_time');
    }
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  return (
    <div className="booking-form-container">
      <div className="form-steps">
        <div className={`step ${step === 1 ? 'active' : ''}`}>
          <div className="step-icon">1</div>
          <div className="step-label">{t('step1_title')}</div>
        </div>
        <div className={`step ${step === 2 ? 'active' : ''}`}>
          <div className="step-icon">2</div>
          <div className="step-label">{t('step2_title')}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="booking-form">
        {step === 1 && (
          <div className="form-step-content">
            <h3 className="form-section-title">{t('step1_title')}</h3>

            {/* Arrival Section */}
            <div className="form-section">
              <h4><FaPlaneArrival /> {t('arrival_info_title')}</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="arrival_date"><FaCalendarAlt /> {t('arrival_date_label')}</label>
                  <input type="date" id="arrival_date" {...register('arrival_date', { required: t('arrival_date_error_required') })} />
                  {errors.arrival_date && <p className="error-message">{errors.arrival_date.message}</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="arrival_time"><FaClock /> {t('arrival_time_label')}</label>
                  <input type="time" id="arrival_time" {...register('arrival_time', { required: t('arrival_time_error_required') })} />
                  {errors.arrival_time && <p className="error-message">{errors.arrival_time.message}</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="arrival_flight_number">{t('arrival_flight_number_label')}</label>
                  <input id="arrival_flight_number" {...register('arrival_flight_number')} placeholder={t('optional_placeholder')} />
                </div>
                <div className="form-group">
                  <label htmlFor="destination">{t('destination_label')}</label>
                  <input id="destination" {...register('destination', { required: t('destination_error_required') })} />
                  {errors.destination && <p className="error-message">{errors.destination.message}</p>}
                </div>
              </div>
            </div>

            {/* Return Trip Section */}
            <div className="form-section">
              <div className="form-group-checkbox standalone">
                <input
                  type="checkbox"
                  id="returnTrip"
                  checked={isReturnTrip}
                  onChange={(e) => setIsReturnTrip(e.target.checked)}
                />
                <label htmlFor="returnTrip">{t('return_trip_label')}</label>
              </div>

              {isReturnTrip && (
                <>
                  <h4><FaPlaneDeparture /> {t('return_info_title')}</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="return_date"><FaCalendarAlt /> {t('return_date_label')}</label>
                      <input type="date" id="return_date" {...register('return_date', { required: isReturnTrip ? t('return_date_error_required') : false })} />
                      {errors.return_date && <p className="error-message">{errors.return_date.message}</p>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="return_time"><FaClock /> {t('return_time_label')}</label>
                      <input type="time" id="return_time" {...register('return_time', { required: isReturnTrip ? t('return_time_error_required') : false })} />
                      {errors.return_time && <p className="error-message">{errors.return_time.message}</p>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="return_flight_time">{t('return_flight_time_label')}</label>
                      <input type="time" id="return_flight_time" {...register('return_flight_time')} placeholder={t('optional_placeholder')} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="return_pickup_address">{t('return_pickup_address_label')}</label>
                      <input id="return_pickup_address" {...register('return_pickup_address')} />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="form-navigation">
              <button type="button" className="button-primary" onClick={handleNextStep}>{t('next_button')}</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="form-step-content">
            <h3 className="form-section-title">{t('step2_title')}</h3>

            {/* Contact and Passenger Info */}
            <div className="form-section">
               <h4><FaUser /> {t('personal_info_title')}</h4>
               <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name"><FaUser /> {t('name_label')}</label>
                  <input id="name" {...register('name', { required: t('name_error_required') })} />
                  {errors.name && <p className="error-message">{errors.name.message}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone"><FaPhone /> {t('phone_label')}</label>
                  <input id="phone" type="tel" {...register('phone', { required: t('phone_error_required') })} />
                  {errors.phone && <p className="error-message">{errors.phone.message}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="email"><FaEnvelope /> {t('email_label')}</label>
                  <input id="email" type="email" {...register('email')} placeholder={t('optional_placeholder')} />
                </div>

                <div className="form-group">
                  <label htmlFor="people"><FaUsers /> {t('people_label')}</label>
                  <input type="number" id="people" {...register('people', { required: t('people_error_required'), min: 1 })} min="1" />
                  {errors.people && <p className="error-message">{errors.people.message}</p>}
                </div>
              </div>
            </div>

            {/* Extras Section */}
            <div className="form-section">
              <h4><FaChild /> {t('extras_title')}</h4>
              <div className="form-group-checkbox">
                <input type="checkbox" id="hasMinors" {...register('hasMinors')} />
                <label htmlFor="hasMinors">{t('has_minors_label')}</label>
              </div>

              {hasMinors && (
                <div className="form-group indented">
                  <label htmlFor="minorsAge">{t('minors_age_label')}</label>
                  <input id="minorsAge" {...register('minorsAge')} />
                </div>
              )}

              <div className="form-group-checkbox">
                <input type="checkbox" id="needsBabySeat" {...register('needsBabySeat')} />
                <label htmlFor="needsBabySeat">{t('needs_baby_seat_label')}</label>
              </div>

              <div className="form-group-checkbox">
                <input type="checkbox" id="needsBooster" {...register('needsBooster')} />
                <label htmlFor="needsBooster">{t('needs_booster_label')}</label>
              </div>

              <div className="form-group">
                <label htmlFor="luggageType"><FaLuggageCart /> {t('luggage_type_label')}</label>
                <input id="luggageType" {...register('luggageType')} placeholder={t('luggage_type_placeholder')} />
              </div>
            </div>

            {/* Additional Info */}
            <div className="form-section">
              <h4><FaInfoCircle /> {t('additional_info_title')}</h4>
              <div className="form-group">
                <textarea id="additional_info" {...register('additional_info')} rows={4} placeholder={t('additional_info_placeholder')} />
              </div>
            </div>

            <div className="form-navigation">
              <button type="button" className="button-secondary" onClick={handlePrevStep}>{t('back_button')}</button>
              <button type="submit" className="button-primary" disabled={isSubmitting}>
                {isSubmitting ? t('submitting_button') : t('submit_button')}
              </button>
            </div>
          </div>
        )}

        {submissionStatus === 'success' && (
          <div className="submission-message success">
            <p>{t('booking_success_message')}</p>
            <p>{t('booking_success_advice')}</p>
          </div>
        )}
        {submissionStatus === 'error' && (
          <div className="submission-message error">
            <p>{t('booking_error_message')}</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default BookingForm;
