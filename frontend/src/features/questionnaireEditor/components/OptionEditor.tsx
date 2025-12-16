import React from 'react';
import { useTranslation } from 'react-i18next';
import type { QuestionOption, Question } from '../../../types';
import ConditionalQuestionsList from './ConditionalQuestionsList';
import ConditionalQuestionForm from './ConditionalQuestionForm';

interface OptionEditorProps {
  option: QuestionOption;
  editedQuestion: Question;
  allQuestions: Question[];
  isExpanded: boolean;
  isEveningQuestionnaire: boolean;
  isLocked: boolean;
  isConditionalQuestion: boolean;
  creatingNewConditional: { optionId: string } | null;
  newConditionalQuestion: Partial<Question>;
  newConditionalOptionText: string;
  newConditionalOptionTextEn: string;
  availableQuestions: Question[];
  conditionalChildren: any[];
  onToggleExpand: () => void;
  onUpdateText: (field: 'textDa' | 'textEn', value: string) => void;
  onUpdateColorCode: (colorCode: 'green' | 'yellow' | 'red' | '') => void;
  onRemove: () => void;
  onStartCreatingConditional: () => void;
  onQuestionUpdate: (updates: Partial<Question>) => void;
  onTypeChange: (type: any) => void;
  onOptionTextChange: (text: string) => void;
  onOptionTextEnChange: (textEn: string) => void;
  onAddConditionalOption: () => void;
  onUpdateConditionalOption: (index: number, field: 'textDa' | 'textEn', value: string) => void;
  onRemoveConditionalOption: (index: number) => void;
  onAddOtherOptionToConditional: () => void;
  onCreateConditional: () => void;
  onCancelConditional: () => void;
  onAddExistingConditional: (childQuestionId: string) => void;
  onRemoveConditional: (childQuestionId: string) => void;
}

const OptionEditor: React.FC<OptionEditorProps> = ({
  option,
  editedQuestion,
  allQuestions,
  isExpanded,
  isEveningQuestionnaire,
  isLocked,
  isConditionalQuestion,
  creatingNewConditional,
  newConditionalQuestion,
  newConditionalOptionText,
  newConditionalOptionTextEn,
  availableQuestions,
  conditionalChildren,
  onToggleExpand,
  onUpdateText,
  onUpdateColorCode,
  onRemove,
  onStartCreatingConditional,
  onQuestionUpdate,
  onTypeChange,
  onOptionTextChange,
  onOptionTextEnChange,
  onAddConditionalOption,
  onUpdateConditionalOption,
  onRemoveConditionalOption,
  onAddOtherOptionToConditional,
  onCreateConditional,
  onCancelConditional,
  onAddExistingConditional,
  onRemoveConditional,
}) => {
  const { t } = useTranslation();
  const optionId = option.id || '';

  return (
    <div className="option-edit-section">
      <div className="option-edit-item" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <input
          type="text"
          value={option.textDa || option.text || ''}
          onChange={(e) => onUpdateText('textDa', e.target.value)}
          className="form-input"
          disabled={option.isOther}
          placeholder="Dansk tekst"
        />
        <input
          type="text"
          value={option.textEn || ''}
          onChange={(e) => onUpdateText('textEn', e.target.value)}
          className="form-input"
          disabled={option.isOther}
          placeholder="English text"
        />
        {option.isOther && (
          <span style={{ fontSize: '0.85em', color: '#666', marginLeft: '8px' }}>
            ({t('editor.otherOption')})
          </span>
        )}
        {isEveningQuestionnaire && !isLocked && (
          <select
            value={option.colorCode || ''}
            onChange={(e) => onUpdateColorCode(e.target.value as 'green' | 'yellow' | 'red' | '')}
            className="form-input"
            style={{ width: '120px', marginLeft: '8px' }}
          >
            <option value="">{t('editor.colorCode.none')}</option>
            <option value="green">{t('editor.colorCode.greenOption')}</option>
            <option value="yellow">{t('editor.colorCode.yellowOption')}</option>
            <option value="red">{t('editor.colorCode.redOption')}</option>
          </select>
        )}
        <button
          onClick={onRemove}
          className="btn btn-danger btn-small"
        >
          {t('common.delete')}
        </button>
      </div>
      
      {/* Conditional questions section */}
      {!isLocked && editedQuestion.id && editedQuestion.id.trim() !== '' && !isConditionalQuestion && (
        <div className="conditional-section">
          <button
            onClick={onToggleExpand}
            className="btn-conditional-toggle"
          >
            {isExpanded ? '▼' : '▶'} {t('editor.conditionalQuestions', { count: conditionalChildren.length })}
          </button>
          
          {isExpanded && (
            <div className="conditional-content">
              <ConditionalQuestionsList
                conditionalChildren={conditionalChildren}
                allQuestions={allQuestions}
                onRemove={onRemoveConditional}
              />
              
              <div className="conditional-add-section">
                <button
                  onClick={onStartCreatingConditional}
                  className="btn btn-primary btn-small"
                  style={{ marginBottom: '12px', width: '100%' }}
                >
                  {t('editor.createNewConditional')}
                </button>
                
                {creatingNewConditional?.optionId === optionId ? (
                  <ConditionalQuestionForm
                    newConditionalQuestion={newConditionalQuestion}
                    newConditionalOptionText={newConditionalOptionText}
                    newConditionalOptionTextEn={newConditionalOptionTextEn}
                    onQuestionUpdate={onQuestionUpdate}
                    onTypeChange={onTypeChange}
                    onOptionTextChange={onOptionTextChange}
                    onOptionTextEnChange={onOptionTextEnChange}
                    onAddOption={onAddConditionalOption}
                    onUpdateOption={onUpdateConditionalOption}
                    onRemoveOption={onRemoveConditionalOption}
                    onAddOtherOption={onAddOtherOptionToConditional}
                    onCreate={onCreateConditional}
                    onCancel={onCancelConditional}
                  />
                ) : (
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        onAddExistingConditional(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="form-input"
                  >
                    <option value="">{t('editor.selectExisting')}</option>
                    {availableQuestions.map((q) => (
                      <option key={q.id} value={q.id || ''}>
                        #{q.order} - {q.text}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OptionEditor;








