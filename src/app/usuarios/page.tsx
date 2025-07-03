"use client";

import React, { useState } from "react";
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
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  Users,
  Plus,
  Search,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Shield,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useDebounce } from "@/hooks/useDebounce";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@/types";
import { ROUTES, formatDate, formatUserRole, USER_ROLES } from "@/lib/utils";
import {
  createEvaluatorSchema,
  CreateEvaluatorFormData,
} from "@/lib/validations";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const {
    data: users,
    loading,
    execute: refetchUsers,
  } = useApi<User[]>(
    () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (roleFilter !== "all") params.append("role", roleFilter);

      return api.get(`/users?${params.toString()}`);
    },
    {
      immediate: true,
    }
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateEvaluatorFormData>({
    resolver: zodResolver(createEvaluatorSchema),
  });

  const handleCreateEvaluator = async (data: CreateEvaluatorFormData) => {
    try {
      await api.post("/auth/register-evaluator", {
        ...data,
        password: "eventoia360@2025", // Senha temporária padrão
      });

      toast.success("Avaliador criado com sucesso!");
      setCreateDialogOpen(false);
      reset();
      refetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar avaliador");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await api.delete(`/users/${selectedUser.id}`);
      toast.success("Usuário removido com sucesso!");
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      refetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Erro ao remover usuário");
    }
  };

  const breadcrumbs = [
    { label: "Usuários" },
  ];

  const userColumns = [
    {
      key: "name",
      title: "Nome",
      render: (value: string, user: User) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      title: "Tipo",
      render: (value: string) => (
        <Badge
          variant={
            value === "COORDINATOR"
              ? "default"
              : value === "EVALUATOR"
              ? "secondary"
              : "outline"
          }
        >
          {formatUserRole(value as any)}
        </Badge>
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
      title: "Criado em",
      render: (value: Date) => (
        <span className="text-sm">{formatDate(value)}</span>
      ),
    },
    {
      key: "actions",
      title: "Ações",
      render: (_: any, user: User) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedUser(user);
              setDeleteDialogOpen(true);
            }}
            disabled={user.role === "COORDINATOR"}
          >
            <UserX className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AuthGuard requiredRoles={[USER_ROLES.COORDINATOR]}>
      <PageLayout
        title="Gestão de Usuários"
        breadcrumbs={breadcrumbs}
        actions={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Criar Avaliador
              </Button>
            </DialogTrigger>
            {/* ✅ MODAL COM FUNDO BRANCO */}
            <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-md mx-auto">
              <DialogHeader className="pb-4">
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Criar Novo Avaliador
                </DialogTitle>
              </DialogHeader>

              <form
                onSubmit={handleSubmit(handleCreateEvaluator)}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Nome completo
                  </label>
                  <Input
                    placeholder="Nome do avaliador"
                    className="bg-white border-gray-300"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    E-mail
                  </label>
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    className="bg-white border-gray-300"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* ✅ CAIXA DE INFORMAÇÕES COM FUNDO AZUL CLARO */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-900 mb-2">
                        Informações importantes:
                      </p>
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>
                          • Uma senha temporária será criada automaticamente
                        </li>
                        <li>
                          • O avaliador deve alterar a senha no primeiro login
                        </li>
                        <li>
                          • Um e-mail será enviado com as credenciais de acesso
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* ✅ BOTÕES COM FUNDO BRANCO */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#243444] hover:bg-[#1a2631] text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Criando...
                      </>
                    ) : (
                      "Criar Avaliador"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      >
        <div className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar usuários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Tipo de usuário" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200">
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="STUDENT">Alunos</SelectItem>
                    <SelectItem value="EVALUATOR">Avaliadores</SelectItem>
                    <SelectItem value="COORDINATOR">Coordenadores</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Usuários */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Usuários do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={users || []}
                columns={userColumns}
                loading={loading}
                emptyMessage="Nenhum usuário encontrado"
                emptyIcon={Users}
              />
            </CardContent>
          </Card>

          {/* Dialog de Confirmação de Exclusão */}
          <ConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            title="Remover Usuário"
            description={
              selectedUser
                ? `Tem certeza que deseja remover o usuário "${selectedUser.name}"? Esta ação não pode ser desfeita.`
                : ""
            }
            confirmText="Remover"
            cancelText="Cancelar"
            variant="destructive"
            onConfirm={handleDeleteUser}
          />
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
