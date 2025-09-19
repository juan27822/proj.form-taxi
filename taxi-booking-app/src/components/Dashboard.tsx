import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer 
} from 'recharts';
import { getDashboardBookingsByDay, getDashboardPopularDestinations } from '../api';
import { BookingsByPeriod } from '../types';

const dashboardContainerStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '20px',
  width: '90%',
  margin: '20px auto',
};

const dashboardItemStyle: React.CSSProperties = {
  width: '100%',
  padding: '15px',
  border: '1px solid #ccc',
  borderRadius: '8px',
  boxSizing: 'border-box',
};


const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [bookingsByDay, setBookingsByDay] = useState<any[]>([]);
  const [popularDestinations, setPopularDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [byDayResult, popularResult] = await Promise.all([
          getDashboardBookingsByDay('day'),
          getDashboardPopularDestinations(5),
        ]);

        const transformedBookingsByDay = byDayResult.map((item: BookingsByPeriod) => ({
          name: item.period,
          value: item.oneWay + item.roundTrip,
        }));
        setBookingsByDay(transformedBookingsByDay);

        const transformedPopularDestinations = popularResult.map((item: any) => ({
          name: item.destination,
          value: item.count,
        }));
        setPopularDestinations(transformedPopularDestinations);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(t('error_fetching_data'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

  if (loading) {
    return <p>{t('loading_data')}...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div style={dashboardContainerStyle}>
      <div style={dashboardItemStyle}>
        <h3>{t('dashboard_bookings_last_7_days')}</h3>
        {bookingsByDay.length > 0 && (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={bookingsByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Line type="monotone" dataKey="value" stroke="#8884d8" name={t('bookings_count')} />
            </LineChart>
          </ResponsiveContainer>
        )}
        {bookingsByDay.length === 0 && !loading && !error && <p>{t('no_data_available')}</p>}
      </div>
      <div style={dashboardItemStyle}>
        <h3>{t('dashboard_top_5_destinations')}</h3>
        {popularDestinations.length > 0 && (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={popularDestinations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Bar dataKey="value" fill="#82ca9d" name={t('bookings_count')} />
            </BarChart>
          </ResponsiveContainer>
        )}
        {popularDestinations.length === 0 && !loading && !error && <p>{t('no_data_available')}</p>}
      </div>
    </div>
  );
};

export default Dashboard;