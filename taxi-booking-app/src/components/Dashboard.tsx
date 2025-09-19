import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer 
} from 'recharts'; // Removed Tooltip, Legend
import { getDashboardBookingsByDay, getDashboardPopularDestinations } from '../api';
import { BookingsByPeriod } from '../types'; // Import BookingsByPeriod type
import styles from './ChartsPage.module.css'; // Import CSS Modules

// Recharts expects data in the format { name: string, value: number } for simple charts
interface RechartsDataItem {
  name: string;
  value: number;
}

// Data structure for popular destinations from backend
interface PopularDestinationData {
  destination: string;
  count: number;
}

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [bookingsByDay, setBookingsByDay] = useState<RechartsDataItem[]>([]);
  const [popularDestinations, setPopularDestinations] = useState<RechartsDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [byDayResult, popularResult] = await Promise.all([
          getDashboardBookingsByDay('day'), // Requesting 'day' period for simplicity
          getDashboardPopularDestinations(5),
        ]);

        console.log("API Result - byDayResult:", byDayResult); // Debug log
        console.log("API Result - popularResult:", popularResult); // Debug log

        // Transform bookingsByDay data for Recharts (sum oneWay and roundTrip)
        const transformedBookingsByDay: RechartsDataItem[] = byDayResult.map((item: BookingsByPeriod) => ({
          name: item.period,
          value: item.oneWay + item.roundTrip,
        }));
        setBookingsByDay(transformedBookingsByDay);
        console.log("Transformed - bookingsByDay:", transformedBookingsByDay); // Debug log

        // Transform popularDestinations data for Recharts
        const transformedPopularDestinations: RechartsDataItem[] = popularResult.map((item: PopularDestinationData) => ({
          name: item.destination,
          value: item.count,
        }));
        setPopularDestinations(transformedPopularDestinations);
        console.log("Transformed - popularDestinations:", transformedPopularDestinations); // Debug log

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(t('error_fetching_data'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]); // Dependency on 't' for translation updates

  if (loading) {
    return <p>{t('loading_data')}...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className={styles.dashboardChartsContainer}>
      <div className={styles.dashboardChartItem}>
        <h3>{t('dashboard_bookings_last_7_days')}</h3>
        {bookingsByDay.length > 0 && ( // Conditional rendering
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={bookingsByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              {/* <Tooltip /> */} {/* Removed */}
              {/* <Legend /> */} {/* Removed */}
              <Line type="monotone" dataKey="value" stroke="#8884d8" name={t('bookings_count')} />
            </LineChart>
          </ResponsiveContainer>
        )}
        {bookingsByDay.length === 0 && !loading && !error && <p>{t('no_data_available')}</p>} {/* Added no data message */}
      </div>
      <div className={styles.dashboardChartItem}>
        <h3>{t('dashboard_top_5_destinations')}</h3>
        {popularDestinations.length > 0 && ( // Conditional rendering
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={popularDestinations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              {/* <Tooltip /> */} {/* Removed */}
              {/* <Legend /> */} {/* Removed */}
              <Bar dataKey="value" fill="#82ca9d" name={t('bookings_count')} />
            </BarChart>
          </ResponsiveContainer>
        )}
        {popularDestinations.length === 0 && !loading && !error && <p>{t('no_data_available')}</p>} {/* Added no data message */}
      </div>
    </div>
  );
};

export default Dashboard;
