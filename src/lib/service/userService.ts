import { api } from "@/lib/api";
import { User } from "@/types";

export const userService = {
  // Listar usuários (coordenador)
  async getUsers(params?: { search?: string; role?: string }): Promise<User[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append("search", params.search);
    if (params?.role) searchParams.append("role", params.role);

    return api.get<User[]>(`/users?${searchParams.toString()}`);
  },

  // Listar avaliadores
  async getEvaluators(): Promise<User[]> {
    return api.get<User[]>("/users/evaluators");
  },

  // Buscar usuário por ID
  async getUserById(id: string): Promise<User> {
    return api.get<User>(`/users/${id}`);
  },

  // Atualizar usuário
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return api.put<User>(`/users/${id}`, data);
  },

  // Deletar usuário
  async deleteUser(id: string): Promise<void> {
    return api.delete(`/users/${id}`);
  },

  // Ativar/Desativar usuário
  async toggleUserStatus(id: string): Promise<User> {
    return api.patch<User>(`/users/${id}/toggle-status`);
  },
};
