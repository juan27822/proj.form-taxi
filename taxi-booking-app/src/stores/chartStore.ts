import { create } from 'zustand';
import { getPhoneOriginDistribution, getRoundtripVsOneway, getDashboardBookingsByDay, getDashboardBookingsByHour } from '../api';
import { ChartData, PhoneOriginData, RoundtripOnewayData, BookingsByPeriod, BookingsByHour } from '../types';

interface ChartState {
  phoneOriginData: ChartData[];
  roundtripOnewayData: ChartData[];
  bookingsByPeriodData: BookingsByPeriod[];
  bookingsByHourData: BookingsByHour[]; // New state
  loading: boolean;
  error: string | null;
  fetchChartData: () => Promise<void>;
}

export const useChartStore = create<ChartState>((set) => ({
  phoneOriginData: [],
  roundtripOnewayData: [],
  bookingsByPeriodData: [],
  bookingsByHourData: [], // Initialize new state
  loading: false,
  error: null,
  fetchChartData: async () => {
    set({ loading: true, error: null });
    try {
      const [phoneResult, roundtripResult, bookingsPeriodResult, bookingsHourResult] = await Promise.allSettled([
        getPhoneOriginDistribution(),
        getRoundtripVsOneway(),
        getDashboardBookingsByDay(),
        getDashboardBookingsByHour(), // New API call
      ]);

      const phoneData = phoneResult.status === 'fulfilled' 
        ? phoneResult.value.map((item: PhoneOriginData) => ({ name: item.origin, value: item.count }))
        : [];

      const roundtripData = roundtripResult.status === 'fulfilled'
        ? roundtripResult.value.map((item: RoundtripOnewayData) => ({ name: item.type, value: item.count }))
        : [];
      
      const bookingsPeriodData: BookingsByPeriod[] = bookingsPeriodResult.status === 'fulfilled'
        ? bookingsPeriodResult.value
        : [];

      const bookingsHourData: BookingsByHour[] = bookingsHourResult.status === 'fulfilled'
        ? bookingsHourResult.value
        : [];

      if (phoneResult.status === 'rejected' || roundtripResult.status === 'rejected' || bookingsPeriodResult.status === 'rejected' || bookingsHourResult.status === 'rejected') {
        console.error("Error fetching chart data:", { phoneResult, roundtripResult, bookingsPeriodResult, bookingsHourResult });
        throw new Error('One or more chart data requests failed');
      }

      set({
        phoneOriginData: phoneData,
        roundtripOnewayData: roundtripData,
        bookingsByPeriodData: bookingsPeriodData,
        bookingsByHourData: bookingsHourData, // Update new state
        loading: false,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      set({ loading: false, error: errorMessage });
      console.error(err);
    }
  },
}));
