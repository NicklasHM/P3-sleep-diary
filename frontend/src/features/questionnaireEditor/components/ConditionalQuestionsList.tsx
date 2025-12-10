import React from 'react';
import type { Question, ConditionalChild } from '../../../types';

interface ConditionalQuestionsListProps {
  conditionalChildren: ConditionalChild[];
  allQuestions: Question[];
  onRemove: (optionId: string, childQuestionId: string) => void;
}

const ConditionalQuestionsList: React.FC<ConditionalQuestionsListProps> = ({
  conditionalChildren,
  allQuestions,
  onRemove,
}) => {
  if (conditionalChildren.length === 0) {
    return null;
  }

  return (
    <div className="conditional-list">
      {conditionalChildren.map((cc) => {
        const childQ = allQuestions.find((q) => q.id === cc.childQuestionId);
        return (
          <div key={cc.childQuestionId} className="conditional-item">
            <span>→ #{childQ?.order} - {childQ?.text}</span>
            <button
              onClick={() => onRemove(cc.optionId, cc.childQuestionId)}
              className="btn-remove-small"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ConditionalQuestionsList;

