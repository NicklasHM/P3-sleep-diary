import React from 'react';
import PageHeader from '../../../components/shared/PageHeader';

interface DashboardHeaderProps {
  title: string | React.ReactNode;
  showLogout?: boolean;
  onLogout?: () => void;
  extraActions?: React.ReactNode;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  showLogout = false,
  onLogout,
  extraActions,
}) => {
  return (
    <PageHeader
      title={title}
      showLogout={showLogout}
      onLogout={onLogout}
      extraActions={extraActions}
    />
  );
};

export default DashboardHeader;








