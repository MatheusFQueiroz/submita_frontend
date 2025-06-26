"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, X, GripVertical } from "lucide-react";
import { checklistSchema, ChecklistFormData } from "@/lib/validations";

interface ChecklistFormProps {
  onSubmit: (data: ChecklistFormData) => Promise<void>;
  initialData?: Partial<ChecklistFormData>;
  isSubmitting?: boolean;
}

export function ChecklistForm({
  onSubmit,
  initialData,
  isSubmitting = false,
}: ChecklistFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ChecklistFormData>({
    resolver: zodResolver(checklistSchema),
    defaultValues: {
      title: "",
      description: "",
      questions: [
        {
          text: "",
          type: "BOOLEAN",
          isRequired: true,
          options: [],
        },
      ],
      ...initialData,
    },
  });

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
    move: moveQuestion,
  } = useFieldArray({
    control,
    name: "questions",
  });

  const addQuestion = () => {
    appendQuestion({
      text: "",
      type: "BOOLEAN",
      isRequired: true,
      options: [],
    });
  };

  const addOption = (questionIndex: number, option: string) => {
    const currentQuestion = watch(`questions.${questionIndex}`);
    const newOptions = [...(currentQuestion.options || []), option];
    setValue(`questions.${questionIndex}.options`, newOptions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const currentQuestion = watch(`questions.${questionIndex}`);
    const newOptions =
      currentQuestion.options?.filter((_, index) => index !== optionIndex) ||
      [];
    setValue(`questions.${questionIndex}.options`, newOptions);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? "Editar Checklist" : "Criar Novo Checklist"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título do checklist *</Label>
            <Input
              id="title"
              placeholder="Ex: Critérios de Avaliação - Simpósio 2024"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descrição opcional do checklist..."
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Perguntas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-medium">Perguntas</Label>
              <Button type="button" onClick={addQuestion} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar pergunta
              </Button>
            </div>

            {questionFields.map((field, index) => {
              const questionType = watch(`questions.${index}.type`);
              const questionOptions = watch(`questions.${index}.options`) || [];

              return (
                <Card key={field.id} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">
                          Pergunta {index + 1}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                        disabled={questionFields.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Texto da pergunta */}
                    <div className="space-y-2">
                      <Label>Texto da pergunta *</Label>
                      <Input
                        placeholder="Digite a pergunta..."
                        {...register(`questions.${index}.text`)}
                      />
                      {errors.questions?.[index]?.text && (
                        <p className="text-sm text-red-600">
                          {errors.questions[index]?.text?.message}
                        </p>
                      )}
                    </div>

                    {/* Tipo da pergunta */}
                    <div className="space-y-2">
                      <Label>Tipo de resposta</Label>
                      <Select
                        value={questionType}
                        onValueChange={(value) =>
                          setValue(`questions.${index}.type`, value as any)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BOOLEAN">Sim/Não</SelectItem>
                          <SelectItem value="TEXT">Texto livre</SelectItem>
                          <SelectItem value="SCALE">Escala (1-10)</SelectItem>
                          <SelectItem value="MULTIPLE_CHOICE">
                            Múltipla escolha
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Opções para múltipla escolha */}
                    {questionType === "MULTIPLE_CHOICE" && (
                      <div className="space-y-2">
                        <Label>Opções</Label>
                        <div className="space-y-2">
                          {questionOptions.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className="flex items-center space-x-2"
                            >
                              <Input
                                value={option}
                                readOnly
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOption(index, optionIndex)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <div className="flex space-x-2">
                            <Input
                              placeholder="Nova opção..."
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const target = e.target as HTMLInputElement;
                                  if (target.value.trim()) {
                                    addOption(index, target.value.trim());
                                    target.value = "";
                                  }
                                }
                              }}
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={(e) => {
                                const input = e.currentTarget
                                  .previousElementSibling as HTMLInputElement;
                                if (input.value.trim()) {
                                  addOption(index, input.value.trim());
                                  input.value = "";
                                }
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Campo obrigatório */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`required-${index}`}
                        checked={watch(`questions.${index}.isRequired`)}
                        onCheckedChange={(checked) =>
                          setValue(
                            `questions.${index}.isRequired`,
                            checked as boolean
                          )
                        }
                      />
                      <Label htmlFor={`required-${index}`}>
                        Campo obrigatório
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {errors.questions && (
              <Alert variant="destructive">
                <AlertDescription>
                  {errors.questions.message ||
                    "Verifique os campos das perguntas"}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar checklist"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
