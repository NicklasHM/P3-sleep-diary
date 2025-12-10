import React from 'react';
import { useTranslation } from 'react-i18next';

interface SaveConfirmationDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const SaveConfirmationDialog: React.FC<SaveConfirmationDialogProps> = ({
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();

  return (
    <div className="confirmation-backdrop" onClick={onCancel}>
      <div
        className="confirmation-dialog"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{t('editor.confirmSaveTitle')}</h3>
        <p className="confirmation-message">{t('editor.confirmSaveMessage')}</p>
        <div className="confirmation-actions">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
          >
            {t('common.cancel')}
          </button>
          <button className="btn btn-primary" onClick={onConfirm}>
            {t('editor.confirmSaveProceed')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveConfirmationDialog;

