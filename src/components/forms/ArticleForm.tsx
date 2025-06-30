"use client";

import React, { useState } from "react";
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
import { Plus, X } from "lucide-react";
import { articleSchema, ArticleFormData } from "@/lib/validations";
import { useFileUpload } from "@/hooks/useFileUpload";
import { FILE_CONFIG } from "@/lib/constants";
import { Event } from "@/types";

interface ArticleFormProps {
  onSubmit: (data: ArticleFormData & { fileId?: string }) => Promise<void>;
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

      const formData = {
        ...data,
        fileId: uploadedFile?.fileId,
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? "Editar Artigo" : "Submeter Novo Artigo"}
        </CardTitle>
        <p className="text-sm text-gray-600">
          Preencha todas as informações necessárias para submeter seu artigo
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Evento */}
          <div className="space-y-2">
            <Label>Evento *</Label>
            <Select onValueChange={(value) => setValue("eventId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o evento" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
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
              placeholder="Digite o título do seu artigo"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Resumo */}
          <div className="space-y-2">
            <Label htmlFor="abstract">Resumo *</Label>
            <Textarea
              id="abstract"
              placeholder="Escreva um resumo detalhado do seu artigo (mínimo 100 caracteres)"
              rows={6}
              {...register("abstract")}
            />
            {errors.abstract && (
              <p className="text-sm text-red-600">{errors.abstract.message}</p>
            )}
            <p className="text-xs text-gray-500">
              O resumo deve apresentar claramente o objetivo, metodologia,
              resultados e conclusões
            </p>
          </div>

          {/* Palavras-chave */}
          <div className="space-y-2">
            <Label>Palavras-chave * (mínimo 3)</Label>
            <div className="flex space-x-2">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={handleKeywordKeyPress}
                placeholder="Digite uma palavra-chave"
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
                  variant="secondary"
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
