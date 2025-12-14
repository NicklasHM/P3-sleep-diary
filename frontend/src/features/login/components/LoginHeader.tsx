import React from 'react';
import LanguageToggle from '../../../components/LanguageToggle';

interface LoginHeaderProps {
  t: (key: string) => string;
  theme: string;
  toggleTheme: () => void;
}

const LoginHeader: React.FC<LoginHeaderProps> = ({ t, theme, toggleTheme }) => {
  return (
    <div className="login-header-actions">
      <LanguageToggle />
      <button 
        onClick={toggleTheme} 
        className="theme-toggle" 
        title={theme === 'light' ? t('theme.toggleDark') : t('theme.toggleLight')}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </div>
  );
};

export default LoginHeader;






