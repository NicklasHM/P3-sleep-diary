import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Question } from '../../../types';
import OptionEditor from './OptionEditor';
import AddOptionForm from './AddOptionForm';

interface OptionsEditorProps {
  editedQuestion: Question;
  allQuestions: Question[];
  isEveningQuestionnaire: boolean;
  isLocked: boolean;
  isConditionalQuestion: boolean;
  expandedOption: string | null;
  creatingNewConditional: { optionId: string } | null;
  newConditionalQuestion: Partial<Question>;
  newConditionalOptionText: string;
  newConditionalOptionTextEn: string;
  newOptionText: string;
  newOptionTextEn: string;
  availableQuestions: Question[];
  onToggleExpand: (optionId: string) => void;
  onUpdateOptionText: (optionId: string, field: 'textDa' | 'textEn', value: string) => void;
  onUpdateOptionColorCode: (optionId: string, colorCode: 'green' | 'yellow' | 'red' | '') => void;
  onRemoveOption: (optionId: string) => void;
  onStartCreatingConditional: (optionId: string) => void;
  onQuestionUpdate: (updates: Partial<Question>) => void;
  onTypeChange: (type: any) => void;
  onConditionalOptionTextChange: (text: string) => void;
  onConditionalOptionTextEnChange: (textEn: string) => void;
  onAddConditionalOption: () => void;
  onUpdateConditionalOption: (index: number, field: 'textDa' | 'textEn', value: string) => void;
  onRemoveConditionalOption: (index: number) => void;
  onAddOtherOptionToConditional: () => void;
  onCreateConditional: () => void;
  onCancelConditional: () => void;
  onAddExistingConditional: (optionId: string, childQuestionId: string) => void;
  onRemoveConditional: (optionId: string, childQuestionId: string) => void;
  getConditionalChildrenForOption: (optionId: string) => any[];
  onNewOptionTextChange: (text: string) => void;
  onNewOptionTextEnChange: (textEn: string) => void;
  onAddOption: () => void;
  onAddOtherOption: () => void;
}

const OptionsEditor: React.FC<OptionsEditorProps> = ({
  editedQuestion,
  allQuestions,
  isEveningQuestionnaire,
  isLocked,
  isConditionalQuestion,
  expandedOption,
  creatingNewConditional,
  newConditionalQuestion,
  newConditionalOptionText,
  newConditionalOptionTextEn,
  newOptionText,
  newOptionTextEn,
  availableQuestions,
  onToggleExpand,
  onUpdateOptionText,
  onUpdateOptionColorCode,
  onRemoveOption,
  onStartCreatingConditional,
  onQuestionUpdate,
  onTypeChange,
  onConditionalOptionTextChange,
  onConditionalOptionTextEnChange,
  onAddConditionalOption,
  onUpdateConditionalOption,
  onRemoveConditionalOption,
  onAddOtherOptionToConditional,
  onCreateConditional,
  onCancelConditional,
  onAddExistingConditional,
  onRemoveConditional,
  getConditionalChildrenForOption,
  onNewOptionTextChange,
  onNewOptionTextEnChange,
  onAddOption,
  onAddOtherOption,
}) => {
  const { t } = useTranslation();

  if (editedQuestion.type !== 'multiple_choice' && editedQuestion.type !== 'multiple_choice_multiple') {
    return null;
  }

  return (
    <div className="form-group">
      <label>{t('editor.options')}</label>
      {editedQuestion.options?.map((option) => {
        const optionId = option.id || '';
        const conditionalChildren = getConditionalChildrenForOption(optionId);
        const isExpanded = expandedOption === optionId;

        return (
          <OptionEditor
            key={option.id}
            option={option}
            editedQuestion={editedQuestion}
            allQuestions={allQuestions}
            isExpanded={isExpanded}
            isEveningQuestionnaire={isEveningQuestionnaire}
            isLocked={isLocked}
            isConditionalQuestion={isConditionalQuestion}
            creatingNewConditional={creatingNewConditional}
            newConditionalQuestion={newConditionalQuestion}
            newConditionalOptionText={newConditionalOptionText}
            newConditionalOptionTextEn={newConditionalOptionTextEn}
            availableQuestions={availableQuestions}
            conditionalChildren={conditionalChildren}
            onToggleExpand={() => onToggleExpand(optionId)}
            onUpdateText={(field, value) => onUpdateOptionText(optionId, field, value)}
            onUpdateColorCode={(colorCode) => onUpdateOptionColorCode(optionId, colorCode)}
            onRemove={() => onRemoveOption(optionId)}
            onStartCreatingConditional={() => onStartCreatingConditional(optionId)}
            onQuestionUpdate={onQuestionUpdate}
            onTypeChange={onTypeChange}
            onOptionTextChange={onConditionalOptionTextChange}
            onOptionTextEnChange={onConditionalOptionTextEnChange}
            onAddConditionalOption={onAddConditionalOption}
            onUpdateConditionalOption={onUpdateConditionalOption}
            onRemoveConditionalOption={onRemoveConditionalOption}
            onAddOtherOptionToConditional={onAddOtherOptionToConditional}
            onCreateConditional={onCreateConditional}
            onCancelConditional={onCancelConditional}
            onAddExistingConditional={(childQuestionId) => onAddExistingConditional(optionId, childQuestionId)}
            onRemoveConditional={(childQuestionId) => onRemoveConditional(optionId, childQuestionId)}
          />
        );
      })}
      <AddOptionForm
        newOptionText={newOptionText}
        newOptionTextEn={newOptionTextEn}
        onTextChange={onNewOptionTextChange}
        onTextEnChange={onNewOptionTextEnChange}
        onAdd={onAddOption}
        hasOtherOption={editedQuestion.options?.some(opt => opt.isOther) || false}
        onAddOther={onAddOtherOption}
      />
    </div>
  );
};

export default OptionsEditor;

