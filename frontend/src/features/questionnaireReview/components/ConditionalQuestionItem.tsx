import React from 'react';
import type { Question } from '../../../types';
import { formatAnswer } from '../utils';

interface ConditionalQuestionItemProps {
  t: (key: string) => string;
  language: string;
  question: Question;
  answer: any;
  allQuestions: Question[];
  answers: Record<string, any>;
  onEdit: (questionId: string) => void;
}

const ConditionalQuestionItem: React.FC<ConditionalQuestionItemProps> = ({
  t,
  language,
  question,
  answer,
  onEdit,
}) => {
  const questionText = language === 'en' && question.textEn 
    ? question.textEn 
    : question.textDa || question.text;

  return (
    <div className="review-conditional-question">
      <div className="review-question-header">
        <h4 className="review-conditional-question-text">{questionText}</h4>
        <button
          onClick={() => onEdit(question.id)}
          className="btn btn-secondary btn-small"
        >
          {t('review.edit')}
        </button>
      </div>
      <div className="review-answer">
        <strong>{t('review.yourAnswer')}:</strong> {formatAnswer(question, answer, language, t)}
      </div>
    </div>
  );
};

export default ConditionalQuestionItem;

