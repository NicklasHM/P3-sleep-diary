import api from './client';
import type { Questionnaire } from '../../types';

export const questionnaireAPI = {
  getQuestionnaire: async (type: string): Promise<Questionnaire> => {
    const response = await api.get<Questionnaire>(`/questionnaires/${type}`);
    return response.data;
  },

  startQuestionnaire: async (type: string, language: string = 'da'): Promise<any[]> => {
    const response = await api.get<any[]>(`/questionnaires/${type}/start?language=${language}`);
    return response.data;
  },
};






