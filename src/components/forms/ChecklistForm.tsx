"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Save,
  ArrowRight,
  ArrowLeft,
  ClipboardList,
  HelpCircle,
  GripVertical,
} from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  checklistBasicSchema,
  questionsSchema,
  ChecklistBasicFormData,
  QuestionsFormData,
  QuestionFormData,
} from "@/lib/validations";

// Tipos de pergunta disponíveis (baseado na API)
const QUESTION_TYPES = {
  YES_NO: "Sim/Não",
  TEXT: "Texto Livre",
  SCALE: "Escala (1-10)",
} as const;

type QuestionType = keyof typeof QUESTION_TYPES;

// Schema para validação (usando os schemas do arquivo de validações)
type ChecklistBasicData = ChecklistBasicFormData;
type QuestionData = QuestionFormData;
type QuestionsData = QuestionsFormData;

interface ChecklistFormProps {
  onSubmit?: (checklistId: string) => void;
  initialData?: {
    title?: string;
    description?: string;
    questions?: QuestionData[];
  };
}

export function ChecklistForm({ onSubmit, initialData }: ChecklistFormProps) {
  const [currentStep, setCurrentStep] = useState<"basic" | "questions">(
    "basic"
  );
  const [checklistId, setChecklistId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form para dados básicos
  const basicForm = useForm<ChecklistBasicData>({
    resolver: zodResolver(checklistBasicSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
    },
  });

  // Form para perguntas
  const questionsForm = useForm<QuestionsData>({
    resolver: zodResolver(questionsSchema),
    defaultValues: {
      questions: initialData?.questions || [
        {
          description: "",
          type: "YES_NO",
          isRequired: true,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: questionsForm.control,
    name: "questions",
  });

  // Etapa 1: Criar checklist básico
  const handleBasicSubmit = async (data: ChecklistBasicData) => {
    try {
      setIsSubmitting(true);

      // ✅ Mapear dados do frontend para API (title -> name)
      const response = await api.post("/checklists", {
        name: data.title, // API espera 'name', não 'title'
        description: data.description,
      });

      setChecklistId(response.id);
      setCurrentStep("questions");

      toast.success("Checklist criado! Agora adicione as perguntas.");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar checklist");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Etapa 2: Adicionar perguntas
  const handleQuestionsSubmit = async (data: QuestionsData) => {
    if (!checklistId) {
      toast.error("ID do checklist não encontrado");
      return;
    }

    try {
      setIsSubmitting(true);

      // ✅ Preparar perguntas com dados corretos da API
      const questionsWithOrder = data.questions.map((question, index) => ({
        description: question.description,
        type: question.type,
        isRequired: question.isRequired,
        order: index + 1,
      }));

      await api.post(`/checklists/${checklistId}/questions`, {
        questions: questionsWithOrder,
      });

      toast.success("Checklist criado com sucesso!");
      onSubmit?.(checklistId);
    } catch (error: any) {
      toast.error(error.message || "Erro ao adicionar perguntas");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addQuestion = () => {
    append({
      description: "",
      type: "YES_NO",
      isRequired: true,
    });
  };

  const getQuestionPreview = (question: QuestionData) => {
    switch (question.type) {
      case "YES_NO":
        return "Resposta: Sim / Não";
      case "TEXT":
        return "Resposta: Campo de texto livre";
      case "SCALE":
        return "Resposta: Escala de 1 a 10";
      default:
        return "";
    }
  };

  if (currentStep === "basic") {
    return (
      <div className="space-y-6 bg-white p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#243444] rounded-full flex items-center justify-center text-white font-bold">
            1
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Informações Básicas
            </h3>
            <p className="text-sm text-gray-500">
              Defina o título e descrição do checklist
            </p>
          </div>
        </div>

        <form
          onSubmit={basicForm.handleSubmit(handleBasicSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-sm font-medium text-gray-700"
            >
              Título do Checklist *
            </Label>
            <Input
              id="title"
              placeholder="Ex: Checklist de Avaliação de Artigos Científicos"
              className="bg-white border-gray-300"
              {...basicForm.register("title")}
            />
            {basicForm.formState.errors.title && (
              <p className="text-sm text-red-600">
                {basicForm.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-gray-700"
            >
              Descrição (Opcional)
            </Label>
            <Textarea
              id="description"
              placeholder="Descreva o propósito e contexto deste checklist..."
              className="bg-white border-gray-300 min-h-[80px]"
              {...basicForm.register("description")}
            />
            {basicForm.formState.errors.description && (
              <p className="text-sm text-red-600">
                {basicForm.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-4">
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
                <>
                  Próximo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white p-6">
      {/* Header da Etapa 2 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#243444] rounded-full flex items-center justify-center text-white font-bold">
            2
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Adicionar Perguntas
            </h3>
            <p className="text-sm text-gray-500">
              Configure as perguntas do checklist
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => setCurrentStep("basic")}
          className="bg-white border-gray-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      <form
        onSubmit={questionsForm.handleSubmit(handleQuestionsSubmit)}
        className="space-y-6"
      >
        {/* Lista de Perguntas */}
        <div className="space-y-4">
          {fields.map((field, index) => (
            <Card
              key={field.id}
              className="bg-gray-50 border border-gray-200 question-card"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
                    <span
                      className={`status-indicator mr-2 ${
                        questionsForm.watch(`questions.${index}.isRequired`)
                          ? "required"
                          : "optional"
                      }`}
                    />
                    Pergunta {index + 1}
                    <Badge
                      className={`ml-2 text-xs ${
                        questionsForm.watch(`questions.${index}.isRequired`)
                          ? "required-badge"
                          : "optional-badge"
                      }`}
                    >
                      {questionsForm.watch(`questions.${index}.isRequired`)
                        ? "Obrigatória"
                        : "Opcional"}
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <GripVertical className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Texto da Pergunta */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Texto da Pergunta *
                  </Label>
                  <Textarea
                    placeholder="Digite a pergunta que será feita ao avaliador..."
                    className="question-textarea"
                    {...questionsForm.register(
                      `questions.${index}.description`
                    )}
                  />
                  {questionsForm.formState.errors.questions?.[index]
                    ?.description && (
                    <p className="text-sm text-red-600">
                      {
                        questionsForm.formState.errors.questions[index]
                          .description.message
                      }
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tipo de Resposta */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Tipo de Resposta *
                    </Label>
                    <Select
                      value={questionsForm.watch(`questions.${index}.type`)}
                      onValueChange={(value: QuestionType) =>
                        questionsForm.setValue(`questions.${index}.type`, value)
                      }
                    >
                      <SelectTrigger className="question-type-select">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        {Object.entries(QUESTION_TYPES).map(([key, label]) => (
                          <SelectItem
                            key={key}
                            value={key}
                            className="hover:bg-gray-50"
                          >
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {questionsForm.formState.errors.questions?.[index]
                      ?.type && (
                      <p className="text-sm text-red-600">
                        {
                          questionsForm.formState.errors.questions[index]?.type
                            ?.message
                        }
                      </p>
                    )}
                  </div>

                  {/* Campo Obrigatório com Melhor Visibilidade */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">
                      Resposta
                    </Label>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`status-indicator ${
                            questionsForm.watch(`questions.${index}.isRequired`)
                              ? "required"
                              : "optional"
                          }`}
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {questionsForm.watch(`questions.${index}.isRequired`)
                            ? "Obrigatória"
                            : "Opcional"}
                        </span>
                      </div>
                      <Switch
                        checked={questionsForm.watch(
                          `questions.${index}.isRequired`
                        )}
                        onCheckedChange={(checked) =>
                          questionsForm.setValue(
                            `questions.${index}.isRequired`,
                            checked
                          )
                        }
                        className={
                          questionsForm.watch(`questions.${index}.isRequired`)
                            ? "switch-required"
                            : "switch-optional"
                        }
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {questionsForm.watch(`questions.${index}.isRequired`)
                        ? "Esta pergunta deve ser respondida obrigatoriamente"
                        : "Esta pergunta pode ser deixada em branco"}
                    </p>
                  </div>
                </div>

                {/* Preview */}
                <div className="question-preview">
                  <div className="flex items-start space-x-2">
                    <HelpCircle className="h-4 w-4 question-preview-icon mt-0.5" />
                    <div>
                      <p className="text-sm font-medium question-preview-text">
                        Preview:
                      </p>
                      <p className="text-sm question-preview-text">
                        {getQuestionPreview(
                          questionsForm.watch(`questions.${index}`)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Botão Adicionar Pergunta */}
        <Button
          type="button"
          variant="outline"
          onClick={addQuestion}
          className="w-full bg-white border-gray-300 border-dashed"
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Nova Pergunta
        </Button>

        {/* Resumo */}
        <Card className="bg-gray-50 border border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Total de Perguntas: {fields.length}
                </p>
                <p className="text-sm text-gray-600">
                  Obrigatórias:{" "}
                  {
                    fields.filter((_, index) =>
                      questionsForm.watch(`questions.${index}.isRequired`)
                    ).length
                  }
                </p>
              </div>
              <Badge variant="secondary" className="ml-2">
                <ClipboardList className="mr-1 h-3 w-3" />
                {fields.length} {fields.length === 1 ? "pergunta" : "perguntas"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep("basic")}
            className="bg-white border-gray-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || fields.length === 0}
            className="bg-[#243444] hover:bg-[#1a2631] text-white"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Finalizando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Finalizar Checklist
              </>
            )}
          </Button>
        </div>

        {/* Erros gerais do formulário */}
        {questionsForm.formState.errors.questions && (
          <div className="text-sm text-red-600 mt-2">
            {questionsForm.formState.errors.questions.message}
          </div>
        )}
      </form>
    </div>
  );
}
