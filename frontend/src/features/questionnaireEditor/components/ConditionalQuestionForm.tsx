import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Question, QuestionType } from '../../../types';

interface ConditionalQuestionFormProps {
  newConditionalQuestion: Partial<Question>;
  newConditionalOptionText: string;
  newConditionalOptionTextEn: string;
  onQuestionUpdate: (updates: Partial<Question>) => void;
  onTypeChange: (type: QuestionType) => void;
  onOptionTextChange: (text: string) => void;
  onOptionTextEnChange: (textEn: string) => void;
  onAddOption: () => void;
  onUpdateOption: (index: number, field: 'textDa' | 'textEn', value: string) => void;
  onRemoveOption: (index: number) => void;
  onAddOtherOption: () => void;
  onCreate: () => void;
  onCancel: () => void;
}

const ConditionalQuestionForm: React.FC<ConditionalQuestionFormProps> = ({
  newConditionalQuestion,
  newConditionalOptionText,
  newConditionalOptionTextEn,
  onQuestionUpdate,
  onTypeChange,
  onOptionTextChange,
  onOptionTextEnChange,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
  onAddOtherOption,
  onCreate,
  onCancel,
}) => {
  const { t } = useTranslation();

  const canCreate = 
    (newConditionalQuestion.textDa || newConditionalQuestion.text)?.trim() &&
    !((newConditionalQuestion.type === 'multiple_choice' || newConditionalQuestion.type === 'multiple_choice_multiple') && 
      (!newConditionalQuestion.options || newConditionalQuestion.options.length === 0));

  return (
    <div className="new-conditional-form">
      <div className="form-group" style={{ marginBottom: '12px' }}>
        <label>{t('editor.questionText')} (Dansk)</label>
        <input
          type="text"
          value={newConditionalQuestion.textDa || newConditionalQuestion.text || ''}
          onChange={(e) => onQuestionUpdate({ textDa: e.target.value, text: e.target.value })}
          className="form-input"
          placeholder={t('editor.questionText')}
        />
      </div>
      <div className="form-group" style={{ marginBottom: '12px' }}>
        <label>{t('editor.questionText')} (English)</label>
        <input
          type="text"
          value={newConditionalQuestion.textEn || ''}
          onChange={(e) => onQuestionUpdate({ textEn: e.target.value })}
          className="form-input"
          placeholder={t('editor.questionText')}
        />
      </div>
      <div className="form-group" style={{ marginBottom: '12px' }}>
        <label>{t('editor.type')}</label>
        <select
          value={newConditionalQuestion.type || 'text'}
          onChange={(e) => onTypeChange(e.target.value as QuestionType)}
          className="form-input"
        >
          <option value="text">Text</option>
          <option value="time_picker">Time Picker</option>
          <option value="numeric">Numeric</option>
          <option value="slider">Slider</option>
          <option value="multiple_choice">Multiple Choice (Enkelt valg)</option>
          <option value="multiple_choice_multiple">Multiple Choice (Flere valg)</option>
        </select>
      </div>

      {/* Options for new conditional question */}
      {(newConditionalQuestion.type === 'multiple_choice' || newConditionalQuestion.type === 'multiple_choice_multiple') && (
        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label>{t('editor.options')}</label>
          {newConditionalQuestion.options?.map((opt, index) => (
            <div key={opt.id || index} className="option-edit-item" style={{ marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="text"
                value={opt.textDa || opt.text || ''}
                onChange={(e) => onUpdateOption(index, 'textDa', e.target.value)}
                className="form-input"
                placeholder="Dansk tekst"
              />
              <input
                type="text"
                value={opt.textEn || ''}
                onChange={(e) => onUpdateOption(index, 'textEn', e.target.value)}
                className="form-input"
                placeholder="English text"
              />
              <button
                onClick={() => onRemoveOption(index)}
                className="btn btn-danger btn-small"
              >
                {t('common.delete')}
              </button>
            </div>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="text"
              value={newConditionalOptionText}
              onChange={(e) => onOptionTextChange(e.target.value)}
              placeholder={t('editor.newOption') + ' (Dansk)'}
              className="form-input"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newConditionalOptionText.trim()) {
                  onAddOption();
                }
              }}
            />
            <input
              type="text"
              value={newConditionalOptionTextEn}
              onChange={(e) => onOptionTextEnChange(e.target.value)}
              placeholder={t('editor.newOption') + ' (English)'}
              className="form-input"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newConditionalOptionText.trim()) {
                  onAddOption();
                }
              }}
            />
            <button
              onClick={onAddOption}
              className="btn btn-primary btn-small"
            >
              {t('common.add')}
            </button>
            <button
              onClick={onAddOtherOption}
              className="btn btn-secondary btn-small"
              disabled={newConditionalQuestion.options?.some((opt) => opt.isOther)}
              style={{ marginLeft: '8px' }}
            >
              {t('editor.addOtherOption')}
            </button>
          </div>
        </div>
      )}

      {/* Min/Max for numeric/slider */}
      {(newConditionalQuestion.type === 'numeric' || newConditionalQuestion.type === 'slider') && (
        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label>{t('editor.validation')}</label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.9em', marginBottom: '4px', display: 'block' }}>{t('editor.minValue')}</label>
              <input
                type="number"
                value={newConditionalQuestion.minValue ?? ''}
                onChange={(e) =>
                  onQuestionUpdate({
                    minValue: e.target.value === '' ? undefined : parseInt(e.target.value, 10),
                  })
                }
                className="form-input"
                placeholder={t('editor.noLimit')}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.9em', marginBottom: '4px', display: 'block' }}>{t('editor.maxValue')}</label>
              <input
                type="number"
                value={newConditionalQuestion.maxValue ?? ''}
                onChange={(e) =>
                  onQuestionUpdate({
                    maxValue: e.target.value === '' ? undefined : parseInt(e.target.value, 10),
                  })
                }
                className="form-input"
                placeholder={t('editor.noLimit')}
              />
            </div>
          </div>
        </div>
      )}

      {/* Min/Max time for time_picker */}
      {newConditionalQuestion.type === 'time_picker' && (
        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label>{t('editor.validation')}</label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.9em', marginBottom: '4px', display: 'block' }}>{t('editor.earliestTime')}</label>
              <input
                type="time"
                value={newConditionalQuestion.minTime ?? ''}
                onChange={(e) =>
                  onQuestionUpdate({
                    minTime: e.target.value || undefined,
                  })
                }
                className="form-input"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.9em', marginBottom: '4px', display: 'block' }}>{t('editor.latestTime')}</label>
              <input
                type="time"
                value={newConditionalQuestion.maxTime ?? ''}
                onChange={(e) =>
                  onQuestionUpdate({
                    maxTime: e.target.value || undefined,
                  })
                }
                className="form-input"
              />
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onCreate}
          className="btn btn-primary btn-small"
          disabled={!canCreate}
        >
          {t('common.add')}
        </button>
        <button
          onClick={onCancel}
          className="btn btn-secondary btn-small"
        >
          {t('common.cancel')}
        </button>
      </div>
    </div>
  );
};

export default ConditionalQuestionForm;

