import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import LanguageToggle from '../LanguageToggle';

interface PageHeaderProps {
  title: string | React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  showLogout?: boolean;
  onLogout?: () => void;
  extraActions?: React.ReactNode;
  className?: string;
  headerClassName?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  showBack = false,
  onBack,
  showLogout = false,
  onLogout,
  extraActions,
  className = 'dashboard-header',
  headerClassName = 'header-actions',
}) => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={className}>
      <h1>{title}</h1>
      <div className={headerClassName}>
        {extraActions}
        <LanguageToggle />
        <button 
          onClick={toggleTheme} 
          className="theme-toggle" 
          title={theme === 'light' ? t('theme.toggleDark') : t('theme.toggleLight')}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        {showBack && onBack && (
          <button onClick={onBack} className="btn btn-secondary">
            {t('common.back')}
          </button>
        )}
        {showLogout && onLogout && (
          <button onClick={onLogout} className="btn btn-secondary">
            {t('common.logout')}
          </button>
        )}
      </div>
    </header>
  );
};

export default PageHeader;






