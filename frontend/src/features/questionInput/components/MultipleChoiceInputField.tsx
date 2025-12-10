import React from 'react';
import type { Question } from '../../../types';

type Props = {
  question: Question;
  value: any;
  onChange: (val: any) => void;
  t: (key: string) => string;
};

const MultipleChoiceInputField: React.FC<Props> = ({ question, value, onChange, t }) => {
  const otherOption = question.options?.find((opt) => opt.isOther);
  const isOtherSelected =
    otherOption &&
    (value === otherOption.id || (typeof value === 'object' && (value as any)?.optionId === otherOption.id));
  const otherCustomText =
    typeof value === 'object' && (value as any)?.optionId === otherOption?.id ? (value as any).customText || '' : '';

  return (
    <div className="multiple-choice-container">
      {question.options?.map((option) => {
        const isSelected = option.isOther
          ? isOtherSelected
          : value === option.id || (typeof value === 'object' && (value as any)?.optionId === option.id);

        return (
          <div key={option.id}>
            <label className="multiple-choice-option">
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option.id}
                checked={isSelected}
                onChange={() => {
                  if (option.isOther) {
                    onChange({ optionId: option.id, customText: '' });
                  } else {
                    onChange(option.id);
                  }
                }}
              />
              <span>{option.text}</span>
            </label>
            {option.isOther && isOtherSelected && (
              <div style={{ marginLeft: '24px', marginTop: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  className="question-input"
                  value={otherCustomText}
                  onChange={(e) => onChange({ optionId: option.id, customText: e.target.value })}
                  placeholder={t('questionInput.otherPlaceholder')}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MultipleChoiceInputField;

