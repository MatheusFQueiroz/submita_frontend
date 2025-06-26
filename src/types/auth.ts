import { UserRole } from ".";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isFromIFPB?: boolean; // Atualizado para Biopark
  isActive: boolean;
  isFirstLogin?: boolean; // Flag para primeira senha
  createdAt: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
  isFirstLogin?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  isFromIFPB?: boolean; // Biopark
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface CreateEvaluatorRequest {
  name: string;
  email: string;
  temporaryPassword: string;
}
