import React from 'react';
import PageHeader from '../../../components/shared/PageHeader';

type WizardHeaderProps = {
  title: string;
  onCancel: () => void;
  theme: string;
  toggleTheme: () => void;
  cancelLabel: string;
  themeTooltip: string;
};

const WizardHeader: React.FC<WizardHeaderProps> = ({
  title,
  onCancel,
  cancelLabel,
}) => {
  return (
    <PageHeader
      title={title}
      showBack
      onBack={onCancel}
      className="wizard-header"
      headerClassName="wizard-header-actions"
      extraActions={
        <button onClick={onCancel} className="btn btn-secondary">
          {cancelLabel}
        </button>
      }
    />
  );
};

export default WizardHeader;

