"use client";

import React, { useState } from "react";
import Link from "next/link";
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
import { PageLayout } from "@/components/layout/PageLayout";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { DataTable } from "@/components/common/DataTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ChecklistForm } from "@/components/forms/ChecklistForm";
import {
  ClipboardList,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  FileText,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useDebounce } from "@/hooks/useDebounce";
import { Checklist } from "@/types";
import { ChecklistFormData } from "@/lib/validations";
import { ROUTES, formatDate, USER_ROLES } from "@/lib/utils";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function ChecklistsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(
    null
  );
  const debouncedSearch = useDebounce(searchTerm, 300);

  const {
    data: checklists,
    loading,
    execute: refetchChecklists,
  } = useApi<Checklist[]>(
    () => api.get(`/checklists?search=${debouncedSearch}`),
    {
      immediate: true,
    }
  );

  const handleCreateChecklist = async (data: ChecklistFormData) => {
    try {
      await api.post("/checklists", data);
      toast.success("Checklist criado com sucesso!");
      setCreateDialogOpen(false);
      refetchChecklists();
    } catch (error: any) {
      console.error("Erro ao criar checklist:", error);
      throw new Error(error.message || "Erro ao criar checklist");
    }
  };

  const handleUpdateChecklist = async (data: ChecklistFormData) => {
    if (!selectedChecklist) return;

    try {
      await api.put(`/checklists/${selectedChecklist.id}`, data);
      toast.success("Checklist atualizado com sucesso!");
      setEditDialogOpen(false);
      setSelectedChecklist(null);
      refetchChecklists();
    } catch (error: any) {
      console.error("Erro ao atualizar checklist:", error);
      throw new Error(error.message || "Erro ao atualizar checklist");
    }
  };

  const handleDeleteChecklist = async () => {
    if (!selectedChecklist) return;

    try {
      await api.delete(`/checklists/${selectedChecklist.id}`);
      toast.success("Checklist removido com sucesso!");
      setDeleteDialogOpen(false);
      setSelectedChecklist(null);
      refetchChecklists();
    } catch (error: any) {
      toast.error(error.message || "Erro ao remover checklist");
    }
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Checklists" },
  ];

  const checklistColumns = [
    {
      key: "title",
      title: "Título",
      render: (value: string, checklist: Checklist) => (
        <div>
          <p className="font-medium">{value}</p>
          {checklist.description && (
            <p className="text-sm text-gray-500 truncate max-w-xs">
              {checklist.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "questions",
      title: "Perguntas",
      render: (_: any, checklist: Checklist) => (
        <Badge variant="secondary">
          {checklist.questions?.length || 0} perguntas
        </Badge>
      ),
    },
    {
      key: "event",
      title: "Evento",
      render: (_: any, checklist: Checklist) => (
        <span className="text-sm">
          {checklist.event?.title || "Checklist geral"}
        </span>
      ),
    },
    {
      key: "createdAt",
      title: "Criado em",
      render: (value: Date) => (
        <span className="text-sm">{formatDate(value)}</span>
      ),
    },
    {
      key: "actions",
      title: "Ações",
      render: (_: any, checklist: Checklist) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedChecklist(checklist);
              setEditDialogOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedChecklist(checklist);
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AuthGuard requiredRoles={[USER_ROLES.COORDINATOR]}>
      <PageLayout
        title="Checklists de Avaliação"
        breadcrumbs={breadcrumbs}
        actions={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Criar Checklist
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Checklist</DialogTitle>
              </DialogHeader>
              <ChecklistForm onSubmit={handleCreateChecklist} />
            </DialogContent>
          </Dialog>
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
                    placeholder="Buscar checklists..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Checklists */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClipboardList className="mr-2 h-5 w-5" />
                Checklists Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={checklists || []}
                columns={checklistColumns}
                loading={loading}
                emptyMessage="Nenhum checklist encontrado"
                emptyIcon={ClipboardList}
              />
            </CardContent>
          </Card>

          {/* Dialog de Edição */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Checklist</DialogTitle>
              </DialogHeader>
              {selectedChecklist && (
                <ChecklistForm
                  onSubmit={handleUpdateChecklist}
                  initialData={{
                    title: selectedChecklist.title,
                    description: selectedChecklist.description || "",
                    questions:
                      selectedChecklist.questions?.map((q) => ({
                        text: q.text,
                        type: q.type,
                        isRequired: q.isRequired,
                        options: q.options || [],
                      })) || [],
                  }}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Dialog de Confirmação de Exclusão */}
          <ConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            title="Remover Checklist"
            description={
              selectedChecklist
                ? `Tem certeza que deseja remover o checklist "${selectedChecklist.title}"? Esta ação não pode ser desfeita.`
                : ""
            }
            confirmText="Remover"
            cancelText="Cancelar"
            variant="destructive"
            onConfirm={handleDeleteChecklist}
          />
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
