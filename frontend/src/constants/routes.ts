export const ROUTES = {
  LOGIN: '/login',
  CITIZEN_DASHBOARD: '/citizen',
  CITIZEN_QUESTIONNAIRE: '/citizen/questionnaire',
  CITIZEN_QUESTIONNAIRE_REVIEW: '/citizen/questionnaire/review',
  ADVISOR_DASHBOARD: '/advisor',
  ADVISOR_USERS: '/advisor/users',
  ADVISOR_QUESTIONNAIRE: '/advisor/questionnaire',
  ROOT: '/',
} as const;

export type RoutePath = typeof ROUTES[keyof typeof ROUTES];








