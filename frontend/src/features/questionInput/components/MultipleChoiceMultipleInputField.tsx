import React from 'react';
import type { Question } from '../../../types';

type Props = {
  question: Question;
  value: any[];
  onChange: (val: any[]) => void;
  t: (key: string) => string;
};

const MultipleChoiceMultipleInputField: React.FC<Props> = ({ question, value, onChange, t }) => {
  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

  const otherOption = question.options?.find((opt) => opt.isOther);
  const isOtherSelected =
    otherOption &&
    selectedValues.some(
      (val) => val === otherOption.id || (typeof val === 'object' && (val as any)?.optionId === otherOption.id)
    );
  const otherCustomText =
    otherOption &&
    (selectedValues.find((val) => typeof val === 'object' && (val as any)?.optionId === otherOption.id) as any)?.customText;

  const handleCheckboxChange = (optionId: string, isChecked: boolean) => {
    if (isChecked) {
      if (otherOption && optionId === otherOption.id) {
        onChange([...selectedValues, { optionId, customText: '' }]);
      } else {
        onChange([...selectedValues, optionId]);
      }
    } else {
      onChange(
        selectedValues.filter((val: any) => {
          if (typeof val === 'object') {
            return (val as any).optionId !== optionId;
          }
          return val !== optionId;
        })
      );
    }
  };

  return (
    <div className="multiple-choice-container">
      {question.options?.map((option) => {
        const isSelected = selectedValues.some((val) => {
          if (option.isOther) {
            return val === option.id || (typeof val === 'object' && (val as any)?.optionId === option.id);
          }
          return val === option.id || (typeof val === 'object' && (val as any)?.optionId === option.id);
        });

        return (
          <div key={option.id}>
            <label className="multiple-choice-option">
              <input
                type="checkbox"
                value={option.id}
                checked={isSelected}
                onChange={(e) => handleCheckboxChange(option.id, e.target.checked)}
              />
              <span>{option.text}</span>
            </label>
            {option.isOther && isSelected && (
              <div style={{ marginLeft: '24px', marginTop: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  className="question-input"
                  value={otherCustomText || ''}
                  onChange={(e) => {
                    const updatedValues = selectedValues.map((val: any) => {
                      if (typeof val === 'object' && (val as any)?.optionId === option.id) {
                        return { optionId: option.id, customText: e.target.value };
                      }
                      return val;
                    });
                    onChange(updatedValues);
                  }}
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

export default MultipleChoiceMultipleInputField;








