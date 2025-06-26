"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArticleForm } from "@/components/forms/ArticleForm";
import { PageLayout } from "@/components/layout/PageLayout";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useApi } from "@/hooks/useApi";
import { ArticleFormData } from "@/lib/validations";
import { Event } from "@/types";
import { ROUTES, USER_ROLES } from "@/lib/utils";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function SubmitArticlePage() {
  const router = useRouter();

  const { data: events, loading: eventsLoading } = useApi<Event[]>(
    () => api.get("/events?status=active"),
    { immediate: true }
  );

  const handleSubmit = async (data: ArticleFormData & { fileId?: string }) => {
    try {
      await api.post("/articles", {
        ...data,
        filePath: data.fileId, // A API espera filePath
      });

      toast.success("Artigo submetido com sucesso!");
      router.push(ROUTES.ARTICLES);
    } catch (error: any) {
      console.error("Erro ao submeter artigo:", error);
      throw new Error(error.message || "Erro ao submeter artigo");
    }
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Artigos", href: "/artigos" },
    { label: "Submeter Artigo" },
  ];

  if (eventsLoading) {
    return (
      <AuthGuard requiredRoles={[USER_ROLES.STUDENT]}>
        <PageLayout title="Submeter Artigo" breadcrumbs={breadcrumbs}>
          <div className="flex justify-center py-8">
            <LoadingSpinner text="Carregando eventos..." />
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRoles={[USER_ROLES.STUDENT]}>
      <PageLayout title="Submeter Novo Artigo" breadcrumbs={breadcrumbs}>
        <div className="max-w-4xl mx-auto">
          <ArticleForm onSubmit={handleSubmit} events={events || []} />
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
