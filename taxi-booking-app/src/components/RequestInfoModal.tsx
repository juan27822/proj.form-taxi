import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Booking } from '../types';

interface RequestInfoModalProps {
  booking: Booking;
  onClose: () => void;
  onSend: (message: string) => void;
}

const RequestInfoModal: React.FC<RequestInfoModalProps> = ({ booking, onClose, onSend }) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() === '') {
      alert('Please enter a message.');
      return;
    }
    onSend(message);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>{t('request_info_title')}</h2>
        <p><strong>{t('customer_col')}:</strong> {booking.name}</p>
        <p><strong>{t('booking_id_label')}:</strong> {booking.id}</p>
        <div className="form-group">
          <label htmlFor="message">{t('message_label')}</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            style={{ width: '100%', marginTop: '5px' }}
            placeholder='E.g., "Please verify the arrival flight number."' 
          />
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="action-button cancel">{t('cancel_btn')}</button>
          <button onClick={handleSend} className="action-button confirm">{t('send_email_btn')}</button>
        </div>
      </div>
    </div>
  );
};

export default RequestInfoModal;
