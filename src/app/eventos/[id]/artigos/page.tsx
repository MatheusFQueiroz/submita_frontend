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
  params: { id: string };
}

export default function EventArticlesPage({ params }: EventArticlesPageProps) {
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
    () => api.get(`/events/${params.id}`),
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

      return api.get(
        `/events/${params.id}/articles?${params_query.toString()}`
      );
    },
    {
      immediate: true,
    }
  );

  // Busca avaliadores do evento
  const { data: evaluators, loading: evaluatorsLoading } = useApi<User[]>(
    () => api.get(`/events/${params.id}/evaluators`),
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
    { label: "Dashboard", href: "/dashboard" },
    { label: "Eventos", href: "/eventos" },
    { label: event?.name || "Evento", href: ROUTES.EVENT_DETAILS(params.id) },
    { label: "Artigos" },
  ];

  const articleColumns = [
    {
      key: "title",
      title: "Título",
      render: (value: string, article: Article) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-sm text-gray-500">
            Por {article.user?.name} • Versão {article.currentVersion}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (_: any, article: Article) => (
        <StatusBadge status={article.status} />
      ),
    },
    {
      key: "evaluations",
      title: "Avaliações",
      render: (_: any, article: Article) => (
        <div className="text-sm">
          <span className="font-medium">
            {article.evaluations?.filter((e) => e.status === "COMPLETED")
              .length || 0}
            /{article.evaluations?.length || 0}
          </span>
          <p className="text-gray-500">concluídas</p>
        </div>
      ),
    },
    {
      key: "submissionDate",
      title: "Data de Submissão",
      render: (_: any, article: Article) => (
        <span className="text-sm">{formatDate(article.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      title: "Ações",
      render: (_: any, article: Article) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={ROUTES.ARTICLE_DETAILS(article.id)}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedArticle(article);
              setAssignDialogOpen(true);
            }}
          >
            <UserCheck className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Estatísticas dos artigos
  const stats = {
    total: articles?.length || 0,
    submitted: articles?.filter((a) => a.status === "SUBMITTED").length || 0,
    underReview:
      articles?.filter((a) => a.status === "UNDER_REVIEW").length || 0,
    approved: articles?.filter((a) => a.status === "APPROVED").length || 0,
    rejected: articles?.filter((a) => a.status === "REJECTED").length || 0,
  };

  return (
    <AuthGuard requiredRoles={[USER_ROLES.COORDINATOR]}>
      <PageLayout title={`Artigos - ${event?.name}`} breadcrumbs={breadcrumbs}>
        <div className="space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Submetidos
                </CardTitle>
                <Badge className="bg-blue-100 text-blue-800">
                  {stats.submitted}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.submitted}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Em Avaliação
                </CardTitle>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {stats.underReview}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.underReview}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
                <Badge className="bg-green-100 text-green-800">
                  {stats.approved}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.approved}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Rejeitados
                </CardTitle>
                <Badge className="bg-red-100 text-red-800">
                  {stats.rejected}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats.rejected}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar artigos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="SUBMITTED">Submetido</SelectItem>
                    <SelectItem value="UNDER_REVIEW">Em Avaliação</SelectItem>
                    <SelectItem value="APPROVED">Aprovado</SelectItem>
                    <SelectItem value="REJECTED">Rejeitado</SelectItem>
                    <SelectItem value="APPROVED_WITH_CORRECTIONS">
                      Com Correções
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Artigos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Artigos Submetidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={articles || []}
                columns={articleColumns}
                loading={articlesLoading}
                emptyMessage="Nenhum artigo submetido ainda"
                emptyIcon={FileText}
              />
            </CardContent>
          </Card>

          {/* Dialog de Atribuição de Avaliadores */}
          <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Atribuir Avaliadores</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {selectedArticle && (
                  <div className="p-4 bg-gray-50  rounded-lg">
                    <h3 className="font-medium">{selectedArticle.title}</h3>
                    <p className="text-sm text-gray-600">
                      Por {selectedArticle.user?.name}
                    </p>
                  </div>
                )}

                {evaluatorsLoading ? (
                  <LoadingSpinner text="Carregando avaliadores..." />
                ) : evaluators && evaluators.length > 0 ? (
                  <>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {evaluators.map((evaluator) => (
                        <div
                          key={evaluator.id}
                          className="flex items-center space-x-3 p-3 border rounded-lg"
                        >
                          <input
                            type="checkbox"
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
                          <div className="flex-1">
                            <p className="font-medium">{evaluator.name}</p>
                            <p className="text-sm text-gray-500">
                              {evaluator.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end space-x-2">
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
                      <Link href={ROUTES.EVENT_EVALUATORS(params.id)}>
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
