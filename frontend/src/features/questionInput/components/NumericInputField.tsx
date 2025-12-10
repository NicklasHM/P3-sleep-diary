import React from 'react';
import type { Question } from '../../../types';

type Props = {
  question: Question;
  value: number | string;
  onChange: (val: number | '') => void;
  error: string;
  isDisabled: boolean;
  maxValue?: number;
  minValue?: number;
  hint?: string;
};

const NumericInputField: React.FC<Props> = ({
  question,
  value,
  onChange,
  error,
  isDisabled,
  maxValue,
  minValue,
  hint
}) => {
  return (
    <div>
      <input
        type="number"
        className={`question-input numeric-input ${error ? 'error' : ''}`}
        value={value !== null && value !== undefined ? value : ''}
        onChange={(e) => {
          const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
          onChange(isNaN(val as number) ? '' : val);
        }}
        min={minValue !== undefined ? minValue : 0}
        max={maxValue}
        disabled={isDisabled}
        title={isDisabled ? hint : undefined}
      />
      {isDisabled && hint && (
        <div className="input-hint" style={{ marginTop: '4px', fontSize: '0.875rem', color: '#666', fontStyle: 'italic' }}>
          {hint}
        </div>
      )}
      {error && <div className="input-error">{error}</div>}
    </div>
  );
};

export default NumericInputField;

