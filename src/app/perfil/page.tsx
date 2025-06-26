"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChangePasswordForm } from "@/components/forms/ChangePasswordForm";
import { PageLayout } from "@/components/layout/PageLayout";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { PasswordGuard } from "@/components/guards/PasswordGuard";
import { User, Settings, Shield, Calendar } from "lucide-react";
import { useAuthContext } from "@/providers/AuthProvider";
import { formatUserRole, formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const { user, refreshProfile } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const handleSave = async () => {
    try {
      // Aqui implementar a atualização do perfil via API
      // await api.put("/auth/profile", formData);
      await refreshProfile();
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
    }
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Perfil" },
  ];

  return (
    <AuthGuard>
      <PasswordGuard>
        <PageLayout
          title="Meu Perfil"
          breadcrumbs={breadcrumbs}
          actions={
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              <Settings className="mr-2 h-4 w-4" />
              {isEditing ? "Cancelar" : "Editar"}
            </Button>
          }
        >
          <div className="max-w-4xl mx-auto space-y-6">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Shield className="mr-2 h-4 w-4" />
                  Segurança
                </TabsTrigger>
                <TabsTrigger value="activity">
                  <Calendar className="mr-2 h-4 w-4" />
                  Atividade
                </TabsTrigger>
              </TabsList>

              {/* Aba Perfil */}
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      Informações Pessoais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Informações básicas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome completo</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Informações do sistema */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Tipo de usuário</Label>
                        <div>
                          <Badge variant="secondary" className="text-sm">
                            {formatUserRole(user?.role || "STUDENT")}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Instituição</Label>
                        <div>
                          <Badge
                            variant={user?.isFromIFPB ? "default" : "outline"}
                            className="text-sm"
                          >
                            {user?.isFromIFPB ? "Biopark" : "Externa"}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Membro desde</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(user?.createdAt || new Date())}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Status</Label>
                        <div>
                          <Badge
                            variant={user?.isActive ? "default" : "destructive"}
                            className="text-sm"
                          >
                            {user?.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancelar
                        </Button>
                        <Button onClick={handleSave}>Salvar alterações</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba Segurança */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="mr-2 h-5 w-5" />
                      Alterar Senha
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChangePasswordForm isFirstLogin={false} />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba Atividade */}
              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Atividade Recente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Login realizado</p>
                          <p className="text-xs text-gray-500">
                            Último acesso:{" "}
                            {formatDate(new Date(), "dd/MM/yyyy 'às' HH:mm")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Perfil visualizado
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(new Date(), "dd/MM/yyyy 'às' HH:mm")}
                          </p>
                        </div>
                      </div>

                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">
                          Histórico completo de atividades em desenvolvimento
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </PageLayout>
      </PasswordGuard>
    </AuthGuard>
  );
}
