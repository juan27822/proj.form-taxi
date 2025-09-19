import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './SearchForm.css';

interface Props {
    onSearch: (field: string, value: string) => void;
    onClear: () => void;
}

const SearchForm: React.FC<Props> = ({ onSearch, onClear }) => {
    const { t } = useTranslation();
    const [field, setField] = useState('name');
    const [value, setValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(field, value);
    };

    const handleClear = () => {
        setValue('');
        onClear();
    };

    return (
        <form onSubmit={handleSubmit} className="search-form">
            <select value={field} onChange={(e) => setField(e.target.value)}>
                <option value="name">{t('name_label')}</option>
                <option value="destination">{t('destination_label')}</option>
                <option value="arrival_date">{t('arrival_date_label')}</option>
                <option value="status">{t('status_col')}</option>
                <option value="id">{t('booking_id_label')}</option>
            </select>
            <input
                type={field === 'arrival_date' ? 'date' : 'text'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={t('search_placeholder')}
            />
            <button type="submit">{t('search_button')}</button>
            <button type="button" onClick={handleClear}>{t('clear_button')}</button>
        </form>
    );
};

export default SearchForm;