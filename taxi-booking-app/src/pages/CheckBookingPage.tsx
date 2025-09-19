import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getBookingStatus } from '../api';

const CheckBookingPage: React.FC = () => {
    const { t } = useTranslation();
    const [bookingId, setBookingId] = useState('');
    const [bookingStatus, setBookingStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCheckStatus = async () => {
        if (!bookingId) {
            setError(t('booking_id_required'));
            return;
        }
        try {
            const response = await getBookingStatus(bookingId);
            setBookingStatus(response.data.status);
            setError(null);
        } catch (err) {
            setBookingStatus(null);
            setError(t('booking_not_found'));
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>{t('check_booking_status_title')}</h1>
            <div className="form-group">
                <label>{t('booking_id_label')}</label>
                <input
                    type="text"
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    placeholder={t('original_booking_id_placeholder')}
                />
            </div>
            <button onClick={handleCheckStatus}>{t('check_status_button')}</button>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {bookingStatus && (
                <div>
                    <h2>{t('booking_status_label')}</h2>
                    <p>{t(bookingStatus.toLowerCase())}</p>
                </div>
            )}
        </div>
    );
};

export default CheckBookingPage;