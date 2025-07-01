"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  Calendar,
  ClipboardList,
  TrendingUp,
  UserCheck,
  Building,
  BarChart3,
  Plus,
} from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useApi } from "@/hooks/useApi";
import { CoordinatorStats } from "@/types";
import { ROUTES, STATUS_LABELS } from "@/lib/utils";
import { api } from "@/lib/api";

export function CoordinatorDashboard() {
  const fetchStats = useCallback(() => {
    return api.get("/dashboard/coordinator/stats");
  }, []); // Array vazio - função nunca mudará

  const { data: stats, loading: statsLoading } = useApi<CoordinatorStats>(
    fetchStats, // ✅ FIX: Função memoizada
    { immediate: true }
  );

  if (statsLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner text="Carregando dashboard..." />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SUBMITTED: "bg-blue-100 text-blue-800",
      UNDER_REVIEW: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      APPROVED_WITH_CORRECTIONS: "bg-purple-100 text-purple-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 ">
            Dashboard do Coordenador
          </h1>
          <p className="text-gray-600">
            Visão geral do sistema e estatísticas gerais
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={ROUTES.USERS}>
              <Users className="mr-2 h-4 w-4" />
              Gerenciar Usuários
            </Link>
          </Button>
          <Button asChild>
            <Link href={ROUTES.CREATE_EVENT}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Evento
            </Link>
          </Button>
        </div>
      </div>

      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Submissões */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Submissões
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalSubmissions || 0}
            </div>
            <p className="text-xs text-muted-foreground">artigos submetidos</p>
          </CardContent>
        </Card>

        {/* Total de Eventos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Eventos Ativos
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEvents || 0}</div>
            <p className="text-xs text-muted-foreground">eventos criados</p>
          </CardContent>
        </Card>

        {/* Total de Avaliadores */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliadores</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalEvaluators || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              avaliadores cadastrados
            </p>
          </CardContent>
        </Card>

        {/* Estudantes do Biopark */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Biopark</CardTitle>
            <Building className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats?.bioParkStudents || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              estudantes do Biopark
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Status */}
      {stats?.submissionsByStatus && stats.submissionsByStatus.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Distribuição de Submissões por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.submissionsByStatus.map((statusData) => (
                <div
                  key={statusData.status}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {
                        STATUS_LABELS[
                          statusData.status as keyof typeof STATUS_LABELS
                        ]
                      }
                    </p>
                    <p className="text-2xl font-bold">{statusData.count}</p>
                  </div>
                  <Badge className={getStatusColor(statusData.status)}>
                    {(
                      (statusData.count / (stats.totalSubmissions || 1)) *
                      100
                    ).toFixed(1)}
                    %
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submissões por Evento */}
      {stats?.submissionsByEvent && stats.submissionsByEvent.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Submissões por Evento
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href={ROUTES.EVENTS}>Ver eventos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.submissionsByEvent.map((eventData) => (
                <div
                  key={eventData.eventId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50  transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{eventData.eventTitle}</h3>
                    <p className="text-sm text-gray-500">
                      {eventData.count}{" "}
                      {eventData.count === 1 ? "submissão" : "submissões"}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{eventData.count}</Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={ROUTES.EVENT_ARTICLES(eventData.eventId)}>
                        Ver artigos
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progresso das Avaliações */}
      {stats?.evaluationProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardList className="mr-2 h-5 w-5" />
              Progresso das Avaliações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-green-50 ">
                <div className="text-2xl font-bold text-green-600">
                  {stats.evaluationProgress.completed}
                </div>
                <p className="text-sm text-green-600">Concluídas</p>
              </div>

              <div className="text-center p-4 rounded-lg bg-yellow-50 ">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.evaluationProgress.inProgress}
                </div>
                <p className="text-sm text-yellow-600">Em Andamento</p>
              </div>

              <div className="text-center p-4 rounded-lg bg-orange-50 ">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.evaluationProgress.pending}
                </div>
                <p className="text-sm text-orange-600">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href={ROUTES.CREATE_EVENT}>
                <Plus className="h-6 w-6 mb-2" />
                Criar Evento
              </Link>
            </Button>

            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href={ROUTES.USERS}>
                <Users className="h-6 w-6 mb-2" />
                Gerenciar Usuários
              </Link>
            </Button>

            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href={ROUTES.CHECKLISTS}>
                <ClipboardList className="h-6 w-6 mb-2" />
                Criar Checklist
              </Link>
            </Button>

            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/relatorios">
                <BarChart3 className="h-6 w-6 mb-2" />
                Ver Relatórios
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
