"use client";

import React, { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/common/FileUpload";
import { Plus, X, Calendar, Clock } from "lucide-react";
import { articleSchema, ArticleFormData } from "@/lib/validations";
import { useFileUpload } from "@/hooks/useFileUpload";
import { FILE_CONFIG } from "@/lib/constants";
import { Event } from "@/types";

interface ArticleFormProps {
  onSubmit: (data: ArticleFormData & { pdfPath?: string }) => Promise<void>;
  events: Event[];
  initialData?: Partial<ArticleFormData>;
  isSubmitting?: boolean;
}

export function ArticleForm({
  onSubmit,
  events,
  initialData,
  isSubmitting = false,
}: ArticleFormProps) {
  const [error, setError] = useState<string>("");
  const [newKeyword, setNewKeyword] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const { uploadPdf, uploadedFile, uploadProgress, isUploading } =
    useFileUpload();

  // ✅ DEBUG: Log dos eventos recebidos
  useEffect(() => {
    console.log("🔍 ArticleForm - Eventos recebidos:", events);
    console.log("🔍 ArticleForm - Quantidade de eventos:", events.length);

    if (events.length > 0) {
      events.forEach((event, index) => {
        console.log(`🔍 Evento ${index + 1}:`, {
          id: event.id,
          name: event.name,
          isActive: event.isActive,
          submissionStart: event.submissionStartDate,
          submissionEnd: event.submissionEndDate,
          now: new Date().toISOString(),
        });
      });
    } else {
      console.log("⚠️ ArticleForm - Nenhum evento disponível!");
    }
  }, [events]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      keywords: [],
      relatedAuthors: [],
      ...initialData,
    },
  });

  const {
    fields: keywordFields,
    append: appendKeyword,
    remove: removeKeyword,
  } = useFieldArray({
    control: control as any,
    name: "keywords" as any,
  });

  const {
    fields: authorFields,
    append: appendAuthor,
    remove: removeAuthor,
  } = useFieldArray({
    control: control as any,
    name: "relatedAuthors" as any,
  });

  const watchedKeywords = watch("keywords");
  const watchedAuthors = watch("relatedAuthors");

  const handleFormSubmit = async (data: ArticleFormData) => {
    try {
      setError("");

      if (!uploadedFile && !initialData) {
        setError("É obrigatório enviar um arquivo PDF");
        return;
      }

      // Usar fileName da resposta do upload como pdfPath
      const formData = {
        ...data,
        pdfPath: uploadedFile?.fileName || initialData?.pdfPath,
      };

      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || "Erro ao submeter artigo");
    }
  };

  const handlePdfUpload = async (file: File) => {
    try {
      await uploadPdf(file);
    } catch (error) {
      console.error("Erro no upload do PDF:", error);
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !watchedKeywords.includes(newKeyword.trim())) {
      appendKeyword(newKeyword.trim());
      setNewKeyword("");
    }
  };

  const addAuthor = () => {
    if (newAuthor.trim() && !watchedAuthors.includes(newAuthor.trim())) {
      appendAuthor(newAuthor.trim());
      setNewAuthor("");
    }
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword();
    }
  };

  const handleAuthorKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addAuthor();
    }
  };

  // ✅ FUNÇÃO AUXILIAR: Formatar data para exibição
  const formatEventDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // ✅ FUNÇÃO AUXILIAR: Verificar se evento está no período
  const isEventInSubmissionPeriod = (event: Event) => {
    const now = new Date();
    const start = new Date(event.submissionStartDate);
    const end = new Date(event.submissionEndDate);
    return now >= start && now <= end;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? "Editar Artigo" : "Submeter Artigo"}
        </CardTitle>
        <p className="text-sm text-gray-600">
          Preencha todos os campos obrigatórios para submeter seu artigo
        </p>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* ✅ DEBUG: Informações sobre eventos */}
        {events.length === 0 && (
          <Alert className="mb-4">
            <AlertDescription>
              ⚠️ DEBUG: Nenhum evento foi carregado no formulário. Verifique se
              existem eventos no período de submissão.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* ✅ PRIMEIRO CAMPO: Evento */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              Evento de Submissão *
            </Label>
            <Select onValueChange={(value) => setValue("eventId", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o evento para submissão" />
              </SelectTrigger>
              <SelectContent>
                {events.length === 0 ? (
                  <SelectItem value="no-events" disabled>
                    Nenhum evento disponível
                  </SelectItem>
                ) : (
                  events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      <div className="flex flex-col py-1">
                        <span className="font-medium">{event.name}</span>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Até {formatEventDate(event.submissionEndDate)}
                          </span>
                          {isEventInSubmissionPeriod(event) ? (
                            <Badge
                              variant="outline"
                              className="text-green-600 border-green-600"
                            >
                              Ativo
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-orange-600 border-orange-600"
                            >
                              Período Expirado
                            </Badge>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.eventId && (
              <p className="text-sm text-red-600">{errors.eventId.message}</p>
            )}
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título do artigo *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Digite o título do seu artigo"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Resumo */}
          <div className="space-y-2">
            <Label htmlFor="summary">Resumo *</Label>
            <Textarea
              id="summary"
              {...register("summary")}
              placeholder="Descreva brevemente o conteúdo do seu artigo"
              rows={4}
            />
            {errors.summary && (
              <p className="text-sm text-red-600">{errors.summary.message}</p>
            )}
          </div>

          {/* Área Temática */}
          <div className="space-y-2">
            <Label htmlFor="thematicArea">Área Temática *</Label>
            <Input
              id="thematicArea"
              {...register("thematicArea")}
              placeholder="Ex: Tecnologia Educacional, Inteligência Artificial, etc."
            />
            {errors.thematicArea && (
              <p className="text-sm text-red-600">
                {errors.thematicArea.message}
              </p>
            )}
          </div>

          {/* Palavras-chave */}
          <div className="space-y-2">
            <Label>Palavras-chave *</Label>
            <div className="flex space-x-2">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={handleKeywordKeyPress}
                placeholder="Adicionar palavra-chave"
              />
              <Button type="button" onClick={addKeyword} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Lista de palavras-chave */}
            <div className="flex flex-wrap gap-2">
              {keywordFields.map((field, index) => (
                <Badge
                  key={field.id}
                  variant="outline"
                  className="flex items-center space-x-1"
                >
                  <span>{watchedKeywords[index]}</span>
                  <button
                    type="button"
                    onClick={() => removeKeyword(index)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            {errors.keywords && (
              <p className="text-sm text-red-600">{errors.keywords.message}</p>
            )}
          </div>

          {/* Autores Relacionados */}
          <div className="space-y-2">
            <Label>Autores relacionados (co-autores)</Label>
            <div className="flex space-x-2">
              <Input
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                onKeyPress={handleAuthorKeyPress}
                placeholder="Nome do co-autor"
              />
              <Button type="button" onClick={addAuthor} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Lista de autores */}
            <div className="flex flex-wrap gap-2">
              {authorFields.map((field, index) => (
                <Badge
                  key={field.id}
                  variant="outline"
                  className="flex items-center space-x-1"
                >
                  <span>{watchedAuthors[index]}</span>
                  <button
                    type="button"
                    onClick={() => removeAuthor(index)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            {errors.relatedAuthors && (
              <p className="text-sm text-red-600">
                {errors.relatedAuthors.message}
              </p>
            )}
          </div>

          {/* Arquivo PDF */}
          <div className="space-y-2">
            <Label>Arquivo do artigo (PDF) *</Label>
            <FileUpload
              accept={FILE_CONFIG.allowedPdfTypes.join(",")}
              maxSize={FILE_CONFIG.maxSize}
              onFileSelect={handlePdfUpload}
              uploadProgress={isUploading ? uploadProgress : undefined}
              uploadedFile={
                uploadedFile
                  ? {
                      name: uploadedFile.fileName || "arquivo.pdf",
                      size: uploadedFile.fileSize || 0,
                    }
                  : null
              }
            />
            <p className="text-xs text-gray-500">
              Envie seu artigo em formato PDF. Certifique-se de que o arquivo
              está formatado corretamente.
            </p>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline">
              Salvar como rascunho
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting ? "Submetendo..." : "Submeter artigo"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
