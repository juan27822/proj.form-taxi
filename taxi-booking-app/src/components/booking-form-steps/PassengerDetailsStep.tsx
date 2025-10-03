
import { useFormContext, Controller } from 'react-hook-form';
import { TextField, Box, Typography, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { useTranslation } from 'react-i18next';

const PassengerDetailsStep = () => {
  const { control, formState: { errors }, watch } = useFormContext();
  const { t } = useTranslation();

  const hasMinors = watch("hasMinors");

  return (
    <Box>
      <Typography variant="h5" gutterBottom>{t('customer_info')}</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr' }, gap: 2 }}>
        <Controller name="name" control={control} render={({ field }) => <TextField {...field} label={t('name_label')} fullWidth error={!!errors.name} helperText={errors.name?.message as string} required />} />
        <Controller name="phone" control={control} render={({ field }) => <TextField {...field} label={t('phone_label')} fullWidth error={!!errors.phone} helperText={errors.phone?.message as string} required />} />
        <Controller name="email" control={control} render={({ field }) => <TextField {...field} label={t('email_label')} fullWidth error={!!errors.email} helperText={errors.email?.message as string} />} />
        <Controller name="people" control={control} render={({ field }) => <TextField {...field} label={t('people_label')} type="number" fullWidth error={!!errors.people} helperText={errors.people?.message as string} required onChange={e => field.onChange(parseInt(e.target.value, 10))}/>} />
      </Box>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>{t('passenger_needs')}</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr' }, gap: 2 }}>
        <FormControl component="fieldset">
          <FormLabel component="legend">{t('has_minors_label')}</FormLabel>
          <Controller name="hasMinors" control={control} render={({ field }) => (
            <RadioGroup {...field} row onChange={(e) => field.onChange(e.target.value === 'true')}>
              <FormControlLabel value="true" control={<Radio />} label={t('yes_label')} />
              <FormControlLabel value="false" control={<Radio />} label={t('no_label')} />
            </RadioGroup>
          )} />
        </FormControl>
        {hasMinors && <Controller name="minorsAge" control={control} render={({ field }) => <TextField {...field} label={t('minors_age_label')} fullWidth />} />}
        <FormControl component="fieldset">
          <FormLabel component="legend">{t('needs_baby_seat_label')}</FormLabel>
          <Controller name="needsBabySeat" control={control} render={({ field }) => (
            <RadioGroup {...field} row onChange={(e) => field.onChange(e.target.value === 'true')}>
              <FormControlLabel value="true" control={<Radio />} label={t('yes_label')} />
              <FormControlLabel value="false" control={<Radio />} label={t('no_label')} />
            </RadioGroup>
          )} />
        </FormControl>
        <FormControl component="fieldset">
          <FormLabel component="legend">{t('needs_booster_label')}</FormLabel>
          <Controller name="needsBooster" control={control} render={({ field }) => (
            <RadioGroup {...field} row onChange={(e) => field.onChange(e.target.value === 'true')}>
              <FormControlLabel value="true" control={<Radio />} label={t('yes_label')} />
              <FormControlLabel value="false" control={<Radio />} label={t('no_label')} />
            </RadioGroup>
          )} />
        </FormControl>
      </Box>
      <Controller name="luggageType" control={control} render={({ field }) => <TextField {...field} label={t('luggage_type_label')} fullWidth error={!!errors.luggageType} helperText={errors.luggageType?.message as string} required sx={{ mt: 2 }} />} />
    </Box>
  );
};

export default PassengerDetailsStep;
