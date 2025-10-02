import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createBooking } from '../api';
import { useTheme, useMediaQuery, Button, CircularProgress, Alert, Box, Stepper, Step, StepLabel } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import TripDetailsStep from './booking-form-steps/TripDetailsStep';
import PassengerDetailsStep from './booking-form-steps/PassengerDetailsStep';
import ReturnTripStep from './booking-form-steps/ReturnTripStep';
import ReviewStep from './booking-form-steps/ReviewStep';

const steps = ['trip_details', 'passenger_details', 'return_trip', 'review_and_submit'];
const FORM_DATA_KEY = 'bookingFormData';

const BookingForm: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const bookingSchema = z.object({
    name: z.string().min(1, t('validation_name_required')),
    phone: z.string().min(1, t('validation_phone_required')),
    email: z.string().email(t('validation_email_invalid')).optional().or(z.literal('')),
    people: z.number().min(1, t('validation_people_min')),
    hasMinors: z.boolean(),
    minorsAge: z.string().optional(),
    needsBabySeat: z.boolean(),
    needsBooster: z.boolean(),
    luggageType: z.string().min(1, t('validation_luggage_required')),
    arrival_date: z.any().refine(val => val, { message: t('validation_arrival_date_required') }),
    arrival_time: z.any().refine(val => val, { message: t('validation_arrival_time_required') }),
    arrival_flight_number: z.string().optional(),
    destination: z.string().min(1, t('validation_destination_required')),
    return_date: z.any().optional(),
    return_time: z.any().optional(),
    return_flight_time: z.string().optional(),
    return_pickup_address: z.string().optional(),
    return_flight_number: z.string().optional(),
    additional_info: z.string().optional(),
    isModification: z.boolean(),
    originalBookingId: z.string().optional(),
  });

  type BookingFormData = z.infer<typeof bookingSchema>;

  const savedData = localStorage.getItem(FORM_DATA_KEY);
  const defaultValues = savedData ? JSON.parse(savedData, (key, value) => {
    if ([ 'arrival_date', 'arrival_time', 'return_date', 'return_time'].includes(key) && value) {
      return dayjs(value);
    }
    return value;
  }) : {
    name: '',
    phone: '',
    email: '',
    people: 1,
    hasMinors: false,
    minorsAge: '',
    needsBabySeat: false,
    needsBooster: false,
    luggageType: '',
    arrival_date: null,
    arrival_time: null,
    arrival_flight_number: '',
    destination: '',
    return_date: null,
    return_time: null,
    return_flight_time: '',
    return_pickup_address: '',
    return_flight_number: '',
    additional_info: '',
    isModification: false,
    originalBookingId: '',
  };

  const methods = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues,
    mode: 'onChange'
  });

  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const watchedData = methods.watch();
  useEffect(() => {
    localStorage.setItem(FORM_DATA_KEY, JSON.stringify(watchedData));
  }, [watchedData]);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const handleNext = async () => {
    const fieldsByStep: (keyof BookingFormData)[][] = [
        ['arrival_date', 'arrival_time', 'destination'], 
        ['name', 'phone', 'email', 'people', 'luggageType'],
        [] // No validation for optional return trip step
    ];
    const isValid = activeStep >= fieldsByStep.length ? true : await methods.trigger(fieldsByStep[activeStep]);
    if (isValid) {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const onSubmit = async (data: BookingFormData) => {
    setStatusMessage(null);
    try {
      const dataToSend = {
        ...data,
        email: data.email || null,
        minorsAge: data.minorsAge || null,
        arrival_flight_number: data.arrival_flight_number || null,
        return_flight_time: data.return_flight_time || null,
        return_pickup_address: data.return_pickup_address || null,
        return_flight_number: data.return_flight_number || null,
        additional_info: data.additional_info || null,
        originalBookingId: data.originalBookingId || null,
        arrival_date: dayjs(data.arrival_date).format('YYYY-MM-DD'),
        arrival_time: dayjs(data.arrival_time).format('HH:mm'),
        return_date: data.return_date ? dayjs(data.return_date).format('YYYY-MM-DD') : null,
        return_time: data.return_time ? dayjs(data.return_time).format('HH:mm') : null,
        lang: i18n.language,
      };
      await createBooking(dataToSend);
      setStatusMessage({ type: 'success', message: t('booking_success_message') });
      methods.reset();
      localStorage.removeItem(FORM_DATA_KEY);
      setActiveStep(0);
    } catch (error: unknown) {
      setStatusMessage({ type: 'error', message: t('booking_error_message') });
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <TripDetailsStep />;
      case 1:
        return <PassengerDetailsStep />;
      case 2:
        return <ReturnTripStep />;
      case 3:
        return <ReviewStep />;
      default:
        return 'Unknown step';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormProvider {...methods}>
        <Box component="form" onSubmit={methods.handleSubmit(onSubmit)} sx={{ mt: 3 }}>
          <Stepper activeStep={activeStep} orientation={isMobile ? 'vertical' : 'horizontal'} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{t(label)}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {getStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            {activeStep !== 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                {t('back_button')}
              </Button>
            )}

            {activeStep === steps.length - 1 ? (
              <Button type="submit" variant="contained" color="primary" disabled={methods.formState.isSubmitting}>
                {methods.formState.isSubmitting ? <CircularProgress size={24} /> : t('submit_button')}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                {t('next_button')}
              </Button>
            )}
          </Box>

          {statusMessage && <Alert severity={statusMessage.type} sx={{ mt: 2 }}>{statusMessage.message}</Alert>}
        </Box>
      </FormProvider>
    </LocalizationProvider>
  );
};

export default BookingForm;
