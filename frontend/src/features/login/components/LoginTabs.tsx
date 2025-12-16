import React from 'react';

interface LoginTabsProps {
  t: (key: string) => string;
  isLogin: boolean;
  onSwitchToLogin: () => void;
  onSwitchToRegister: () => void;
}

const LoginTabs: React.FC<LoginTabsProps> = ({
  t,
  isLogin,
  onSwitchToLogin,
  onSwitchToRegister,
}) => {
  return (
    <div className="login-tabs">
      <button
        className={isLogin ? 'active' : ''}
        onClick={onSwitchToLogin}
      >
        {t('login.login')}
      </button>
      <button
        className={!isLogin ? 'active' : ''}
        onClick={onSwitchToRegister}
      >
        {t('login.register')}
      </button>
    </div>
  );
};

export default LoginTabs;








