"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageLayout } from "@/components/layout/PageLayout";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PDFViewer } from "@/components/common/PDFViewer";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  FileText,
  User,
  Calendar,
  Download,
  Edit,
  Eye,
  MessageSquare,
  Star,
  Clock,
  Users,
  AlertTriangle,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useAuthContext } from "@/providers/AuthProvider";
import { Article, Evaluation } from "@/types";
import { ROUTES, formatDate, formatUserRole, USER_ROLES } from "@/lib/utils";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface ArticleDetailPageProps {
  params: { id: string };
}

export default function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { user } = useAuthContext();
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

  const {
    data: article,
    loading: articleLoading,
    execute: refetchArticle,
  } = useApi<Article>(() => api.get(`/articles/${params.id}`), {
    immediate: true,
  });

  const { data: evaluations, loading: evaluationsLoading } = useApi<
    Evaluation[]
  >(() => api.get(`/articles/${params.id}/evaluations`), { immediate: true });

  const isAuthor = user?.id === article?.userId;
  const isEvaluator = user?.role === USER_ROLES.EVALUATOR;
  const isCoordinator = user?.role === USER_ROLES.COORDINATOR;

  const handleWithdrawArticle = async () => {
    try {
      await api.delete(`/articles/${params.id}`);
      toast.success("Artigo retirado com sucesso!");
      window.location.href = ROUTES.ARTICLES;
    } catch (error: any) {
      toast.error(error.message || "Erro ao retirar artigo");
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const blob = await api.downloadFile(
        `/files/file/submita-pdfs?fileName=${article?.filePath}`
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${article?.title || "artigo"}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Erro ao baixar arquivo");
    }
  };

  if (articleLoading) {
    return (
      <AuthGuard>
        <PageLayout>
          <div className="flex justify-center py-8">
            <LoadingSpinner text="Carregando artigo..." />
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  if (!article) {
    return (
      <AuthGuard>
        <PageLayout>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900">
              Artigo não encontrado
            </h2>
            <p className="text-gray-600 mt-2">
              O artigo que você está procurando não existe ou foi removido.
            </p>
            <Button asChild className="mt-4">
              <Link href={ROUTES.ARTICLES}>Voltar para artigos</Link>
            </Button>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Artigos", href: "/artigos" },
    { label: article.title },
  ];

  const canEdit = isAuthor && article.status === "SUBMITTED";
  const canWithdraw =
    isAuthor && ["SUBMITTED", "UNDER_REVIEW"].includes(article.status);
  const canEvaluate = isEvaluator && article.status === "UNDER_REVIEW";

  return (
    <AuthGuard>
      <PageLayout
        title={article.title}
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex space-x-2">
            {article.filePath && (
              <Button variant="outline" onClick={handleDownloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            )}

            {canEdit && (
              <Button variant="outline" asChild>
                <Link href={ROUTES.ARTICLE_DETAILS(article.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </Button>
            )}

            {canEvaluate && (
              <Button asChild>
                <Link href={ROUTES.EVALUATE_ARTICLE(article.id)}>
                  <Star className="mr-2 h-4 w-4" />
                  Avaliar
                </Link>
              </Button>
            )}

            {canWithdraw && (
              <Button
                variant="destructive"
                onClick={() => setWithdrawDialogOpen(true)}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Retirar
              </Button>
            )}
          </div>
        }
      >
        <div className="space-y-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">
                <FileText className="mr-2 h-4 w-4" />
                Detalhes
              </TabsTrigger>
              <TabsTrigger value="document">
                <Eye className="mr-2 h-4 w-4" />
                Documento
              </TabsTrigger>
              <TabsTrigger value="evaluations">
                <Star className="mr-2 h-4 w-4" />
                Avaliações
              </TabsTrigger>
              <TabsTrigger value="history">
                <Clock className="mr-2 h-4 w-4" />
                Histórico
              </TabsTrigger>
            </TabsList>

            {/* Aba Detalhes */}
            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl">
                        {article.title}
                      </CardTitle>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <User className="mr-1 h-4 w-4" />
                          {article.user?.name}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          {formatDate(article.createdAt)}
                        </span>
                        <Badge variant="outline">
                          Versão {article.currentVersion}
                        </Badge>
                      </div>
                    </div>
                    <StatusBadge status={article.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Resumo */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Resumo</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>

                  <Separator />

                  {/* Palavras-chave */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Palavras-chave</h3>
                    <div className="flex flex-wrap gap-2">
                      {article.keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Autores Relacionados */}
                  {article.relatedAuthors &&
                    article.relatedAuthors.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="text-lg font-medium mb-3">
                            Co-autores
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {article.relatedAuthors.map((author, index) => (
                              <Badge key={index} variant="outline">
                                {author}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                  <Separator />

                  {/* Informações do Evento */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Evento</h3>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-start space-x-4">
                          {article.event?.banner && (
                            <img
                              src={article.event.imageUrl}
                              alt={article.event.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-medium">
                              {article.event?.name}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {article.event?.description}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>
                                Submissões:{" "}
                                {formatDate(article.event?.submissionStartDate)}{" "}
                                - {formatDate(article.event?.submissionEndDate)}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {article.event?.evaluationType === "DIRECT"
                                  ? "Avaliação Direta"
                                  : article.event?.evaluationType === "PAIR"
                                  ? "Avaliação por Pares"
                                  : "Painel"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Documento */}
            <TabsContent value="document">
              <Card>
                <CardHeader>
                  <CardTitle>Documento PDF</CardTitle>
                </CardHeader>
                <CardContent>
                  {article.filePath ? (
                    <PDFViewer
                      fileUrl={`/api/files/file/submita-pdfs?fileName=${article.filePath}`}
                      fileName={`${article.title}.pdf`}
                      className="min-h-96"
                    />
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="mx-auto h-12 w-12 mb-4" />
                      <p>Nenhum documento disponível</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Avaliações */}
            <TabsContent value="evaluations">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="mr-2 h-5 w-5" />
                    Avaliações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {evaluationsLoading ? (
                    <LoadingSpinner text="Carregando avaliações..." />
                  ) : evaluations && evaluations.length > 0 ? (
                    <div className="space-y-4">
                      {evaluations.map((evaluation, index) => (
                        <Card
                          key={evaluation.id}
                          className="border-l-4 border-l-primary"
                        >
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="font-medium">
                                  {evaluation.evaluator?.name ||
                                    "Avaliador Anônimo"}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {formatUserRole(
                                    evaluation.evaluator?.role || "EVALUATOR"
                                  )}
                                </p>
                              </div>
                              <div className="text-right">
                                {evaluation.grade && (
                                  <div className="text-lg font-bold text-primary">
                                    {evaluation.grade.toFixed(1)}/10
                                  </div>
                                )}
                                <p className="text-xs text-gray-500">
                                  {evaluation.evaluationDate
                                    ? formatDate(evaluation.evaluationDate)
                                    : "Em andamento"}
                                </p>
                              </div>
                            </div>

                            {evaluation.evaluationDescription && (
                              <div className="mt-3">
                                <h4 className="text-sm font-medium mb-2">
                                  Comentários:
                                </h4>
                                <p className="text-sm text-gray-700 bg-gray-50  p-3 rounded-md">
                                  {evaluation.evaluationDescription}
                                </p>
                              </div>
                            )}

                            {evaluation.status === "PENDING" && (
                              <Badge variant="outline" className="mt-3">
                                Avaliação Pendente
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Star className="mx-auto h-12 w-12 mb-4" />
                      <p>Nenhuma avaliação disponível ainda</p>
                      {article.status === "SUBMITTED" && (
                        <p className="text-sm mt-2">
                          O artigo está aguardando atribuição de avaliadores
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Histórico */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Histórico de Versões
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 border rounded-lg bg-blue-50">
                      <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {article.currentVersion}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Versão Atual</p>
                        <p className="text-sm text-gray-600">
                          Submetido em {formatDate(article.createdAt)}
                        </p>
                      </div>
                      <StatusBadge status={article.status} />
                    </div>

                    {/* Versões anteriores seriam listadas aqui */}
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">
                        Histórico completo de versões em desenvolvimento
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Dialog de Confirmação de Retirada */}
          <ConfirmDialog
            open={withdrawDialogOpen}
            onOpenChange={setWithdrawDialogOpen}
            title="Retirar Artigo"
            description="Tem certeza que deseja retirar este artigo? Esta ação não pode ser desfeita e o artigo será removido permanentemente do evento."
            confirmText="Retirar Artigo"
            cancelText="Cancelar"
            variant="destructive"
            onConfirm={handleWithdrawArticle}
          />
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
