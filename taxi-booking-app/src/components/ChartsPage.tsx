import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useChartStore } from '../store/chartStore';
import Dashboard from './Dashboard';
import PhoneOriginChart from './charts/PhoneOriginChart';
import RoundtripOnewayChart from './charts/RoundtripOnewayChart';
import BookingsByPeriodChart from './charts/BookingsByPeriodChart';
import BookingsByHourChart from './charts/BookingsByHourChart';

const containerStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '20px',
  width: '90%',
  margin: '20px auto',
};

const itemStyle: React.CSSProperties = {
  width: '100%',
  padding: '15px',
  border: '1px solid #ccc',
  borderRadius: '8px',
  boxSizing: 'border-box',
};

const ChartsPage: React.FC = () => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');

  const {
    phoneOriginData,
    roundtripOnewayData,
    bookingsByPeriodData,
    bookingsByHourData,
    loading,
    error,
    fetchChartData,
  } = useChartStore();

  useEffect(() => {
    fetchChartData(period);
  }, [period, fetchChartData]);

  if (loading) {
    return <div style={{ padding: '20px' }}><h1>{t('charts_title')}</h1><p>{t('loading')}...</p></div>;
  }

  if (error) {
    return <div style={{ padding: '20px' }}><h1>{t('charts_title')}</h1><p>{t('error_fetching_data')}: {error}</p></div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>{t('charts_title')}</h1>

      <div style={containerStyle}>
        <div style={itemStyle}><PhoneOriginChart data={phoneOriginData} /></div>
        <div style={itemStyle}><RoundtripOnewayChart data={roundtripOnewayData.map(item => ({ name: item.type, value: item.count }))} /></div>
        <div style={itemStyle}><BookingsByPeriodChart 
          data={bookingsByPeriodData} 
          period={period} 
          setPeriod={setPeriod} 
        /></div>
        <div style={itemStyle}><BookingsByHourChart data={bookingsByHourData} /></div>
      </div>

      <div>
        <Dashboard />
      </div>
    </div>
  );
};

export default ChartsPage;