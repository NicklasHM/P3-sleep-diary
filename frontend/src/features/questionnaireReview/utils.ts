import type { Question } from '../../types';

export const formatAnswer = (
  question: Question,
  answer: any,
  language: string,
  t: (key: string) => string
): string => {
  if (answer === undefined || answer === null || answer === '') {
    return t('review.noAnswer');
  }

  switch (question.type) {
    case 'text':
      return answer.toString();

    case 'time_picker':
      return answer.toString();

    case 'numeric':
      return answer.toString();

    case 'slider':
      return answer.toString();

    case 'multiple_choice':
      if (typeof answer === 'object' && answer.optionId) {
        const option = question.options?.find(opt => opt.id === answer.optionId);
        if (option) {
          const optionText = language === 'en' && option.textEn ? option.textEn : option.textDa || option.text;
          if (option.isOther && answer.customText) {
            return `${optionText}: ${answer.customText}`;
          }
          return optionText;
        }
      } else if (answer) {
        const option = question.options?.find(opt => opt.id === answer);
        if (option) {
          return language === 'en' && option.textEn ? option.textEn : option.textDa || option.text;
        }
      }
      return answer.toString();

    case 'multiple_choice_multiple':
      if (Array.isArray(answer)) {
        return answer.map((val: any) => {
          if (typeof val === 'object' && val.optionId) {
            const option = question.options?.find(opt => opt.id === val.optionId);
            if (option) {
              const optionText = language === 'en' && option.textEn ? option.textEn : option.textDa || option.text;
              if (option.isOther && val.customText) {
                return `${optionText}: ${val.customText}`;
              }
              return optionText;
            }
          } else if (val) {
            const option = question.options?.find(opt => opt.id === val);
            if (option) {
              return language === 'en' && option.textEn ? option.textEn : option.textDa || option.text;
            }
          }
          return val.toString();
        }).join(', ');
      }
      return answer.toString();

    default:
      return answer.toString();
  }
};

export const getConditionalChildQuestionIds = (allQuestions: Question[]): Set<string> => {
  const conditionalChildIds = new Set<string>();
  for (const question of allQuestions) {
    if (question.conditionalChildren && question.conditionalChildren.length > 0) {
      question.conditionalChildren.forEach(cc => {
        if (cc.childQuestionId) {
          conditionalChildIds.add(cc.childQuestionId);
        }
      });
    }
  }
  return conditionalChildIds;
};

export const getRelevantQuestions = (allQuestions: Question[]): Question[] => {
  if (allQuestions.length === 0) return [];
  const conditionalChildIds = getConditionalChildQuestionIds(allQuestions);
  const mainQuestions = allQuestions.filter(q => q.id && !conditionalChildIds.has(q.id));
  return mainQuestions.sort((a, b) => (a.order || 0) - (b.order || 0));
};

export const getConditionalQuestionsForQuestion = (
  question: Question,
  allQuestions: Question[],
  answers: Record<string, any>
): Question[] => {
  if (!question.conditionalChildren || question.conditionalChildren.length === 0) {
    return [];
  }

  const answer = answers[question.id];
  if (!answer) return [];

  // Ekstraher option IDs fra answer
  let selectedOptionIds: string[] = [];
  if (Array.isArray(answer)) {
    selectedOptionIds = answer.map((val: any) => 
      typeof val === 'object' && val?.optionId ? val.optionId : val
    );
  } else if (typeof answer === 'object' && answer?.optionId) {
    selectedOptionIds = [answer.optionId];
  } else if (answer) {
    selectedOptionIds = [answer];
  }

  const matchingConditionals = question.conditionalChildren.filter(
    cc => selectedOptionIds.includes(cc.optionId)
  );

  if (matchingConditionals.length === 0) return [];

  // Hent conditional questions
  const conditionalQuestions: Question[] = [];
  matchingConditionals.forEach(cc => {
    const conditionalQuestion = allQuestions.find(q => q.id === cc.childQuestionId);
    if (conditionalQuestion) {
      conditionalQuestions.push(conditionalQuestion);
    }
  });

  return conditionalQuestions.sort((a, b) => (a.order || 0) - (b.order || 0));
};








