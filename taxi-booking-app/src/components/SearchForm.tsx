import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getDrivers } from '../api'; // Assuming you have an api utility
import { Driver } from '../types'; // Assuming you have a Driver type
import './SearchForm.css';

interface SearchFormProps {
  onSearch: (params: { [key: string]: string }) => void;
  onClear: () => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, onClear }) => {
  const { t } = useTranslation();
  const [searchField, setSearchField] = useState('name');
  const [searchValue, setSearchValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [destination, setDestination] = useState('');
  const [driverId, setDriverId] = useState('');
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const driverData = await getDrivers();
        setDrivers(driverData);
      } catch (error) {
        console.error('Error fetching drivers:', error);
      }
    };
    fetchDrivers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: { [key: string]: string } = {};
    if (searchValue) params[searchField] = searchValue;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (status) params.status = status;
    if (destination) params.destination = destination;
    if (driverId) params.driverId = driverId;
    onSearch(params);
  };

  const handleClear = () => {
    setSearchValue('');
    setStartDate('');
    setEndDate('');
    setStatus('');
    setDestination('');
    setDriverId('');
    onClear();
  };

  return (
    <form onSubmit={handleSearch} className="search-form">
      <div className="search-grid">
        {/* Text Search */}
        <div className="search-group">
          <select value={searchField} onChange={(e) => setSearchField(e.target.value)}>
            <option value="name">{t('customer_col')}</option>
            <option value="id">{t('booking_id_col')}</option>
            <option value="phone">{t('contact_col')}</option>
          </select>
          <input
            type="text"
            placeholder={t('search_placeholder')}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        {/* Date Range */}
        <div className="search-group">
          <label htmlFor="startDate">{t('from_date_label', 'Desde')}:</label>
          <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <label htmlFor="endDate">{t('to_date_label', 'Hasta')}:</label>
          <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={!startDate} />
        </div>

        {/* Status Filter */}
        <div className="search-group">
          <label htmlFor="status">{t('status_col', 'Estado')}:</label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">{t('all_statuses', 'Todos')}</option>
            <option value="pending">{t('status_pending', 'Pendiente')}</option>
            <option value="confirmed">{t('status_confirmed', 'Confirmado')}</option>
            <option value="archived">{t('status_archived', 'Archivado')}</option>
          </select>
        </div>

        {/* Destination Filter */}
        <div className="search-group">
          <label htmlFor="destination">{t('destination_col', 'Destino')}:</label>
          <input
            type="text"
            id="destination"
            placeholder={t('destination_placeholder', 'ej. Aeropuerto')}
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>

        {/* Driver Filter */}
        <div className="search-group">
          <label htmlFor="driver">{t('driver_col', 'Conductor')}:</label>
          <select id="driver" value={driverId} onChange={(e) => setDriverId(e.target.value)}>
            <option value="">{t('all_drivers', 'Todos')}</option>
            {drivers.map(driver => (
              <option key={driver.id} value={driver.id}>{driver.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="search-actions">
        <button type="submit">{t('search_button')}</button>
        <button type="button" onClick={handleClear}>{t('clear_button')}</button>
      </div>
    </form>
  );
};

export default SearchForm;