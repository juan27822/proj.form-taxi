import { useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Box, Typography, Checkbox, FormControlLabel, FormGroup, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

const ReturnTripStep = () => {
  const { control, watch } = useFormContext();
  const { t } = useTranslation();
  const [showReturn, setShowReturn] = useState(false);

  const isModification = watch("isModification");

  return (
    <Box>
        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>{t('return_trip_info')}</Typography>
        <FormGroup>
          <FormControlLabel control={<Checkbox checked={showReturn} onChange={() => setShowReturn(!showReturn)} />} label={t('book_return_trip_label')} />
        </FormGroup>
        {showReturn && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr' }, gap: 2, mt: 2 }}>
            <Controller name="return_date" control={control} render={({ field }) => <DatePicker {...field} label={t('return_date_label')} enableAccessibleFieldDOMStructure={false} slots={{ textField: TextField }} slotProps={{ textField: { fullWidth: true } }} />} />
            <Controller name="return_time" control={control} render={({ field }) => <TimePicker {...field} label={t('return_time_label')} enableAccessibleFieldDOMStructure={false} slots={{ textField: TextField }} slotProps={{ textField: { fullWidth: true } }} />} />
            <Controller name="return_flight_time" control={control} render={({ field }) => <TextField {...field} label={t('return_flight_time_label')} fullWidth />} />
            <Controller name="return_pickup_address" control={control} render={({ field }) => <TextField {...field} label={t('return_pickup_label')} fullWidth />} />
            <Controller name="return_flight_number" control={control} render={({ field }) => <TextField {...field} label={t('return_flight_label')} fullWidth />} />
          </Box>
        )}

        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>{t('additional_info')}</Typography>
        <Controller name="additional_info" control={control} render={({ field }) => <TextField {...field} label={t('additional_info_placeholder')} multiline rows={4} fullWidth />} />

        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>{t('modification_info')}</Typography>
        <FormGroup>
          <FormControlLabel control={<Controller name="isModification" control={control} render={({ field }) => <Checkbox {...field} checked={field.value} />} />} label={t('is_modification_label')} />
        </FormGroup>
        {isModification && <Controller name="originalBookingId" control={control} render={({ field }) => <TextField {...field} label={t('original_booking_id_placeholder')} fullWidth sx={{ mt: 2 }} />} />}
    </Box>
  );
};

export default ReturnTripStep;
