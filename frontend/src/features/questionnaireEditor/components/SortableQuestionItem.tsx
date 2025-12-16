import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Question } from '../../../types';

interface SortableQuestionItemProps {
  question: Question;
  isReadOnly: boolean;
  onEdit: () => void;
  onEditChild?: (childQuestion: Question) => void;
  onDelete: () => void;
  onAddConditional: (optionId: string) => void;
  onRemoveConditional: (questionId: string, optionId: string, childQuestionId: string) => void;
  onMoveConditional: (questionId: string, optionId: string, childQuestionId: string, direction: 'up' | 'down') => void;
  allQuestions: Question[];
}

const SortableQuestionItem: React.FC<SortableQuestionItemProps> = ({
  question,
  isReadOnly,
  onEdit,
  onEditChild,
  onDelete,
  onAddConditional,
  onRemoveConditional,
  onMoveConditional,
  allQuestions,
}) => {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id || `temp_${question.order}`,
    disabled: isReadOnly || question.isLocked,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Find conditional spørgsmål grupperet efter option
  const getConditionalQuestionsByOption = () => {
    if (!question.conditionalChildren || question.conditionalChildren.length === 0) {
      return [];
    }

    const grouped: Array<{ optionId: string; optionText: string; questions: Question[] }> = [];
    
    question.conditionalChildren.forEach(cc => {
      const childQuestion = allQuestions.find(q => q.id === cc.childQuestionId);
      if (!childQuestion) return;

      const option = question.options?.find(opt => opt.id === cc.optionId);
      if (!option) return;

      let group = grouped.find(g => g.optionId === cc.optionId);
      if (!group) {
        group = { optionId: cc.optionId, optionText: option.text, questions: [] };
        grouped.push(group);
      }
      
      if (!group.questions.find(q => q.id === childQuestion.id)) {
        group.questions.push(childQuestion);
      }
    });

    return grouped;
  };

  const conditionalGroups = getConditionalQuestionsByOption();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`question-item ${question.isLocked ? 'locked' : ''} ${isDragging ? 'dragging' : ''}`}
    >
      <div className="question-header">
        <div className="question-drag-handle" {...attributes} {...listeners}>
          {!isReadOnly && !question.isLocked && '⋮⋮'}
        </div>
        <div className="question-content">
          <div className="question-top">
            <span className="question-order">#{question.order}</span>
            <span className="question-type">{question.type}</span>
            {question.isLocked && <span className="question-locked">{t('editor.locked')}</span>}
          </div>
          <div className="question-text">{question.text}</div>
          {question.options && question.options.length > 0 && (
            <div className="question-options-preview">
              {question.options.map((option, index) => {
                const optionId = option.id || `opt_${question.id}_${index}`;
                const group = conditionalGroups.find(g => g.optionId === optionId);
                return (
                  <div key={optionId} className="option-preview">
                    <span>{option.text}</span>
                    {group && group.questions.length > 0 && (
                      <span className="option-conditional-indicator">→ {group.questions.length}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {!isReadOnly && !question.isLocked && question.id && (
          <div className="question-actions">
            <button onClick={onEdit} className="btn btn-secondary">
              {t('common.edit')}
            </button>
            <button onClick={onDelete} className="btn btn-danger">
              {t('common.delete')}
            </button>
          </div>
        )}
      </div>
      
      {/* Vis conditional spørgsmål indlejret */}
      {conditionalGroups.length > 0 && (
        <div className="conditional-questions-container">
          {conditionalGroups.map((group) => (
            <div key={group.optionId} className="conditional-group">
              <div className="conditional-group-header">
                <span className="conditional-group-label">{t('editor.ifOption', { optionText: group.optionText })}</span>
              </div>
              <div className="conditional-questions-list">
                {group.questions.map((childQuestion) => (
                  <div key={childQuestion.id} className="conditional-question-item">
                    <div className="conditional-question-content">
                      <span className="conditional-question-order">#{childQuestion.order}</span>
                      <span className="conditional-question-text">{childQuestion.text}</span>
                      <span className="conditional-question-type">{childQuestion.type}</span>
                    </div>
                    {!isReadOnly && !question.isLocked && (
                      <div className="conditional-question-actions">
                        {onEditChild && (
                          <button
                            onClick={() => onEditChild(childQuestion)}
                            className="btn btn-secondary btn-small"
                          >
                            {t('common.edit')}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (question.id && childQuestion.id) {
                              onRemoveConditional(question.id, group.optionId, childQuestion.id);
                            }
                          }}
                          className="btn btn-danger btn-small"
                        >
                          {t('common.remove')}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortableQuestionItem;








