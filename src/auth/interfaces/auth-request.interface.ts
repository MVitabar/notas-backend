import { Request } from 'express';

export interface AuthUser {
  userId: string;
  email: string;
  rol: string;
  requiresPasswordChange: boolean;
}

export interface AuthRequest extends Request {
  user: AuthUser;
}
