import React from 'react';
import type { Question } from '../../../types';

type WizardProgressProps = {
  questions: Question[];
  currentQuestion: Question;
  answers: Record<string, any>;
  validateAnswer: (answer: any, question: Question) => boolean;
  getConditionalChildQuestionIds: () => Set<string>;
  questionHistory: string[];
  navigateToQuestion: (id: string) => void;
  t: (key: string, vars?: Record<string, any>) => string;
};

const WizardProgress: React.FC<WizardProgressProps> = ({
  questions,
  currentQuestion,
  answers,
  validateAnswer,
  getConditionalChildQuestionIds,
  questionHistory,
  navigateToQuestion,
  t
}) => {
  const conditionalChildIds = getConditionalChildQuestionIds();
  const isCurrentQuestionConditional = conditionalChildIds.has(currentQuestion.id);

  const isQuestionCurrent = (question: Question) => {
    if (!isCurrentQuestionConditional) {
      return question.id === currentQuestion.id;
    }
    for (const mainQuestion of questions) {
      if (mainQuestion.conditionalChildren) {
        const hasThisConditional = mainQuestion.conditionalChildren.some((cc) => cc.childQuestionId === currentQuestion.id);
        if (hasThisConditional) {
          return question.id === mainQuestion.id;
        }
      }
    }
    return false;
  };

  const currentIndex = questions.findIndex((q) => isQuestionCurrent(q));

  return (
    <div className="wizard-progress-container">
      <div className="wizard-progress-steps">
        {questions.map((question, index) => {
          const isAnswered = validateAnswer(answers[question.id], question);
          const isCurrent = isQuestionCurrent(question);
          const questionIndex = questions.findIndex((q) => q.id === question.id);
          const isClickable = isAnswered || questionIndex <= currentIndex || questionHistory.includes(question.id);
          const isBeforeCurrent = questionIndex < currentIndex;

          return (
            <div
              key={question.id}
              className={`progress-step ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''} ${isClickable ? 'clickable' : ''} ${isBeforeCurrent ? 'before-current' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isClickable) {
                  navigateToQuestion(question.id);
                }
              }}
              title={isClickable ? t('questionnaire.clickToNavigate', { number: index + 1 }) : t('questionnaire.mustAnswerPrevious')}
            >
              <span className="progress-step-number">{index + 1}</span>
              <div className="progress-step-dot" />
              {index < questions.length - 1 && <div className="progress-step-line" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WizardProgress;








