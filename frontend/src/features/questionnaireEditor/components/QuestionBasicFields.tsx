import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Question, QuestionType } from '../../../types';

interface QuestionBasicFieldsProps {
  editedQuestion: Question;
  onUpdate: (updates: Partial<Question>) => void;
  isLocked: boolean;
}

const QuestionBasicFields: React.FC<QuestionBasicFieldsProps> = ({
  editedQuestion,
  onUpdate,
  isLocked,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="form-group">
        <label>{t('editor.questionText')} (Dansk)</label>
        <textarea
          value={editedQuestion.textDa || editedQuestion.text || ''}
          onChange={(e) =>
            onUpdate({ textDa: e.target.value, text: e.target.value })
          }
          className="form-input"
          rows={3}
        />
      </div>
      <div className="form-group">
        <label>{t('editor.questionText')} (English)</label>
        <textarea
          value={editedQuestion.textEn || ''}
          onChange={(e) =>
            onUpdate({ textEn: e.target.value })
          }
          className="form-input"
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>{t('editor.type')}</label>
        <select
          value={editedQuestion.type}
          onChange={(e) =>
            onUpdate({ type: e.target.value as QuestionType })
          }
          className="form-input"
          disabled={isLocked}
        >
          <option value="text">Text</option>
          <option value="time_picker">Time Picker</option>
          <option value="numeric">Numeric</option>
          <option value="slider">Slider</option>
          <option value="multiple_choice">Multiple Choice (Enkelt valg)</option>
          <option value="multiple_choice_multiple">Multiple Choice (Flere valg)</option>
        </select>
      </div>
    </>
  );
};

export default QuestionBasicFields;






