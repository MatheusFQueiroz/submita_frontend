"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageLayout } from "@/components/layout/PageLayout";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { DataTable } from "@/components/common/DataTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  Users,
  Plus,
  Search,
  UserMinus,
  Mail,
  Calendar,
  FileText,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useDebounce } from "@/hooks/useDebounce";
import { User, Event } from "@/types";
import { ROUTES, formatDate, formatUserRole, USER_ROLES } from "@/lib/utils";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface EventEvaluatorsPageProps {
  params: { id: string };
}

export default function EventEvaluatorsPage({
  params,
}: EventEvaluatorsPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedEvaluator, setSelectedEvaluator] = useState<User | null>(null);
  const [selectedEvaluatorIds, setSelectedEvaluatorIds] = useState<string[]>(
    []
  );
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Busca informações do evento
  const { data: event, loading: eventLoading } = useApi<Event>(
    () => api.get(`/events/${params.id}`),
    { immediate: true }
  );

  // Busca avaliadores do evento
  const {
    data: eventEvaluators,
    loading: evaluatorsLoading,
    execute: refetchEventEvaluators,
  } = useApi<User[]>(() => api.get(`/events/${params.id}/evaluators`), {
    immediate: true,
  });

  // Busca todos os avaliadores disponíveis
  const { data: allEvaluators, loading: allEvaluatorsLoading } = useApi<User[]>(
    () => api.get("/users/evaluators"),
    { immediate: true }
  );

  const handleAddEvaluators = async () => {
    try {
      await api.post(`/events/${params.id}/evaluators`, {
        evaluatorIds: selectedEvaluatorIds,
      });

      toast.success(
        `${selectedEvaluatorIds.length} avaliador(es) adicionado(s) com sucesso!`
      );
      setAddDialogOpen(false);
      setSelectedEvaluatorIds([]);
      refetchEventEvaluators();
    } catch (error: any) {
      toast.error(error.message || "Erro ao adicionar avaliadores");
    }
  };

  const handleRemoveEvaluator = async () => {
    if (!selectedEvaluator) return;

    try {
      await api.delete(
        `/events/${params.id}/evaluators/${selectedEvaluator.id}`
      );
      toast.success("Avaliador removido com sucesso!");
      setRemoveDialogOpen(false);
      setSelectedEvaluator(null);
      refetchEventEvaluators();
    } catch (error: any) {
      toast.error(error.message || "Erro ao remover avaliador");
    }
  };

  const availableEvaluators =
    allEvaluators?.filter(
      (evaluator) =>
        !eventEvaluators?.some((eventEval) => eventEval.id === evaluator.id)
    ) || [];

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
    { label: event?.title || "Evento", href: ROUTES.EVENT_DETAILS(params.id) },
    { label: "Avaliadores" },
  ];

  const evaluatorColumns = [
    {
      key: "name",
      title: "Nome",
      render: (value: string, evaluator: User) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-sm text-gray-500">{evaluator.email}</p>
        </div>
      ),
    },
    {
      key: "isFromBpk",
      title: "Instituição",
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "outline"}>
          {value ? "Biopark" : "Externa"}
        </Badge>
      ),
    },
    {
      key: "isActive",
      title: "Status",
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "destructive"}>
          {value ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      title: "Adicionado em",
      render: (value: Date) => (
        <span className="text-sm">{formatDate(value)}</span>
      ),
    },
    {
      key: "actions",
      title: "Ações",
      render: (_: any, evaluator: User) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedEvaluator(evaluator);
              setRemoveDialogOpen(true);
            }}
          >
            <UserMinus className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AuthGuard requiredRoles={[USER_ROLES.COORDINATOR]}>
      <PageLayout
        title={`Avaliadores - ${event?.title}`}
        breadcrumbs={breadcrumbs}
        actions={
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={availableEvaluators.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Avaliadores
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Adicionar Avaliadores ao Evento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {allEvaluatorsLoading ? (
                  <LoadingSpinner text="Carregando avaliadores..." />
                ) : availableEvaluators.length > 0 ? (
                  <>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {availableEvaluators.map((evaluator) => (
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
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge
                                variant={
                                  evaluator.isFromBpk ? "default" : "outline"
                                }
                                className="text-xs"
                              >
                                {evaluator.isFromBpk ? "Biopark" : "Externa"}
                              </Badge>
                              <Badge
                                variant={
                                  evaluator.isActive ? "default" : "destructive"
                                }
                                className="text-xs"
                              >
                                {evaluator.isActive ? "Ativo" : "Inativo"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAddDialogOpen(false);
                          setSelectedEvaluatorIds([]);
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleAddEvaluators}
                        disabled={selectedEvaluatorIds.length === 0}
                      >
                        Adicionar {selectedEvaluatorIds.length} avaliador(es)
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="mx-auto h-12 w-12 mb-4" />
                    <p>
                      Todos os avaliadores já foram adicionados a este evento
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        }
      >
        <div className="space-y-6">
          {/* Informações do Evento */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{event?.title}</h2>
                  <p className="text-sm text-gray-600">{event?.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {eventEvaluators?.length || 0}
                  </p>
                  <p className="text-sm text-gray-500">Avaliadores</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Avaliadores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Avaliadores do Evento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={eventEvaluators || []}
                columns={evaluatorColumns}
                loading={evaluatorsLoading}
                emptyMessage="Nenhum avaliador adicionado ainda"
                emptyIcon={Users}
              />
            </CardContent>
          </Card>

          {/* Dialog de Confirmação de Remoção */}
          <ConfirmDialog
            open={removeDialogOpen}
            onOpenChange={setRemoveDialogOpen}
            title="Remover Avaliador"
            description={
              selectedEvaluator
                ? `Tem certeza que deseja remover "${selectedEvaluator.name}" dos avaliadores deste evento? As avaliações em andamento serão perdidas.`
                : ""
            }
            confirmText="Remover"
            cancelText="Cancelar"
            variant="destructive"
            onConfirm={handleRemoveEvaluator}
          />
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
