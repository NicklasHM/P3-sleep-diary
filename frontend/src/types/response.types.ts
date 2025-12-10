import { QuestionnaireType } from './questionnaire.types';

export interface SleepParameters {
  SOL: number;
  WASO: number;
  TIB: number;
  TST: number;
}

export interface Response {
  id: string;
  userId: string;
  questionnaireId: string;
  questionnaireType?: QuestionnaireType;
  answers: Record<string, any>;
  sleepParameters?: SleepParameters;
  createdAt: Date;
}

export interface ResponseRequest {
  questionnaireId: string;
  answers: Record<string, any>;
}

export interface NextQuestionRequest {
  questionnaireId: string;
  currentQuestionId: string;
  currentAnswers: Record<string, any>;
}

