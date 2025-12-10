import React from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../components/shared/PageHeader';

interface ReviewHeaderProps {
  t: (key: string) => string;
  theme: string;
  toggleTheme: () => void;
  type: string;
  onBack: () => void;
}

const ReviewHeader: React.FC<ReviewHeaderProps> = ({
  t,
  type,
  onBack,
}) => {
  const title = type === 'morning' 
    ? `🌅 ${t('review.morningTitle')}` 
    : `🌙 ${t('review.eveningTitle')}`;

  return (
    <PageHeader
      title={title}
      showBack
      onBack={onBack}
      className="review-header"
      headerClassName="review-header-actions"
    />
  );
};

export default ReviewHeader;

