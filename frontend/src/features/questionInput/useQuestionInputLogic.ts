import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Question } from '../../types';

type UseQuestionInputLogicArgs = {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  allQuestions: Question[];
  answers: Record<string, any>;
};

export const useQuestionInputLogic = ({
  question,
  value,
  onChange,
  allQuestions,
  answers
}: UseQuestionInputLogicArgs) => {
  const { t } = useTranslation();
  const [localValue, setLocalValue] = useState(value);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (question.type === 'time_picker' && typeof value !== 'string') {
      setLocalValue('');
    } else if (question.type === 'numeric' && typeof value === 'string' && value.includes(':')) {
      setLocalValue('');
    } else {
      setLocalValue(value);
    }
    setError('');
  }, [value, question.id, question.type]);

  const validateNumeric = (val: number): boolean => {
    if (isNaN(val)) {
      setError(t('questionInput.invalidNumber'));
      return false;
    }

    if (question.order === 8 && question.type === 'numeric') {
      const question6 = allQuestions.find((q) => q.order === 6 && q.type === 'multiple_choice');
      if (question6) {
        const answer6 = answers[question6.id];
        if (answer6 !== undefined && answer6 !== null) {
          try {
            const optionId =
              typeof answer6 === 'object' && (answer6 as any)?.optionId ? (answer6 as any).optionId : answer6;
            if (optionId === 'wake_no' && val > 0) {
              setError(t('questionInput.question6MaxValueWhenQuestion5IsZero'));
              return false;
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    }

    if (question.minValue !== undefined && val < question.minValue) {
      setError(t('questionInput.minValue', { min: question.minValue }));
      return false;
    }

    if (question.maxValue !== undefined && val > question.maxValue) {
      setError(t('questionInput.maxValue', { max: question.maxValue }));
      return false;
    }

    if (question.minValue === undefined && val < 0) {
      setError(t('questionInput.negativeNotAllowed'));
      return false;
    }

    setError('');
    return true;
  };

  const validateText = (text: string): boolean => {
    if (!text || text.trim().length === 0) {
      setError('');
      return true;
    }

    if (question.minLength !== undefined && text.trim().length < question.minLength) {
      setError(t('questionInput.minLength', { min: question.minLength }));
      return false;
    }

    if (question.maxLength !== undefined && text.length > question.maxLength) {
      setError(t('questionInput.maxLength', { max: question.maxLength }));
      return false;
    }

    setError('');
    return true;
  };

  const validateTime = (timeString: string): boolean => {
    if (!timeString) {
      setError('');
      return true;
    }

    const time = timeString.split(':');
    if (time.length !== 2) {
      setError(t('questionInput.invalidTime'));
      return false;
    }

    const hours = parseInt(time[0], 10);
    const minutes = parseInt(time[1], 10);

    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      setError(t('questionInput.invalidTime'));
      return false;
    }

    if (question.minTime) {
      const [minH, minM] = question.minTime.split(':').map(Number);
      const minTotal = minH * 60 + minM;
      const currentTotal = hours * 60 + minutes;

      if (currentTotal < minTotal) {
        if (question.order === 4) {
          setError(t('questionnaire.lightOffTimeError', { lightOffTime: timeString, bedTime: question.minTime }));
        } else {
          setError(t('questionInput.minTime', { time: question.minTime }));
        }
        return false;
      }
    }

    if (question.maxTime) {
      const [maxH, maxM] = question.maxTime.split(':').map(Number);
      const maxTotal = maxH * 60 + maxM;
      const currentTotal = hours * 60 + minutes;

      if (currentTotal > maxTotal) {
        if (question.order === 10) {
          setError(t('questionnaire.wakeTimeError', { wakeTime: question.maxTime, outOfBedTime: timeString }));
        } else {
          setError(t('questionInput.maxTime', { time: question.maxTime }));
        }
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleChange = (newValue: any) => {
    setLocalValue(newValue);

    if (question.type === 'numeric' || question.type === 'slider') {
      const numValue = typeof newValue === 'number' ? newValue : parseFloat(newValue);
      if (!isNaN(numValue)) {
        validateNumeric(numValue);
      }
    } else if (question.type === 'time_picker' && newValue) {
      validateTime(newValue);
    } else if (question.type === 'text' && newValue) {
      validateText(newValue);
    } else {
      setError('');
    }

    onChange(newValue);
  };

  return {
    localValue,
    error,
    setError,
    handleChange,
    validateNumeric,
    validateText,
    validateTime
  };
};

export default useQuestionInputLogic;








