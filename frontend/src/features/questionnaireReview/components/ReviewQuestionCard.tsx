import React from 'react';
import type { Question } from '../../../types';
import { formatAnswer, getConditionalQuestionsForQuestion } from '../utils';
import ConditionalQuestionItem from './ConditionalQuestionItem';

interface ReviewQuestionCardProps {
  t: (key: string) => string;
  language: string;
  question: Question;
  answer: any;
  index: number;
  allQuestions: Question[];
  answers: Record<string, any>;
  onEdit: (questionId: string) => void;
}

const ReviewQuestionCard: React.FC<ReviewQuestionCardProps> = ({
  t,
  language,
  question,
  answer,
  index,
  allQuestions,
  answers,
  onEdit,
}) => {
  const questionText = language === 'en' && question.textEn 
    ? question.textEn 
    : question.textDa || question.text;

  const conditionalQuestions = getConditionalQuestionsForQuestion(question, allQuestions, answers);

  return (
    <div className="review-question-card">
      <div className="review-question-header">
        <span className="review-question-number">{index + 1}</span>
        <h3 className="review-question-text">{questionText}</h3>
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

      {conditionalQuestions.length > 0 && (
        <div className="review-conditional-questions">
          {conditionalQuestions.map((conditionalQuestion) => {
            const conditionalAnswer = answers[conditionalQuestion.id];
            return (
              <ConditionalQuestionItem
                key={conditionalQuestion.id}
                t={t}
                language={language}
                question={conditionalQuestion}
                answer={conditionalAnswer}
                allQuestions={allQuestions}
                answers={answers}
                onEdit={onEdit}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReviewQuestionCard;

