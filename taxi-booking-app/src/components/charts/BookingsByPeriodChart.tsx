import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BookingsByPeriod } from '../../types'; // Changed import

interface Props {
  data: BookingsByPeriod[]; // Changed type
  className?: string;
}

const BookingsByPeriodChart: React.FC<Props> = ({ data, className }) => {
  const { t } = useTranslation();

  return (
    <div className={className}>
      <h2>{t('bookings_by_period_chart_title')}</h2>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" /> {/* Changed dataKey */}
          <YAxis />
          <Tooltip />
          <Legend />
          {/* Two <Bar> components for a grouped chart */}
          <Bar dataKey="oneWay" fill="#8884d8" name={t('one_way_trips')} />
          <Bar dataKey="roundTrip" fill="#82ca9d" name={t('round_trips')} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BookingsByPeriodChart;
