import React from 'react';
import { useTranslation } from 'react-i18next';
import './ConfirmModal.css';

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ title, message, onConfirm, onCancel, confirmText, cancelText }) => {
  const { t } = useTranslation();

  return (
    <div className="modal-overlay">
      <div className="modal-content confirm-modal">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button onClick={onCancel} className="btn btn-secondary">
            {cancelText || t('cancel_btn')}
          </button>
          <button onClick={onConfirm} className="btn btn-danger">
            {confirmText || t('confirm_btn')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
