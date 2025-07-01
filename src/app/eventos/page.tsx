"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageLayout } from "@/components/layout/PageLayout";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Calendar,
  Plus,
  Search,
  Clock,
  Users,
  FileText,
  Settings,
  Eye,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useDebounce } from "@/hooks/useDebounce";
import { Event } from "@/types";
import { ROUTES, formatDate, USER_ROLES } from "@/lib/utils";
import { api } from "@/lib/api";

// ✅ CORREÇÃO 1: Interface para a resposta da API
interface EventsApiResponse {
  events: Event[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const fetchEvents = useCallback(() => {
    const url = `/events${
      debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : ""
    }`;
    console.log("🔍 Fazendo requisição para:", url);
    return api.get(url);
  }, [debouncedSearch]);

  const {
    data: apiResponse,
    loading,
    error,
    execute: refetchEvents,
  } = useApi<EventsApiResponse>(fetchEvents, {
    immediate: true,
  });

  const events = apiResponse?.events || [];
  const pagination = apiResponse
    ? {
        total: apiResponse.total,
        page: apiResponse.page,
        limit: apiResponse.limit,
        totalPages: apiResponse.totalPages,
      }
    : null;

  console.log("🔍 API Response:", apiResponse);
  console.log("🔍 Events extraídos:", events);
  console.log("🔍 Quantidade de eventos:", events.length);

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const startDate = new Date(event.submissionStartDate);
    const endDate = new Date(event.submissionEndDate);

    if (now < startDate)
      return { label: "Em breve", color: "bg-blue-100 text-blue-800" };
    if (now > endDate)
      return { label: "Finalizado", color: "bg-gray-100 text-gray-800" };
    return { label: "Ativo", color: "bg-green-100 text-green-800" };
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Eventos" },
  ];

  if (loading) {
    return (
      <AuthGuard>
        <PageLayout title="Eventos" breadcrumbs={breadcrumbs}>
          <div className="flex justify-center py-8">
            <LoadingSpinner text="Carregando eventos..." />
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <PageLayout title="Eventos" breadcrumbs={breadcrumbs}>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900">
              Erro ao carregar eventos
            </h2>
            <p className="text-gray-600 mt-2">{error}</p>
            <Button onClick={refetchEvents} className="mt-4">
              Tentar novamente
            </Button>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <PageLayout
        title="Eventos"
        breadcrumbs={breadcrumbs}
        actions={
          <RoleGuard allowedRoles={[USER_ROLES.COORDINATOR]}>
            <Button asChild>
              <Link href={ROUTES.CREATE_EVENT}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Evento
              </Link>
            </Button>
          </RoleGuard>
        }
      >
        <div className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar eventos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações de paginação */}
          {pagination && pagination.total > 0 && (
            <div className="text-sm text-gray-500">
              Mostrando {events.length} de {pagination.total} eventos
            </div>
          )}

          {/* Lista de Eventos */}
          {events.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Nenhum evento encontrado"
              description={
                searchTerm
                  ? `Nenhum evento encontrado para "${searchTerm}"`
                  : "Não há eventos cadastrados ainda."
              }
              action={{
                label: "Criar Primeiro Evento",
                onClick: () => (window.location.href = ROUTES.CREATE_EVENT),
              }}
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => {
                const status = getEventStatus(event);

                return (
                  <Card
                    key={event.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">
                            {event.name}
                          </CardTitle>
                          <Badge
                            className={`mt-2 ${status.color}`}
                            variant="secondary"
                          >
                            {status.label}
                          </Badge>
                        </div>
                        {event.banner && (
                          <Image
                            src={event.imageUrl}
                            alt={event.name}
                            width={80}
                            height={60}
                            className="rounded-md object-cover"
                          />
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {event.description}
                      </p>

                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          Submissões: {formatDate(
                            event.submissionStartDate
                          )} - {formatDate(event.submissionEndDate)}
                        </div>

                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          Evento: {formatDate(event.submissionStartDate)} -{" "}
                          {formatDate(event.submissionEndDate)}
                        </div>

                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4" />
                          Tipo: {event.evaluationType}
                        </div>

                        <div className="flex items-center">
                          <FileText className="mr-2 h-4 w-4" />
                          Status: {event.status}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-xs text-gray-500">
                          Criado em {formatDate(event.createdAt)}
                        </div>

                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={ROUTES.EVENT_DETAILS(event.id)}>
                              <Eye className="mr-1 h-3 w-3" />
                              Ver
                            </Link>
                          </Button>

                          <RoleGuard allowedRoles={[USER_ROLES.COORDINATOR]}>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/eventos/${event.id}/editar`}>
                                <Settings className="mr-1 h-3 w-3" />
                                Gerenciar
                              </Link>
                            </Button>
                          </RoleGuard>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
