"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageLayout } from "@/components/layout/PageLayout";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  Calendar,
  Clock,
  FileText,
  Users,
  Settings,
  Upload,
  BarChart3,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useAuthContext } from "@/providers/AuthProvider";
import { Event, Article } from "@/types";
import { ROUTES, formatDate, formatDateTime, USER_ROLES } from "@/lib/utils";
import { api } from "@/lib/api";

interface EventDetailPageProps {
  params: { id: string };
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const { user } = useAuthContext();

  const { data: event, loading: eventLoading } = useApi<Event>(
    () => api.get(`/events/${params.id}`),
    { immediate: true }
  );

  const { data: articles, loading: articlesLoading } = useApi<Article[]>(
    () => api.get(`/events/${params.id}/articles`),
    { immediate: true }
  );

  const { data: eventStats, loading: statsLoading } = useApi<any>(
    () => api.get(`/dashboard/coordinator/articles/${params.id}`),
    { immediate: true }
  );

  if (eventLoading) {
    return (
      <AuthGuard>
        <PageLayout>
          <div className="flex justify-center py-8">
            <LoadingSpinner text="Carregando evento..." />
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  if (!event) {
    return (
      <AuthGuard>
        <PageLayout>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Evento não encontrado
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              O evento que você está procurando não existe ou foi removido.
            </p>
            <Button asChild className="mt-4">
              <Link href={ROUTES.EVENTS}>Voltar para eventos</Link>
            </Button>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Eventos", href: "/eventos" },
    { label: event.title },
  ];

  const now = new Date();
  const startDate = new Date(event.submissionStartDate);
  const endDate = new Date(event.submissionEndDate);

  const isActive = now >= startDate && now <= endDate;
  const isUpcoming = now < startDate;
  const isFinished = now > endDate;

  const getEventStatus = () => {
    if (isUpcoming)
      return {
        label: "Em breve",
        color: "bg-blue-100 text-blue-800",
        icon: Clock,
      };
    if (isActive)
      return {
        label: "Ativo",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      };
    return {
      label: "Finalizado",
      color: "bg-gray-100 text-gray-800",
      icon: AlertCircle,
    };
  };

  const status = getEventStatus();

  const canSubmit = user?.role === USER_ROLES.STUDENT && isActive;

  return (
    <AuthGuard>
      <PageLayout
        title={event.title}
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex space-x-2">
            {canSubmit && (
              <Button asChild>
                <Link href={ROUTES.SUBMIT_ARTICLE}>
                  <Upload className="mr-2 h-4 w-4" />
                  Submeter Artigo
                </Link>
              </Button>
            )}

            <RoleGuard allowedRoles={[USER_ROLES.COORDINATOR]}>
              <Button variant="outline" asChild>
                <Link href={ROUTES.EVENT_ARTICLES(event.id)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Ver Artigos
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={ROUTES.EVENT_EVALUATORS(event.id)}>
                  <Users className="mr-2 h-4 w-4" />
                  Gerenciar Avaliadores
                </Link>
              </Button>
            </RoleGuard>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Card Principal do Evento */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-6">
                {event.imageUrl && (
                  <div className="flex-shrink-0">
                    <Image
                      src={event.imageUrl}
                      alt={event.title}
                      width={200}
                      height={120}
                      className="rounded-lg object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {event.title}
                      </h1>
                      <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                        {event.description}
                      </p>
                    </div>
                    <Badge
                      className={status.color}
                      className="flex items-center"
                    >
                      <status.icon className="mr-1 h-4 w-4" />
                      {status.label}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">
                          Início das Submissões
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDateTime(event.submissionStartDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">
                          Fim das Submissões
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDateTime(event.submissionEndDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Tipo de Avaliação</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {event.evaluationType === "DIRECT"
                            ? "Avaliação Direta"
                            : event.evaluationType === "PAIR"
                            ? "Avaliação por Pares"
                            : "Painel de Avaliação"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas do Evento (Coordenador) */}
          <RoleGuard allowedRoles={[USER_ROLES.COORDINATOR]}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Submissões
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {eventStats?.totalSubmissions || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Em Avaliação
                  </CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {eventStats?.underReview || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Aprovados
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {eventStats?.approved || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avaliadores
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {eventStats?.evaluators || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          </RoleGuard>

          {/* Submissões Recentes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Submissões Recentes
              </CardTitle>
              <RoleGuard allowedRoles={[USER_ROLES.COORDINATOR]}>
                <Button variant="outline" size="sm" asChild>
                  <Link href={ROUTES.EVENT_ARTICLES(event.id)}>Ver todas</Link>
                </Button>
              </RoleGuard>
            </CardHeader>
            <CardContent>
              {articlesLoading ? (
                <LoadingSpinner text="Carregando submissões..." />
              ) : articles && articles.length > 0 ? (
                <div className="space-y-4">
                  {articles.slice(0, 5).map((article) => (
                    <div
                      key={article.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium">{article.title}</h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <span>Por {article.user?.name}</span>
                          <span>{formatDate(article.createdAt)}</span>
                          <Badge variant="outline" className="text-xs">
                            Versão {article.currentVersion}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <StatusBadge status={article.status} />
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={ROUTES.ARTICLE_DETAILS(article.id)}>
                            Ver detalhes
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="mx-auto h-12 w-12 mb-4" />
                  <p>Nenhuma submissão ainda</p>
                  {canSubmit && (
                    <Button asChild className="mt-4">
                      <Link href={ROUTES.SUBMIT_ARTICLE}>
                        Seja o primeiro a submeter!
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações para Submissão */}
          {canSubmit && (
            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-blue-900 dark:text-blue-100">
                  Como Submeter seu Artigo
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-800 dark:text-blue-200">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Prepare seu artigo em formato PDF</li>
                  <li>Tenha em mãos o resumo e palavras-chave</li>
                  <li>Liste todos os co-autores (se houver)</li>
                  <li>Clique em "Submeter Artigo" e preencha o formulário</li>
                  <li>Aguarde a confirmação de submissão</li>
                </ol>
                <div className="mt-4">
                  <Button asChild>
                    <Link href={ROUTES.SUBMIT_ARTICLE}>
                      <Upload className="mr-2 h-4 w-4" />
                      Submeter Artigo Agora
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
