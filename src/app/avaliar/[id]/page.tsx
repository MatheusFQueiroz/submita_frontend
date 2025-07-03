"use client";

import React from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EvaluationForm } from "@/components/forms/EvaluationForm";
import { useApi } from "@/hooks/useApi";
import { Article, Question, Evaluation } from "@/types";
import { EvaluationFormData } from "@/lib/validations";
import { ROUTES, USER_ROLES } from "@/lib/utils";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface EvaluateArticlePageProps {
  params: { id: string };
}

export default function EvaluateArticlePage({
  params,
}: EvaluateArticlePageProps) {
  const router = useRouter();

  const { data: article, loading: articleLoading } = useApi<Article>(
    () => api.get(`/articles/${params.id}`),
    { immediate: true }
  );

  const {
    data: questions,
    loading: questionsLoading,
    execute: refetchQuestions,
  } = useApi<Question[]>(
    () =>
      article?.eventId
        ? api.get(`/events/${article.eventId}/checklist/questions`)
        : Promise.resolve([]),
    { immediate: false }
  );

  const { data: existingEvaluation, loading: evaluationLoading } =
    useApi<Evaluation>(
      () => api.get(`/evaluations/article/${params.id}/my-evaluation`),
      { immediate: true }
    );

  // Carrega perguntas quando artigo é carregado
  React.useEffect(() => {
    if (article?.eventId) {
      refetchQuestions();
    }
  }, [article?.eventId, refetchQuestions]);

  const handleSubmitEvaluation = async (data: EvaluationFormData) => {
    try {
      if (existingEvaluation) {
        // Atualiza avaliação existente
        await api.put(`/evaluations/${existingEvaluation.id}`, data);
      } else {
        // Cria nova avaliação
        await api.post(`/evaluations`, {
          ...data,
          articleId: params.id,
        });
      }

      toast.success("Avaliação finalizada com sucesso!");
      router.push(ROUTES.ARTICLES);
    } catch (error: any) {
      console.error("Erro ao finalizar avaliação:", error);
      throw new Error(error.message || "Erro ao finalizar avaliação");
    }
  };

  const handleSaveDraft = async (data: Partial<EvaluationFormData>) => {
    try {
      if (existingEvaluation) {
        await api.put(`/evaluations/${existingEvaluation.id}/draft`, data);
      } else {
        await api.post(`/evaluations/draft`, {
          ...data,
          articleId: params.id,
        });
      }

      toast.success("Rascunho salvo com sucesso!");
    } catch (error: any) {
      console.error("Erro ao salvar rascunho:", error);
      toast.error(error.message || "Erro ao salvar rascunho");
    }
  };

  if (articleLoading || questionsLoading || evaluationLoading) {
    return (
      <AuthGuard requiredRoles={[USER_ROLES.EVALUATOR]}>
        <PageLayout>
          <div className="flex justify-center py-8">
            <LoadingSpinner text="Carregando avaliação..." />
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  if (!article) {
    return (
      <AuthGuard requiredRoles={[USER_ROLES.EVALUATOR]}>
        <PageLayout>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900">
              Artigo não encontrado
            </h2>
            <p className="text-gray-600 mt-2">
              O artigo que você está tentando avaliar não existe ou não está
              disponível.
            </p>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  const breadcrumbs = [
    { label: "Artigos", href: "/artigos" },
    { label: "Avaliar Artigo" },
  ];

  // Converte avaliação existente para formato do formulário
  const initialData = existingEvaluation
    ? {
        grade: existingEvaluation.grade || 0,
        evaluationDescription: existingEvaluation.evaluationDescription || "",
        responses:
          existingEvaluation.responses?.map((r) => ({
            questionId: r.questionId,
            answer: r.answer,
          })) || [],
      }
    : undefined;

  return (
    <AuthGuard requiredRoles={[USER_ROLES.EVALUATOR]}>
      <PageLayout title={`Avaliar: ${article.title}`} breadcrumbs={breadcrumbs}>
        <div className="max-w-4xl mx-auto">
          <EvaluationForm
            article={article}
            questions={questions || []}
            onSubmit={handleSubmitEvaluation}
            onSaveDraft={handleSaveDraft}
            initialData={initialData}
          />
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
