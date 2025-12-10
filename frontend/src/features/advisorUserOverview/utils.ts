import type { Question, Response } from '../../types';

// Re-export shared utilities from utils
export {
  parseTimeToMinutes,
  formatMinutesToTime,
  getSOLColor,
  getWASOColor,
  getTIBColor,
  getTSTColor,
  getActivityColor,
  getAlcoholColor,
  getDaylightColor,
  getColorClass,
  getAwakeningsColor,
  type ColorCode,
} from '../../utils/sleep-params';

export const findAnswerValueByQuestionText = (
  response: Response,
  questionText: string,
  questions: Map<string, Question>
): number | null => {
  const question = Array.from(questions.values()).find(q =>
    q.text.toLowerCase().includes(questionText.toLowerCase())
  );
  if (!question) return null;
  const answer = response.answers[question.id];
  if (answer === null || answer === undefined) return null;
  const numValue = typeof answer === 'number' ? answer : parseFloat(String(answer));
  return isNaN(numValue) ? null : numValue;
};

