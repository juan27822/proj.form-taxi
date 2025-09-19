import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './ServicesInfo.css';

const ServicesInfo: React.FC = () => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      question: t('faq_question_1'),
      answer: t('faq_answer_1'),
    },
    {
      question: t('faq_question_2'),
      answer: t('faq_answer_2'),
    },
    {
      question: t('faq_question_3'),
      answer: t('faq_answer_3'),
    },
    {
      question: t('faq_question_4'),
      answer: t('faq_answer_4'),
    },
  ];

  return (
    <div className="services-info-container">
      <h2>{t('services_info_title')}</h2>

      <div className="info-section">
        <h3>{t('general_info_title')}</h3>
        <h4>{t('prices_title')}</h4>
        <p>{t('prices_content_1')}</p>
        <p>{t('prices_content_2')}</p>
        <p>{t('prices_content_3')}</p>
        <h4>{t('capacity_title')}</h4>
        <p>{t('capacity_content')}</p>
        <h4>{t('return_transfer_title')}</h4>
        <p>{t('return_transfer_content_1')}</p>
        <p>{t('return_transfer_content_2')}</p>
        <p><strong>{t('return_transfer_content_3')}</strong></p>
        <p><em>{t('return_transfer_content_4')}</em></p>
      </div>

      <div className="info-section">
        <h3>{t('faq_title')}</h3>
        <div className="accordion">
          {faqs.map((faq, index) => (
            <div key={index} className="accordion-item">
              <button
                className={`accordion-title ${activeIndex === index ? 'active' : ''}`}
                onClick={() => toggleAccordion(index)}
              >
                {faq.question}
              </button>
              <div className={`accordion-content ${activeIndex === index ? 'show' : ''}`}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="info-section">
        <h3>{t('contact_info_title')}</h3>
        <p>{t('contact_info_phone')}</p>
        <p>{t('contact_info_email')}</p>
        <p>{t('contact_info_facebook')}</p>
      </div>
    </div>
  );
};

export default ServicesInfo;
