import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useChartStore } from '../store/chartStore';
import Dashboard from './Dashboard';
import PhoneOriginChart from './charts/PhoneOriginChart';
import RoundtripOnewayChart from './charts/RoundtripOnewayChart';
import BookingsByPeriodChart from './charts/BookingsByPeriodChart';
import BookingsByHourChart from './charts/BookingsByHourChart'; // New import
import styles from './ChartsPage.module.css';

const ChartsPage: React.FC = () => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');

  const {
    phoneOriginData,
    roundtripOnewayData,
    bookingsByPeriodData,
    bookingsByHourData, // New data from store
    loading,
    error,
    fetchChartData,
  } = useChartStore();

  useEffect(() => {
    fetchChartData(period);
  }, [period, fetchChartData]);

  if (loading) {
    return <div className={styles.chartsPage}><h1>{t('charts_title')}</h1><p>{t('loading')}...</p></div>;
  }

  if (error) {
    return <div className={styles.chartsPage}><h1>{t('charts_title')}</h1><p>{t('error_fetching_data')}: {error}</p></div>;
  }

  return (
    <div className={styles.chartsPage}>
      <h1>{t('charts_title')}</h1>

      <div className={styles.allChartsContainer}>
        <PhoneOriginChart data={phoneOriginData} className={styles.chartSection} />
        <RoundtripOnewayChart data={roundtripOnewayData.map(item => ({ name: item.type, value: item.count }))} className={styles.chartSection} />
        <BookingsByPeriodChart 
          data={bookingsByPeriodData} 
          period={period} 
          setPeriod={setPeriod} 
          className={styles.chartSection} 
        />
        <BookingsByHourChart data={bookingsByHourData} className={styles.chartSection} /> {/* New chart */}
      </div>

      <div>
        <Dashboard />
      </div>
    </div>
  );
};

export default ChartsPage;