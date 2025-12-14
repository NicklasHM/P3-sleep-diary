import React from 'react';

type Props = {
  value: string;
  onChange: (val: string) => void;
  error: string;
  t: (key: string, vars?: Record<string, any>) => string;
  minLength?: number;
  maxLength?: number;
};

const TextInputField: React.FC<Props> = ({ value, onChange, error, t, minLength, maxLength }) => {
  return (
    <div>
      <textarea
        className="question-input text-input"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('questionInput.placeholder')}
        rows={4}
        maxLength={maxLength}
        minLength={minLength}
      />
      {maxLength !== undefined && (
        <div className="input-hint" style={{ marginTop: '4px', fontSize: '0.875rem', color: '#666' }}>
          {t('questionInput.lengthRangeHint', { min: minLength ?? 1, max: maxLength })}
        </div>
      )}
      {maxLength === undefined && minLength !== undefined && (
        <div className="input-hint" style={{ marginTop: '4px', fontSize: '0.875rem', color: '#666' }}>
          {t('questionInput.minLengthHint', { min: minLength })}
        </div>
      )}
      {maxLength === undefined && minLength === undefined && (
        <div className="input-hint" style={{ marginTop: '4px', fontSize: '0.875rem', color: '#666' }}>
          {t('questionInput.lengthRangeHint', { min: 1, max: 200 })}
        </div>
      )}
      {error && <div className="input-error">{error}</div>}
    </div>
  );
};

export default TextInputField;






