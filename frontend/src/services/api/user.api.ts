import api from './client';
import type { User, SleepParameters } from '../../types';

export const userAPI = {
  getAllCitizens: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users/citizens');
    return response.data;
  },

  getAllAdvisors: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users/advisors');
    return response.data;
  },

  assignAdvisor: async (citizenId: string, advisorId: string | null): Promise<User> => {
    const response = await api.put<User>(`/users/${citizenId}/assign-advisor`, { advisorId });
    return response.data;
  },

  getSleepData: async (userId: string): Promise<{
    sleepData: Array<{
      responseId: string;
      createdAt: Date;
      sleepParameters: SleepParameters;
    }>;
  }> => {
    const response = await api.get(`/users/${userId}/sleep-data`);
    return response.data;
  },
};

