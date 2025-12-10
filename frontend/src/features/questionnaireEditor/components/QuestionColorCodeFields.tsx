import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Question } from '../../../types';

interface QuestionColorCodeFieldsProps {
  editedQuestion: Question;
  onUpdate: (updates: Partial<Question>) => void;
  isEveningQuestionnaire: boolean;
  isLocked: boolean;
}

const QuestionColorCodeFields: React.FC<QuestionColorCodeFieldsProps> = ({
  editedQuestion,
  onUpdate,
  isEveningQuestionnaire,
  isLocked,
}) => {
  const { t } = useTranslation();

  if (!isEveningQuestionnaire || isLocked || 
      (editedQuestion.type !== 'numeric' && editedQuestion.type !== 'slider')) {
    return null;
  }

  return (
    <div className="form-group">
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="checkbox"
          checked={editedQuestion.hasColorCode || false}
          onChange={(e) =>
            onUpdate({
              hasColorCode: e.target.checked,
              // Ryd farvekode-værdier hvis deaktiveret
              ...(e.target.checked ? {} : {
                colorCodeGreenMax: undefined,
                colorCodeGreenMin: undefined,
                colorCodeYellowMin: undefined,
                colorCodeYellowMax: undefined,
                colorCodeRedMin: undefined,
                colorCodeRedMax: undefined,
              }),
            })
          }
        />
        {t('editor.colorCode.enable')}
      </label>
      <small style={{ color: 'var(--text-secondary)', fontSize: '0.85em', marginTop: '4px', display: 'block', marginLeft: '24px' }}>
        {t('editor.colorCode.description')}
      </small>

      {editedQuestion.hasColorCode && (
        <div className="color-code-settings">
          <div style={{ marginBottom: '16px' }}>
            <label>
              {t('editor.colorCode.green')}
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="number"
                value={editedQuestion.colorCodeGreenMin ?? ''}
                onChange={(e) =>
                  onUpdate({
                    colorCodeGreenMin: e.target.value === '' ? undefined : parseInt(e.target.value, 10),
                  })
                }
                className="form-input"
                placeholder="fx 1"
                style={{ flex: 1 }}
              />
              <span>-</span>
              <input
                type="number"
                value={editedQuestion.colorCodeGreenMax ?? ''}
                onChange={(e) =>
                  onUpdate({
                    colorCodeGreenMax: e.target.value === '' ? undefined : parseInt(e.target.value, 10),
                  })
                }
                className="form-input"
                placeholder="fx 9"
                style={{ flex: 1 }}
              />
            </div>
            <small style={{ display: 'block', marginTop: '4px' }}>
              {t('editor.colorCode.greenDescription')}
            </small>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>
              {t('editor.colorCode.yellow')}
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="number"
                value={editedQuestion.colorCodeYellowMin ?? ''}
                onChange={(e) =>
                  onUpdate({
                    colorCodeYellowMin: e.target.value === '' ? undefined : parseInt(e.target.value, 10),
                  })
                }
                className="form-input"
                placeholder="fx 10"
                style={{ flex: 1 }}
              />
              <span>-</span>
              <input
                type="number"
                value={editedQuestion.colorCodeYellowMax ?? ''}
                onChange={(e) =>
                  onUpdate({
                    colorCodeYellowMax: e.target.value === '' ? undefined : parseInt(e.target.value, 10),
                  })
                }
                className="form-input"
                placeholder="fx 19"
                style={{ flex: 1 }}
              />
            </div>
            <small style={{ display: 'block', marginTop: '4px' }}>
              {t('editor.colorCode.yellowDescription')}
            </small>
          </div>

          <div>
            <label>
              {t('editor.colorCode.red')}
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="number"
                value={editedQuestion.colorCodeRedMin ?? ''}
                onChange={(e) =>
                  onUpdate({
                    colorCodeRedMin: e.target.value === '' ? undefined : parseInt(e.target.value, 10),
                  })
                }
                className="form-input"
                placeholder="fx 20"
                style={{ flex: 1 }}
              />
              <span>-</span>
              <input
                type="number"
                value={editedQuestion.colorCodeRedMax ?? ''}
                onChange={(e) =>
                  onUpdate({
                    colorCodeRedMax: e.target.value === '' ? undefined : parseInt(e.target.value, 10),
                  })
                }
                className="form-input"
                placeholder="fx 30"
                style={{ flex: 1 }}
              />
            </div>
            <small style={{ display: 'block', marginTop: '4px' }}>
              {t('editor.colorCode.redDescription')}
            </small>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionColorCodeFields;

