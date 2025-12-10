import { useTranslation } from 'react-i18next';
import type { Question } from '../../../types';
import useQuestionInputLogic from '../useQuestionInputLogic';
import TextInputField from './TextInputField';
import TimeInputField from './TimeInputField';
import NumericInputField from './NumericInputField';
import SliderInputField from './SliderInputField';
import MultipleChoiceInputField from './MultipleChoiceInputField';
import MultipleChoiceMultipleInputField from './MultipleChoiceMultipleInputField';
import './QuestionInput.css';

interface QuestionInputProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  allQuestions?: Question[];
  answers?: Record<string, any>;
}

const QuestionInput: React.FC<QuestionInputProps> = ({
  question,
  value,
  onChange,
  allQuestions = [],
  answers = {}
}) => {
  const { t } = useTranslation();

  const { localValue, error, handleChange } = useQuestionInputLogic({
    question,
    value,
    onChange,
    allQuestions,
    answers
  });

  if (question.type === 'text') {
    return (
      <TextInputField
        value={localValue || ''}
        onChange={handleChange}
        error={error}
        t={t}
        minLength={question.minLength}
        maxLength={question.maxLength}
      />
    );
  }

  if (question.type === 'time_picker') {
    return (
      <TimeInputField
        question={question}
        value={typeof localValue === 'string' ? localValue : ''}
        onChange={handleChange}
        error={error}
      />
    );
  }

  if (question.type === 'numeric') {
    let maxValue = question.maxValue;
    let isDisabled = false;
    if (question.order === 8) {
      const question6 = allQuestions.find((q) => q.order === 6 && q.type === 'multiple_choice');
      if (question6) {
        const answer6 = answers[question6.id];
        if (answer6 !== undefined && answer6 !== null) {
          try {
            const optionId =
              typeof answer6 === 'object' && (answer6 as any)?.optionId ? (answer6 as any).optionId : answer6;
            if (optionId === 'wake_no') {
              maxValue = 0;
              isDisabled = true;
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    }

    return (
      <NumericInputField
        question={question}
        value={localValue}
        onChange={handleChange}
        error={error}
        isDisabled={isDisabled}
        maxValue={maxValue}
        minValue={question.minValue}
        hint={isDisabled ? t('questionInput.question6HintWhenQuestion5IsZero') : undefined}
      />
    );
  }

  if (question.type === 'slider') {
    const min = question.minValue !== undefined ? question.minValue : 1;
    return (
      <SliderInputField
        question={question}
        value={localValue || min}
        onChange={handleChange}
        error={error}
        t={t}
      />
    );
  }

  if (question.type === 'multiple_choice') {
    return <MultipleChoiceInputField question={question} value={localValue} onChange={handleChange} t={t} />;
  }

  if (question.type === 'multiple_choice_multiple') {
    return (
      <MultipleChoiceMultipleInputField
        question={question}
        value={Array.isArray(localValue) ? localValue : localValue ? [localValue] : []}
        onChange={handleChange}
        t={t}
      />
    );
  }

  return (
    <input
      type="text"
      className="question-input"
      value={localValue || ''}
      onChange={(e) => handleChange(e.target.value)}
    />
  );
};

export default QuestionInput;

