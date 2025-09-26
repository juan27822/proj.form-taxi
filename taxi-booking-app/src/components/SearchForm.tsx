import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: { [key: string]: string } = {};
    if (searchValue) {
      params[searchField] = searchValue;
    }
    if (startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }
    onSearch(params);
  };

  const handleClear = () => {
    setSearchValue('');
    setStartDate('');
    setEndDate('');
    onClear();
  };

  return (
    <form onSubmit={handleSearch} className="search-form">
      <div className="search-group text-search-group">
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

      <div className="search-group date-search-group">
        <label htmlFor="startDate">{t('from_date_label', 'Desde')}:</label>
        <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <label htmlFor="endDate">{t('to_date_label', 'Hasta')}:</label>
        <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={!startDate} />
      </div>

      <div className="search-actions">
        <button type="submit">{t('search_button')}</button>
        <button type="button" onClick={handleClear}>{t('clear_button')}</button>
      </div>
    </form>
  );
};

export default SearchForm;