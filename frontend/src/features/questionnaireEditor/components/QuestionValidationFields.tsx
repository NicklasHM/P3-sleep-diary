import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Question } from '../../../types';

interface QuestionValidationFieldsProps {
  editedQuestion: Question;
  onUpdate: (updates: Partial<Question>) => void;
  isLocked: boolean;
}

const QuestionValidationFields: React.FC<QuestionValidationFieldsProps> = ({
  editedQuestion,
  onUpdate,
  isLocked,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Min/Max længde for text */}
      {editedQuestion.type === 'text' && (
        <div className="form-group">
          <label>{t('editor.validation')}</label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.9em', marginBottom: '4px', display: 'block' }}>{t('editor.minLength')}</label>
              <input
                type="number"
                value={editedQuestion.minLength ?? ''}
                onChange={(e) =>
                  onUpdate({
                    minLength: e.target.value === '' ? undefined : parseInt(e.target.value, 10),
                  })
                }
                className="form-input"
                placeholder={t('editor.noLimit')}
                disabled={isLocked}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.9em', marginBottom: '4px', display: 'block' }}>{t('editor.maxLength')}</label>
              <input
                type="number"
                value={editedQuestion.maxLength ?? ''}
                onChange={(e) =>
                  onUpdate({
                    maxLength: e.target.value === '' ? undefined : parseInt(e.target.value, 10),
                  })
                }
                className="form-input"
                placeholder={t('editor.noLimit')}
                disabled={isLocked}
              />
            </div>
          </div>
        </div>
      )}

      {/* Min/Max værdier for numeric og slider */}
      {(editedQuestion.type === 'numeric' || editedQuestion.type === 'slider') && (
        <div className="form-group">
          <label>{t('editor.validation')}</label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.9em', marginBottom: '4px', display: 'block' }}>{t('editor.minValue')}</label>
              <input
                type="number"
                value={editedQuestion.minValue ?? ''}
                onChange={(e) =>
                  onUpdate({
                    minValue: e.target.value === '' ? undefined : parseInt(e.target.value, 10),
                  })
                }
                className="form-input"
                placeholder={t('editor.noLimit')}
                disabled={isLocked}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.9em', marginBottom: '4px', display: 'block' }}>{t('editor.maxValue')}</label>
              <input
                type="number"
                value={editedQuestion.maxValue ?? ''}
                onChange={(e) =>
                  onUpdate({
                    maxValue: e.target.value === '' ? undefined : parseInt(e.target.value, 10),
                  })
                }
                className="form-input"
                placeholder={t('editor.noLimit')}
                disabled={isLocked}
              />
            </div>
          </div>
          <small style={{ color: '#666', fontSize: '0.85em', marginTop: '4px', display: 'block' }}>
            {t('editor.defaultNoNegative')}
          </small>
        </div>
      )}

      {/* Min/Max tid for time_picker */}
      {editedQuestion.type === 'time_picker' && (
        <div className="form-group">
          <label>{t('editor.validation')}</label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.9em', marginBottom: '4px', display: 'block' }}>{t('editor.earliestTime')}</label>
              <input
                type="time"
                value={editedQuestion.minTime ?? ''}
                onChange={(e) =>
                  onUpdate({
                    minTime: e.target.value || undefined,
                  })
                }
                className="form-input"
                disabled={isLocked}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.9em', marginBottom: '4px', display: 'block' }}>{t('editor.latestTime')}</label>
              <input
                type="time"
                value={editedQuestion.maxTime ?? ''}
                onChange={(e) =>
                  onUpdate({
                    maxTime: e.target.value || undefined,
                  })
                }
                className="form-input"
                disabled={isLocked}
              />
            </div>
          </div>
          <small style={{ color: '#666', fontSize: '0.85em', marginTop: '4px', display: 'block' }}>
            {t('editor.timeFormat')}
          </small>
        </div>
      )}
    </>
  );
};

export default QuestionValidationFields;








