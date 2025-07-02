"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageLayout } from "@/components/layout/PageLayout";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  FileText,
  Search,
  Users,
  Eye,
  Download,
  UserCheck,
  BarChart3,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useDebounce } from "@/hooks/useDebounce";
import { Article, Event, User } from "@/types";
import { ROUTES, formatDate, USER_ROLES } from "@/lib/utils";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface EventArticlesPageProps {
  params: Promise<{ id: string }>;
}

export default function EventArticlesPage({ params }: EventArticlesPageProps) {
  const { id } = React.use(params);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedEvaluatorIds, setSelectedEvaluatorIds] = useState<string[]>(
    []
  );
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Busca informações do evento
  const { data: event, loading: eventLoading } = useApi<Event>(
    () => api.get(`/events/${id}`),
    { immediate: true }
  );

  // Busca artigos do evento
  const {
    data: articles,
    loading: articlesLoading,
    execute: refetchArticles,
  } = useApi<Article[]>(
    () => {
      const params_query = new URLSearchParams();
      if (debouncedSearch) params_query.append("search", debouncedSearch);
      if (statusFilter !== "all") params_query.append("status", statusFilter);

      return api.get(`/events/${id}/articles?${params_query.toString()}`);
    },
    {
      immediate: true,
    }
  );

  // Busca avaliadores do evento
  const { data: evaluators, loading: evaluatorsLoading } = useApi<User[]>(
    () => api.get(`/events/${id}/evaluators`),
    { immediate: true }
  );

  const handleAssignEvaluators = async () => {
    if (!selectedArticle) return;

    try {
      await api.post(`/articles/${selectedArticle.id}/evaluators`, {
        evaluatorIds: selectedEvaluatorIds,
      });

      toast.success("Avaliadores atribuídos com sucesso!");
      setAssignDialogOpen(false);
      setSelectedArticle(null);
      setSelectedEvaluatorIds([]);
      refetchArticles();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atribuir avaliadores");
    }
  };

  if (eventLoading) {
    return (
      <AuthGuard requiredRoles={[USER_ROLES.COORDINATOR]}>
        <PageLayout>
          <div className="flex justify-center py-8">
            <LoadingSpinner text="Carregando evento..." />
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  const breadcrumbs = [
    { label: "Eventos", href: "/eventos" },
    { label: event?.name || "Evento", href: ROUTES.EVENT_DETAILS(id) },
    { label: "Artigos" },
  ];

  const articleColumns = [
    {
      key: "title",
      title: "Título",
      render: (value: string, article: Article) => (
        <div>
          <Link
            href={ROUTES.ARTICLE_DETAILS(article.id)}
            className="font-medium text-primary hover:underline"
          >
            {value}
          </Link>
          <p className="text-sm text-gray-500 mt-1">por {article.user?.name}</p>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      key: "submittedAt",
      title: "Data de Submissão",
      render: (value: string) => formatDate(value),
    },
    {
      key: "evaluators",
      title: "Avaliadores",
      render: (value: User[], article: Article) => (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {value?.length || 0} atribuído(s)
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedArticle(article);
              setSelectedEvaluatorIds(
                value?.map((evaluator) => evaluator.id) || []
              );
              setAssignDialogOpen(true);
            }}
          >
            <UserCheck className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
    {
      key: "actions",
      title: "Ações",
      render: (_: any, article: Article) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={ROUTES.ARTICLE_DETAILS(article.id)}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {article.filePath && (
            <Button variant="ghost" size="sm" asChild>
              <a
                href={article.filePath}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AuthGuard requiredRoles={[USER_ROLES.COORDINATOR]}>
      <PageLayout breadcrumbs={breadcrumbs}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Artigos do Evento
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie os artigos submetidos para este evento
              </p>
            </div>
            <Button asChild>
              <Link href={ROUTES.EVENT_EVALUATORS(id)}>
                <Users className="mr-2 h-4 w-4" />
                Gerenciar Avaliadores
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Artigos
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {articles?.length || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Em Avaliação
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {articles?.filter((a) => a.status === "UNDER_REVIEW")
                    .length || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {articles?.filter((a) => a.status === "APPROVED").length || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {articles?.filter((a) => a.status === "SUBMITTED").length ||
                    0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar artigos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="SUBMITTED">Submetidos</SelectItem>
                    <SelectItem value="UNDER_REVIEW">Em Avaliação</SelectItem>
                    <SelectItem value="APPROVED">Aprovados</SelectItem>
                    <SelectItem value="REJECTED">Rejeitados</SelectItem>
                    <SelectItem value="APPROVED_WITH_CORRECTIONS">
                      Aprovados com Correções
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Articles Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Artigos</CardTitle>
            </CardHeader>
            <CardContent>
              {articlesLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner text="Carregando artigos..." />
                </div>
              ) : articles && articles.length > 0 ? (
                <DataTable data={articles} columns={articleColumns} />
              ) : (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum artigo encontrado
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm || statusFilter !== "all"
                      ? "Nenhum artigo corresponde aos filtros aplicados."
                      : "Ainda não há artigos submetidos para este evento."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assign Evaluators Dialog */}
          <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Atribuir Avaliadores</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {selectedArticle && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">{selectedArticle.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      por {selectedArticle.user?.name}
                    </p>
                  </div>
                )}

                {evaluatorsLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner text="Carregando avaliadores..." />
                  </div>
                ) : evaluators && evaluators.length > 0 ? (
                  <>
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {evaluators.map((evaluator) => (
                        <div
                          key={evaluator.id}
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            id={evaluator.id}
                            checked={selectedEvaluatorIds.includes(
                              evaluator.id
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEvaluatorIds([
                                  ...selectedEvaluatorIds,
                                  evaluator.id,
                                ]);
                              } else {
                                setSelectedEvaluatorIds(
                                  selectedEvaluatorIds.filter(
                                    (id) => id !== evaluator.id
                                  )
                                );
                              }
                            }}
                            className="rounded"
                          />
                          <label
                            htmlFor={evaluator.id}
                            className="flex-1 cursor-pointer"
                          >
                            <div>
                              <p className="font-medium">{evaluator.name}</p>
                              <p className="text-sm text-gray-500">
                                {evaluator.email}
                              </p>
                            </div>
                          </label>
                          <Badge
                            variant={
                              evaluator.isFromBpk ? "default" : "outline"
                            }
                          >
                            {evaluator.isFromBpk ? "Biopark" : "Externa"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAssignDialogOpen(false);
                          setSelectedArticle(null);
                          setSelectedEvaluatorIds([]);
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleAssignEvaluators}
                        disabled={selectedEvaluatorIds.length === 0}
                      >
                        Atribuir {selectedEvaluatorIds.length} avaliador(es)
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="mx-auto h-12 w-12 mb-4" />
                    <p>Nenhum avaliador disponível para este evento</p>
                    <Button asChild className="mt-4">
                      <Link href={ROUTES.EVENT_EVALUATORS(id)}>
                        Adicionar Avaliadores
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
