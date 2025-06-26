import { api } from "@/lib/api";
import { Event, User, Article } from "@/types";

interface CreateEventRequest {
  title: string;
  description: string;
  imageUrl?: string;
  submissionStartDate: Date;
  submissionEndDate: Date;
  evaluationType: "DIRECT" | "PAIR" | "PANEL";
}

export const eventService = {
  // Listar eventos
  async getEvents(params?: {
    search?: string;
    status?: string;
  }): Promise<Event[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append("search", params.search);
    if (params?.status) searchParams.append("status", params.status);

    return api.get<Event[]>(`/events?${searchParams.toString()}`);
  },

  // Buscar evento por ID
  async getEventById(id: string): Promise<Event> {
    return api.get<Event>(`/events/${id}`);
  },

  // Criar evento
  async createEvent(data: CreateEventRequest): Promise<Event> {
    return api.post<Event>("/events", data);
  },

  // Atualizar evento
  async updateEvent(
    id: string,
    data: Partial<CreateEventRequest>
  ): Promise<Event> {
    return api.put<Event>(`/events/${id}`, data);
  },

  // Deletar evento
  async deleteEvent(id: string): Promise<void> {
    return api.delete(`/events/${id}`);
  },

  // Buscar avaliadores do evento
  async getEventEvaluators(eventId: string): Promise<User[]> {
    return api.get<User[]>(`/events/${eventId}/evaluators`);
  },

  // Adicionar avaliadores ao evento
  async addEvaluatorsToEvent(
    eventId: string,
    evaluatorIds: string[]
  ): Promise<void> {
    return api.post(`/events/${eventId}/evaluators`, { evaluatorIds });
  },

  // Remover avaliador do evento
  async removeEvaluatorFromEvent(
    eventId: string,
    evaluatorId: string
  ): Promise<void> {
    return api.delete(`/events/${eventId}/evaluators/${evaluatorId}`);
  },

  // Buscar artigos do evento
  async getEventArticles(
    eventId: string,
    params?: { search?: string; status?: string }
  ): Promise<Article[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append("search", params.search);
    if (params?.status) searchParams.append("status", params.status);

    return api.get<Article[]>(
      `/events/${eventId}/articles?${searchParams.toString()}`
    );
  },

  // Adicionar checklist ao evento
  async addChecklistToEvent(
    eventId: string,
    checklistId: string
  ): Promise<void> {
    return api.patch(`/events/${eventId}/checklist`, { checklistId });
  },
};
