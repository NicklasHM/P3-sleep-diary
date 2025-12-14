export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  CHECK_USERNAME: '/auth/check-username',
  
  // Questionnaires
  QUESTIONNAIRE: '/questionnaires',
  START_QUESTIONNAIRE: '/questionnaires/:type/start',
  
  // Questions
  QUESTIONS: '/questions',
  QUESTION: '/questions/:id',
  CONDITIONAL_CHILD: '/questions/:id/conditional',
  CONDITIONAL_CHILD_ORDER: '/questions/:id/conditional/order',
  
  // Responses
  RESPONSES: '/responses',
  NEXT_QUESTION: '/responses/next',
  CHECK_RESPONSE_TODAY: '/responses/check-today',
  
  // Users
  USERS_CITIZENS: '/users/citizens',
  USERS_ADVISORS: '/users/advisors',
  USER_ASSIGN_ADVISOR: '/users/:id/assign-advisor',
  USER_SLEEP_DATA: '/users/:id/sleep-data',
} as const;

export const API_BASE_URL = '/api';






