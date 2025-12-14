import React from 'react';
import { UserRole } from '../../../types';
import PasswordInput from './PasswordInput';

interface RegisterFormProps {
  t: (key: string) => string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  showPassword: boolean;
  showConfirmPassword: boolean;
  firstNameError: string | null;
  lastNameError: string | null;
  usernameError: string | null;
  usernameAvailable: boolean;
  checkingUsername: boolean;
  passwordError: string | null;
  confirmPasswordError: string | null;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onRoleChange: (role: UserRole) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  onFirstNameBlur: () => void;
  onLastNameBlur: () => void;
  onUsernameBlur: () => void;
  onPasswordBlur: () => void;
  onConfirmPasswordBlur: () => void;
  onFirstNameTouch: () => void;
  onLastNameTouch: () => void;
  onUsernameTouch: () => void;
  onPasswordTouch: () => void;
  onConfirmPasswordTouch: () => void;
  onPasswordChangeReset: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  t,
  firstName,
  lastName,
  username,
  password,
  confirmPassword,
  role,
  showPassword,
  showConfirmPassword,
  firstNameError,
  lastNameError,
  usernameError,
  usernameAvailable,
  checkingUsername,
  passwordError,
  confirmPasswordError,
  onFirstNameChange,
  onLastNameChange,
  onUsernameChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onRoleChange,
  onTogglePassword,
  onToggleConfirmPassword,
  onFirstNameBlur,
  onLastNameBlur,
  onUsernameBlur,
  onPasswordBlur,
  onConfirmPasswordBlur,
  onFirstNameTouch,
  onLastNameTouch,
  onUsernameTouch,
  onPasswordTouch,
  onConfirmPasswordTouch,
  onPasswordChangeReset,
}) => {
  return (
    <>
      <div className="form-group">
        <label htmlFor="firstName">{t('login.firstName')}</label>
        <input
          id="firstName"
          type="text"
          value={firstName}
          onChange={(e) => {
            onFirstNameChange(e.target.value);
            onFirstNameTouch();
          }}
          onBlur={onFirstNameBlur}
          required
          className={`form-input ${firstNameError ? 'input-error' : ''}`}
        />
        {firstNameError && (
          <div className="field-error">{firstNameError}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="lastName">{t('login.lastName')}</label>
        <input
          id="lastName"
          type="text"
          value={lastName}
          onChange={(e) => {
            onLastNameChange(e.target.value);
            onLastNameTouch();
          }}
          onBlur={onLastNameBlur}
          required
          className={`form-input ${lastNameError ? 'input-error' : ''}`}
        />
        {lastNameError && (
          <div className="field-error">{lastNameError}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="registerUsername">
          {t('login.username')} <span className="form-hint">({t('login.usernameHint')})</span>
        </label>
        <input
          id="registerUsername"
          type="text"
          value={username}
          onChange={(e) => {
            onUsernameChange(e.target.value);
            onUsernameTouch();
          }}
          onBlur={onUsernameBlur}
          required
          className={`form-input ${usernameError ? 'input-error' : usernameAvailable ? 'input-success' : ''}`}
        />
        {checkingUsername && (
          <small className="form-hint" style={{ fontStyle: 'normal' }}>{t('login.checkingUsername')}...</small>
        )}
        {usernameError && !checkingUsername && (
          <div className="field-error">{usernameError}</div>
        )}
        {usernameAvailable && !checkingUsername && !usernameError && (
          <div className="field-success">✓ {t('login.usernameAvailable')}</div>
        )}
      </div>

      <PasswordInput
        id="registerPassword"
        label={t('login.password')}
        value={password}
        onChange={(value) => {
          onPasswordChange(value);
          onPasswordChangeReset();
        }}
        onBlur={onPasswordBlur}
        showPassword={showPassword}
        onTogglePassword={onTogglePassword}
        error={passwordError}
        hint={t('login.passwordRequirements')}
        required
        t={t}
      />

      <PasswordInput
        id="confirmPassword"
        label={t('login.confirmPassword')}
        value={confirmPassword}
        onChange={(value) => {
          onConfirmPasswordChange(value);
          onConfirmPasswordTouch();
        }}
        onBlur={onConfirmPasswordBlur}
        showPassword={showConfirmPassword}
        onTogglePassword={onToggleConfirmPassword}
        error={confirmPasswordError}
        required
        t={t}
      />

      <div className="form-group">
        <label htmlFor="role">{t('login.role')}</label>
        <select
          id="role"
          value={role}
          onChange={(e) => onRoleChange(e.target.value as UserRole)}
          className="form-input"
        >
          <option value={UserRole.BORGER}>{t('login.roleCitizen')}</option>
          <option value={UserRole.RÅDGIVER}>{t('login.roleAdvisor')}</option>
        </select>
      </div>
    </>
  );
};

export default RegisterForm;






