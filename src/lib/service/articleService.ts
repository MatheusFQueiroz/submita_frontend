import { api } from "@/lib/api";
import { Article, Evaluation } from "@/types";

interface CreateArticleRequest {
  title: string;
  abstract: string;
  keywords: string[];
  relatedAuthors: string[];
  eventId: string;
  filePath: string;
}

export const articleService = {
  // Listar artigos
  async getArticles(params?: {
    search?: string;
    status?: string;
    userId?: string;
  }): Promise<Article[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append("search", params.search);
    if (params?.status) searchParams.append("status", params.status);
    if (params?.userId) searchParams.append("userId", params.userId);

    return api.get<Article[]>(`/articles?${searchParams.toString()}`);
  },

  // Buscar artigo por ID
  async getArticleById(id: string): Promise<Article> {
    return api.get<Article>(`/articles/${id}`);
  },

  // Submeter artigo
  async submitArticle(data: CreateArticleRequest): Promise<Article> {
    return api.post<Article>("/articles", data);
  },

  // Atualizar artigo
  async updateArticle(
    id: string,
    data: Partial<CreateArticleRequest>
  ): Promise<Article> {
    return api.put<Article>(`/articles/${id}`, data);
  },

  // Deletar/Retirar artigo
  async deleteArticle(id: string): Promise<void> {
    return api.delete(`/articles/${id}`);
  },

  // Buscar avaliações do artigo
  async getArticleEvaluations(articleId: string): Promise<Evaluation[]> {
    return api.get<Evaluation[]>(`/articles/${articleId}/evaluations`);
  },

  // Atribuir avaliadores ao artigo
  async assignEvaluators(
    articleId: string,
    evaluatorIds: string[]
  ): Promise<void> {
    return api.post(`/articles/${articleId}/evaluators`, { evaluatorIds });
  },

  // Remover avaliador do artigo
  async removeEvaluator(articleId: string, evaluatorId: string): Promise<void> {
    return api.delete(`/articles/${articleId}/evaluators/${evaluatorId}`);
  },

  // Download do PDF
  async downloadPDF(filePath: string): Promise<Blob> {
    return api.downloadFile(`/files/file/submita-pdfs?fileName=${filePath}`);
  },
};
