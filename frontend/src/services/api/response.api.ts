import api from './client';
import type { Response, ResponseRequest, NextQuestionRequest, Question } from '../../types';

export const responseAPI = {
  saveResponse: async (data: ResponseRequest): Promise<Response> => {
    const response = await api.post<Response>('/responses', data);
    return response.data;
  },

  getNextQuestion: async (data: NextQuestionRequest, language: string = 'da'): Promise<Question | null> => {
    try {
      const response = await api.post<Question>(`/responses/next?language=${language}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 204) {
        return null;
      }
      // Hvis backend returnerer en valideringsfejl, kast den videre med fejlbeskeden
      if (error.response?.data?.error) {
        const validationError = new Error(error.response.data.error);
        (validationError as any).response = error.response;
        throw validationError;
      }
      throw error;
    }
  },

  getResponses: async (userId: string, questionnaireId?: string): Promise<Response[]> => {
    const params = new URLSearchParams({ userId });
    if (questionnaireId) {
      params.append('questionnaireId', questionnaireId);
    }
    const response = await api.get<Response[]>(`/responses?${params.toString()}`);
    return response.data;
  },

  checkResponseForToday: async (questionnaireType: string): Promise<{ hasResponse: boolean }> => {
    const response = await api.get<{ hasResponse: boolean }>(
      `/responses/check-today?questionnaireType=${questionnaireType}`
    );
    return response.data;
  },
};






