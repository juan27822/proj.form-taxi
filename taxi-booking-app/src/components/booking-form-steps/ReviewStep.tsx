
import { useFormContext } from 'react-hook-form';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const ReviewStep = () => {
  const { watch } = useFormContext();
  const { t } = useTranslation();
  const values = watch();

  return (
    <Box>
      <Typography variant="h6" sx={{ mt: 4 }}>{t('summary')}</Typography>
      <Box sx={{ mt: 2, p: 2, border: '1px solid grey', borderRadius: 1 }}>
        <Typography><strong>{t('name_label')}:</strong> {values.name}</Typography>
        <Typography><strong>{t('phone_label')}:</strong> {values.phone}</Typography>
        <Typography><strong>{t('email_label')}:</strong> {values.email}</Typography>
        <Typography><strong>{t('people_label')}:</strong> {values.people}</Typography>
        <Typography><strong>{t('arrival_date_label')}:</strong> {values.arrival_date?.format('YYYY-MM-DD')}</Typography>
        <Typography><strong>{t('arrival_time_label')}:</strong> {values.arrival_time?.format('HH:mm')}</Typography>
        <Typography><strong>{t('destination_label')}:</strong> {values.destination}</Typography>
        {values.return_date && <Typography><strong>{t('return_date_label')}:</strong> {values.return_date?.format('YYYY-MM-DD')}</Typography>}
        {values.return_time && <Typography><strong>{t('return_time_label')}:</strong> {values.return_time?.format('HH:mm')}</Typography>}
      </Box>
    </Box>
  );
};

export default ReviewStep;