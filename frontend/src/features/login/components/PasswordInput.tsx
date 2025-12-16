import React from 'react';

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  error?: string | null;
  hint?: string;
  required?: boolean;
  t: (key: string) => string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  showPassword,
  onTogglePassword,
  error,
  hint,
  required = false,
  t,
}) => {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div className="password-input-wrapper">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          required={required}
          className={`form-input ${error ? 'input-error' : ''}`}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={onTogglePassword}
          aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
        >
          {showPassword ? '👁️' : '👁'}
        </button>
      </div>
      {error && (
        <div className="field-error">{error}</div>
      )}
      {hint && !error && (
        <small className="form-hint">{hint}</small>
      )}
    </div>
  );
};

export default PasswordInput;








