import React from 'react';
import type { Question } from '../../../types';

type Props = {
  question: Question;
  value: number;
  onChange: (val: number) => void;
  error: string;
  t: (key: string) => string;
};

const SliderInputField: React.FC<Props> = ({ question, value, onChange, error, t }) => {
  const min = question.minValue !== undefined ? question.minValue : 1;
  const max = question.maxValue !== undefined ? question.maxValue : 5;
  const sliderValue = value || min;
  const isQuestion9 = question.order === 9;

  return (
    <div className="slider-container">
      <input
        type="range"
        className="question-input slider-input"
        min={min}
        max={max}
        value={sliderValue}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
      />
      <div className="slider-labels">
        {isQuestion9 ? (
          <>
            <span className="slider-label-left">{t('questionInput.slider1')}</span>
            <span className="slider-value">{sliderValue}</span>
            <span className="slider-label-right">{t('questionInput.slider5')}</span>
          </>
        ) : (
          <>
            <span>{min}</span>
            <span className="slider-value">{sliderValue}</span>
            <span>{max}</span>
          </>
        )}
      </div>
      {error && <div className="input-error">{error}</div>}
    </div>
  );
};

export default SliderInputField;

