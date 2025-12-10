import React from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../components/shared/PageHeader';

interface QuestionnaireEditorHeaderProps {
  type: string;
  isReadOnly: boolean;
  onBack: () => void;
  onLogout: () => void;
  theme: string;
  toggleTheme: () => void;
}

const QuestionnaireEditorHeader: React.FC<QuestionnaireEditorHeaderProps> = ({
  type,
  isReadOnly,
  onBack,
  onLogout,
}) => {
  const { t } = useTranslation();

  const title = type === 'morning' 
    ? `🌅 ${t('questionnaire.morning')}` 
    : `🌙 ${t('editor.title', { type: t('questionnaire.evening') })}`;
  
  const fullTitle = isReadOnly ? `${title} ${t('editor.readOnly')}` : title;

  return (
    <PageHeader
      title={fullTitle}
      showBack
      onBack={onBack}
      showLogout
      onLogout={onLogout}
    />
  );
};

export default QuestionnaireEditorHeader;

