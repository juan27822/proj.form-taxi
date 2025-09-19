import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import BookingForm from '../components/BookingForm';
import ServicesInfo from '../components/ServicesInfo';

import './ClientPage.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher">
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('es')}>Español</button>
      <button onClick={() => changeLanguage('de')}>Deutsch</button>
    </div>
  );
};

const ClientPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#333', color: 'white'}}>
        <h1>{t('booking_form_title')}</h1>
        <nav>
          <Link to="/check-booking" style={{color: 'white', marginRight: '20px'}}>{t('check_booking_status_title')}</Link>
          <LanguageSwitcher />
        </nav>
      </header>
      <main className="main-content">
        <div className="booking-form-container">
          <BookingForm />
        </div>
        <div className="services-info-container-wrapper">
          <ServicesInfo />
        </div>
      </main>
    </div>
  );
};

export default ClientPage;
