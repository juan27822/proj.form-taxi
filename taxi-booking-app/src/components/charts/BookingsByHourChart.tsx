import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BookingsByHour } from '../../types';

interface Props {
  data: BookingsByHour[];
  className?: string;
}

const BookingsByHourChart: React.FC<Props> = ({ data, className }) => {
  const { t } = useTranslation();

  return (
    <div className={className}>
      <h2>{t('bookings_by_hour_chart_title')}</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" name={t('bookings_count')} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BookingsByHourChart;
