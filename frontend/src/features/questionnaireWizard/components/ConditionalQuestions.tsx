import React from 'react';
import type { Question } from '../../../types';
import QuestionInput from '../../../features/questionInput/components/QuestionInput';

type ConditionalQuestionsProps = {
  questions: Question[];
  answers: Record<string, any>;
  allQuestions: Question[];
  onAnswer: (questionId: string, value: any) => void;
  language: string;
  questionnaireType?: string;
};

const ConditionalQuestions: React.FC<ConditionalQuestionsProps> = ({
  questions,
  answers,
  allQuestions,
  onAnswer,
  language,
  questionnaireType
}) => {
  if (questions.length === 0) return null;

  return (
    <div className="conditional-questions-container">
      {questions.map((conditionalQuestion) => (
        <div key={conditionalQuestion.id} className="conditional-question">
          <h3 className="conditional-question-text">
            {language === 'en' && conditionalQuestion.textEn
              ? conditionalQuestion.textEn
              : conditionalQuestion.textDa || conditionalQuestion.text}
          </h3>
          <div className="conditional-input-container">
            <QuestionInput
              question={conditionalQuestion}
              value={answers[conditionalQuestion.id]}
              onChange={(value) => onAnswer(conditionalQuestion.id, value)}
              allQuestions={allQuestions}
              answers={answers}
              questionnaireType={questionnaireType}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConditionalQuestions;

