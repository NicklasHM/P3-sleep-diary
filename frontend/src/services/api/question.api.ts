import api from './client';
import type { Question } from '../../types';

export const questionAPI = {
  getQuestion: async (id: string, language: string = 'da', includeDeleted: boolean = false): Promise<Question> => {
    const response = await api.get<Question>(`/questions/${id}?language=${language}&includeDeleted=${includeDeleted}`);
    return response.data;
  },

  getQuestions: async (questionnaireId: string, language: string = 'da', includeDeleted: boolean = false): Promise<Question[]> => {
    const response = await api.get<Question[]>(`/questions?questionnaireId=${questionnaireId}&language=${language}&includeDeleted=${includeDeleted}`);
    return response.data;
  },

  createQuestion: async (question: Question): Promise<Question> => {
    const response = await api.post<Question>('/questions', question);
    return response.data;
  },

  updateQuestion: async (id: string, question: Question): Promise<Question> => {
    const response = await api.put<Question>(`/questions/${id}`, question);
    return response.data;
  },

  deleteQuestion: async (id: string): Promise<void> => {
    await api.delete(`/questions/${id}`);
  },

  addConditionalChild: async (
    questionId: string,
    optionId: string,
    childQuestionId: string
  ): Promise<Question> => {
    const response = await api.post<Question>(
      `/questions/${questionId}/conditional`,
      { optionId, childQuestionId }
    );
    return response.data;
  },

  removeConditionalChild: async (
    questionId: string,
    optionId: string,
    childQuestionId: string
  ): Promise<Question> => {
    const response = await api.delete<Question>(
      `/questions/${questionId}/conditional`,
      { data: { optionId, childQuestionId } }
    );
    return response.data;
  },

  updateConditionalChildrenOrder: async (
    questionId: string,
    optionId: string,
    childQuestionIds: string[]
  ): Promise<Question> => {
    const response = await api.put<Question>(
      `/questions/${questionId}/conditional/order`,
      { optionId, childQuestionIds }
    );
    return response.data;
  },
};








