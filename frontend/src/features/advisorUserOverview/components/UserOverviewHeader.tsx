import React from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../components/shared/PageHeader';

interface UserOverviewHeaderProps {
  t: (key: string) => string;
  theme: string;
  toggleTheme: () => void;
  onBack: () => void;
  onLogout: () => void;
}

const UserOverviewHeader: React.FC<UserOverviewHeaderProps> = ({
  t,
  onBack,
  onLogout,
}) => {
  return (
    <PageHeader
      title={t('userOverview.title')}
      showBack
      onBack={onBack}
      showLogout
      onLogout={onLogout}
    />
  );
};

export default UserOverviewHeader;

