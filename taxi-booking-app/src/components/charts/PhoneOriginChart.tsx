import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartData } from '../../types';

interface Props {
  data: ChartData[];
  className?: string;
}

const PhoneOriginChart: React.FC<Props> = ({ data, className }) => {
  const { t } = useTranslation();

  return (
    <div className={className}>
      <h2>{t('phone_origin_distribution_chart_title')}</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" name={t('bookings_count')} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PhoneOriginChart;