import { useFormContext, Controller } from 'react-hook-form';
import { TextField, Box, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { useTranslation } from 'react-i18next';

const TripDetailsStep = () => {
  const { control } = useFormContext();
  const { t } = useTranslation();

  return (
    <Box component="section" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        {t('arrival_info')}
      </Typography>

      {/* 2-column layout for date and time */}
      <Box sx={{ display: { sm: 'flex' }, gap: 2 }}>
        <Box sx={{ flex: 1, mb: { xs: 2, sm: 0 } }}>
          <Controller
            name="arrival_date"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <DatePicker
                {...field}
                label={t('arrival_date_label')}
                enableAccessibleFieldDOMStructure={false}
                sx={{ width: '100%' }}
                slotProps={{
                  textField: {
                    variant: 'filled',
                    required: true,
                    error: !!error,
                    helperText: error?.message,
                  },
                }}
              />
            )}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Controller
            name="arrival_time"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TimePicker
                {...field}
                label={t('arrival_time_label')}
                enableAccessibleFieldDOMStructure={false}
                sx={{ width: '100%' }}
                slotProps={{
                  textField: {
                    variant: 'filled',
                    required: true,
                    error: !!error,
                    helperText: error?.message,
                  },
                }}
              />
            )}
          />
        </Box>
      </Box>

      <Controller
        name="arrival_flight_number"
        control={control}
        render={({ field }) => (
          <TextField 
            {...field} 
            label={t('arrival_flight_label')} 
            fullWidth 
            variant="filled"
          />
        )}
      />

      <Controller
        name="destination"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <TextField 
            {...field} 
            label={t('destination_label')} 
            fullWidth 
            required 
            variant="filled"
            error={!!error}
            helperText={error?.message}
          />
        )}
      />
    </Box>
  );
};

export default TripDetailsStep;