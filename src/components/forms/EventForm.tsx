"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
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
import { FileUpload } from "@/components/common/FileUpload";
import { eventSchema, EventFormData } from "@/lib/validations";
import { useFileUpload } from "@/hooks/useFileUpload";
import { FILE_CONFIG } from "@/lib/constants";

interface EventFormProps {
  onSubmit: (data: EventFormData & { imageId?: string }) => Promise<void>;
  initialData?: Partial<EventFormData>;
  isSubmitting?: boolean;
}

export function EventForm({
  onSubmit,
  initialData,
  isSubmitting = false,
}: EventFormProps) {
  const [error, setError] = useState<string>("");
  const { uploadImage, uploadedFile, uploadProgress, isUploading } =
    useFileUpload();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: initialData,
  });

  const handleFormSubmit = async (data: EventFormData) => {
    try {
      setError("");

      const formData = {
        ...data,
        imageId: uploadedFile?.fileId,
      };

      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar evento");
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      await uploadImage(file);
    } catch (error) {
      console.error("Erro no upload da imagem:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? "Editar Evento" : "Criar Novo Evento"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="name">Título do evento *</Label>
            <Input
              id="name"
              placeholder="Ex: Simpósio de Tecnologia 2024"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              placeholder="Descreva o evento, seus objetivos e informações relevantes..."
              rows={4}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Imagem */}
          <div className="space-y-2">
            <Label>Imagem do evento</Label>
            <FileUpload
              accept={FILE_CONFIG.allowedImageTypes.join(",")}
              maxSize={FILE_CONFIG.maxSize}
              onFileSelect={handleImageUpload}
              uploadProgress={isUploading ? uploadProgress : undefined}
              uploadedFile={
                uploadedFile
                  ? { name: uploadedFile.fileName, size: uploadedFile.fileSize }
                  : null
              }
            />
            <p className="text-xs text-gray-500">
              Imagem que será exibida na página do evento e nos destaques
            </p>
          </div>

          {/* Datas do Evento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventStartDate">
                Data de início do evento *
              </Label>
              <Input
                id="eventStartDate"
                type="datetime-local"
                {...register("eventStartDate", {
                  valueAsDate: true,
                })}
              />
              {errors.eventStartDate && (
                <p className="text-sm text-red-600">
                  {errors.eventStartDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventEndDate">
                Data de fim do evento *
              </Label>
              <Input
                id="eventEndDate"
                type="datetime-local"
                {...register("eventEndDate", {
                  valueAsDate: true,
                })}
              />
              {errors.eventEndDate && (
                <p className="text-sm text-red-600">
                  {errors.eventEndDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Datas da Submissão */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="submissionStartDate">
                Data de início das submissões *
              </Label>
              <Input
                id="submissionStartDate"
                type="datetime-local"
                {...register("submissionStartDate", {
                  valueAsDate: true,
                })}
              />
              {errors.submissionStartDate && (
                <p className="text-sm text-red-600">
                  {errors.submissionStartDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="submissionEndDate">
                Data de fim das submissões *
              </Label>
              <Input
                id="submissionEndDate"
                type="datetime-local"
                {...register("submissionEndDate", {
                  valueAsDate: true,
                })}
              />
              {errors.submissionEndDate && (
                <p className="text-sm text-red-600">
                  {errors.submissionEndDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Tipo de Avaliação */}
          <div className="space-y-2">
            <Label>Tipo de avaliação *</Label>
            <Select
              onValueChange={(value) =>
                setValue("evaluationType", value as any)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de avaliação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DIRECT">Avaliação Direta</SelectItem>
                <SelectItem value="PAIR">Avaliação por Pares</SelectItem>
                <SelectItem value="PANEL">Painel de Avaliação</SelectItem>
              </SelectContent>
            </Select>
            {errors.evaluationType && (
              <p className="text-sm text-red-600">
                {errors.evaluationType.message}
              </p>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar evento"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
