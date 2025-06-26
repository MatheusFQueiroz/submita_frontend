import { api } from "@/lib/api";
import { Checklist, Question } from "@/types";

interface CreateChecklistRequest {
  title: string;
  description?: string;
  questions: {
    text: string;
    type: "BOOLEAN" | "TEXT" | "SCALE" | "MULTIPLE_CHOICE";
    isRequired: boolean;
    options?: string[];
  }[];
}

export const checklistService = {
  // Listar checklists
  async getChecklists(params?: { search?: string }): Promise<Checklist[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append("search", params.search);

    return api.get<Checklist[]>(`/checklists?${searchParams.toString()}`);
  },

  // Buscar checklist por ID
  async getChecklistById(id: string): Promise<Checklist> {
    return api.get<Checklist>(`/checklists/${id}`);
  },

  // Criar checklist
  async createChecklist(data: CreateChecklistRequest): Promise<Checklist> {
    return api.post<Checklist>("/checklists", data);
  },

  // Atualizar checklist
  async updateChecklist(
    id: string,
    data: Partial<CreateChecklistRequest>
  ): Promise<Checklist> {
    return api.put<Checklist>(`/checklists/${id}`, data);
  },

  // Deletar checklist
  async deleteChecklist(id: string): Promise<void> {
    return api.delete(`/checklists/${id}`);
  },

  // Buscar perguntas do checklist de um evento
  async getEventChecklistQuestions(eventId: string): Promise<Question[]> {
    return api.get<Question[]>(`/events/${eventId}/checklist/questions`);
  },
};
