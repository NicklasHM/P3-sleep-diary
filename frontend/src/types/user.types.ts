export enum UserRole {
  BORGER = 'BORGER',
  RÅDGIVER = 'RÅDGIVER'
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  advisorId?: string;
  advisorName?: string;
}






