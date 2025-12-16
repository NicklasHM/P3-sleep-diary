import React from 'react';
import PasswordInput from './PasswordInput';

interface LoginFormProps {
  t: (key: string) => string;
  username: string;
  password: string;
  showPassword: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  t,
  username,
  password,
  showPassword,
  onUsernameChange,
  onPasswordChange,
  onTogglePassword,
}) => {
  return (
    <>
      <div className="form-group">
        <label htmlFor="username">{t('login.username')}</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          required
          className="form-input"
        />
      </div>

      <PasswordInput
        id="password"
        label={t('login.password')}
        value={password}
        onChange={onPasswordChange}
        showPassword={showPassword}
        onTogglePassword={onTogglePassword}
        required
        t={t}
      />
    </>
  );
};

export default LoginForm;








