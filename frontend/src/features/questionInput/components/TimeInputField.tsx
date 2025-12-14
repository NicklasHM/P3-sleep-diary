import React from 'react';
import type { Question } from '../../../types';

type Props = {
  question: Question;
  value: string;
  onChange: (val: string) => void;
  error: string;
};

const TimeInputField: React.FC<Props> = ({ question, value, onChange, error }) => {
  const isValidTimeFormat = (time: string | undefined): boolean => {
    if (!time) return false;
    return /^\d{2}:\d{2}$/.test(time.trim());
  };

  const minTime = isValidTimeFormat(question.minTime) ? question.minTime!.trim() : undefined;
  const maxTime = isValidTimeFormat(question.maxTime) ? question.maxTime!.trim() : undefined;

  const timeValue = typeof value === 'string' && value.includes(':') ? value : '';

  return (
    <div>
      <input
        type="time"
        className={`question-input time-input ${error ? 'error' : ''}`}
        value={timeValue}
        onChange={(e) => onChange(e.target.value)}
        step={question.text.includes('5 min') ? '300' : undefined}
        min={minTime}
        max={maxTime}
      />
      {error && <div className="input-error">{error}</div>}
    </div>
  );
};

export default TimeInputField;






