export interface ApiUser {
  id: number;
  email: string;
  roles: string[];
}

export interface User extends ApiUser {}
