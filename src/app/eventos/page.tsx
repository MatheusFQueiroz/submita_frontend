"use client";

import React, { useState } from "react";
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
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
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

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const {
    data: events,
    loading,
    error,
    execute: refetchEvents,
  } = useApi<Event[]>(() => api.get(`/events?search=${debouncedSearch}`), {
    immediate: true,
  });

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

  const eventColumns = [
    {
      key: "title",
      title: "Evento",
      render: (value: string, event: Event) => (
        <div className="flex items-center space-x-3">
          {event.imageUrl && (
            <Image
              src={event.imageUrl}
              alt={event.title}
              width={40}
              height={40}
              className="rounded-lg object-cover"
            />
          )}
          <div>
            <p className="font-medium">{event.title}</p>
            <p className="text-sm text-gray-500 truncate max-w-xs">
              {event.description}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "submissionPeriod",
      title: "Período de Submissão",
      render: (_: any, event: Event) => (
        <div className="text-sm">
          <p>{formatDate(event.submissionStartDate)}</p>
          <p className="text-gray-500">
            até {formatDate(event.submissionEndDate)}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (_: any, event: Event) => {
        const status = getEventStatus(event);
        return <Badge className={status.color}>{status.label}</Badge>;
      },
    },
    {
      key: "evaluationType",
      title: "Tipo de Avaliação",
      render: (value: string) => {
        const types = {
          DIRECT: "Direta",
          PAIR: "Por Pares",
          PANEL: "Painel",
        };
        return types[value as keyof typeof types] || value;
      },
    },
    {
      key: "actions",
      title: "Ações",
      render: (_: any, event: Event) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={ROUTES.EVENT_DETAILS(event.id)}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <RoleGuard allowedRoles={[USER_ROLES.COORDINATOR]}>
            <Button variant="ghost" size="sm" asChild>
              <Link href={ROUTES.EVENT_ARTICLES(event.id)}>
                <FileText className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={ROUTES.EVENT_EVALUATORS(event.id)}>
                <Users className="h-4 w-4" />
              </Link>
            </Button>
          </RoleGuard>
        </div>
      ),
    },
  ];

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
                Criar Evento
              </Link>
            </Button>
          </RoleGuard>
        }
      >
        <div className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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

          {/* Lista de Eventos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Eventos Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={events || []}
                columns={eventColumns}
                loading={loading}
                emptyMessage="Nenhum evento encontrado"
                emptyIcon={Calendar}
                onRowClick={(event) =>
                  (window.location.href = ROUTES.EVENT_DETAILS(event.id))
                }
              />
            </CardContent>
          </Card>

          {/* Cards de Eventos para Mobile */}
          <div className="md:hidden space-y-4">
            {events?.map((event) => {
              const status = getEventStatus(event);
              return (
                <Card
                  key={event.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {event.description}
                        </p>
                      </div>
                      <Badge className={status.color}>{status.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="mr-2 h-4 w-4" />
                      {formatDate(event.submissionStartDate)} -{" "}
                      {formatDate(event.submissionEndDate)}
                    </div>

                    <div className="flex justify-between items-center">
                      <Badge variant="outline">
                        {event.evaluationType === "DIRECT"
                          ? "Direta"
                          : event.evaluationType === "PAIR"
                          ? "Por Pares"
                          : "Painel"}
                      </Badge>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={ROUTES.EVENT_DETAILS(event.id)}>
                            Ver Detalhes
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
