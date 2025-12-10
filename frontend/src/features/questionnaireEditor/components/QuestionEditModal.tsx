import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Question } from '../../../types';
import QuestionBasicFields from './QuestionBasicFields';
import QuestionValidationFields from './QuestionValidationFields';
import QuestionColorCodeFields from './QuestionColorCodeFields';
import OptionsEditor from './OptionsEditor';
import SaveConfirmationDialog from './SaveConfirmationDialog';
import { useQuestionEditModal } from '../hooks/useQuestionEditModal';

interface QuestionEditModalProps {
  question: Question;
  onSave: (question: Question) => void;
  onClose: () => void;
  allQuestions: Question[];
  onAddConditional: (childQuestionId: string) => void;
  questionnaireType?: string;
}

const QuestionEditModal: React.FC<QuestionEditModalProps> = ({
  question,
  onSave,
  onClose,
  allQuestions,
  questionnaireType,
}) => {
  const { t } = useTranslation();
  const isEveningQuestionnaire = questionnaireType === 'evening';

  const {
    editedQuestion,
    showSaveConfirmation,
    newOptionText,
    newOptionTextEn,
    expandedOption,
    creatingNewConditional,
    newConditionalQuestion,
    newConditionalOptionText,
    newConditionalOptionTextEn,
    setShowSaveConfirmation,
    setNewOptionText,
    setNewOptionTextEn,
    setExpandedOption,
    setCreatingNewConditional,
    setNewConditionalOptionText,
    setNewConditionalOptionTextEn,
    handleUpdate,
    handleSaveConfirm,
    handleAddOption,
    handleAddOtherOption,
    handleRemoveOption,
    getConditionalChildrenForOption,
    handleRemoveConditional,
    handleAddConditionalToOption,
    handleCreateNewConditional,
    handleAddOtherOptionToNewConditional,
    handleAddConditionalOption,
    handleCancelNewConditional,
    handleUpdateOptionText,
    handleUpdateOptionColorCode,
    handleUpdateNewConditionalQuestion,
    handleUpdateNewConditionalQuestionType,
    handleUpdateNewConditionalOption,
    handleRemoveNewConditionalOption,
  } = useQuestionEditModal({ question, onSave });

  const isConditionalQuestion = !!(question.id && allQuestions.some(
    (q) => q.conditionalChildren?.some(
      (cc) => cc.childQuestionId === question.id
    )
  ));

  const availableQuestions = allQuestions.filter(
    (q) => q.id && q.id !== question.id && !q.isLocked
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{question.id ? t('editor.editQuestion') : t('editor.newQuestion')}</h2>

        <QuestionBasicFields
          editedQuestion={editedQuestion}
          onUpdate={handleUpdate}
          isLocked={question.isLocked || false}
        />

        <QuestionValidationFields
          editedQuestion={editedQuestion}
          onUpdate={handleUpdate}
          isLocked={question.isLocked || false}
        />

        <QuestionColorCodeFields
          editedQuestion={editedQuestion}
          onUpdate={handleUpdate}
          isEveningQuestionnaire={isEveningQuestionnaire}
          isLocked={question.isLocked || false}
        />

        <OptionsEditor
          editedQuestion={editedQuestion}
          allQuestions={allQuestions}
          isEveningQuestionnaire={isEveningQuestionnaire}
          isLocked={question.isLocked || false}
          isConditionalQuestion={isConditionalQuestion}
          expandedOption={expandedOption}
          creatingNewConditional={creatingNewConditional}
          newConditionalQuestion={newConditionalQuestion}
          newConditionalOptionText={newConditionalOptionText}
          newConditionalOptionTextEn={newConditionalOptionTextEn}
          newOptionText={newOptionText}
          newOptionTextEn={newOptionTextEn}
          availableQuestions={availableQuestions}
          onToggleExpand={(optionId) => setExpandedOption(expandedOption === optionId ? null : optionId)}
          onUpdateOptionText={handleUpdateOptionText}
          onUpdateOptionColorCode={handleUpdateOptionColorCode}
          onRemoveOption={handleRemoveOption}
          onStartCreatingConditional={(optionId) => setCreatingNewConditional({ optionId })}
          onQuestionUpdate={handleUpdateNewConditionalQuestion}
          onTypeChange={handleUpdateNewConditionalQuestionType}
          onConditionalOptionTextChange={setNewConditionalOptionText}
          onConditionalOptionTextEnChange={setNewConditionalOptionTextEn}
          onAddConditionalOption={handleAddConditionalOption}
          onUpdateConditionalOption={handleUpdateNewConditionalOption}
          onRemoveConditionalOption={handleRemoveNewConditionalOption}
          onAddOtherOptionToConditional={handleAddOtherOptionToNewConditional}
          onCreateConditional={handleCreateNewConditional}
          onCancelConditional={handleCancelNewConditional}
          onAddExistingConditional={handleAddConditionalToOption}
          onRemoveConditional={handleRemoveConditional}
          getConditionalChildrenForOption={getConditionalChildrenForOption}
          onNewOptionTextChange={setNewOptionText}
          onNewOptionTextEnChange={setNewOptionTextEn}
          onAddOption={handleAddOption}
          onAddOtherOption={handleAddOtherOption}
        />

        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-secondary">
            {t('common.cancel')}
          </button>
          <button
            onClick={() => setShowSaveConfirmation(true)}
            className="btn btn-primary"
            disabled={!(editedQuestion.textDa || editedQuestion.text)?.trim()}
          >
            {t('common.save')}
          </button>
        </div>
        {showSaveConfirmation && (
          <SaveConfirmationDialog
            onConfirm={handleSaveConfirm}
            onCancel={() => setShowSaveConfirmation(false)}
          />
        )}
      </div>
    </div>
  );
};

export default QuestionEditModal;

