"use client";

import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
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
import { FileUpload } from "@/components/common/FileUpload"; // Assuming this is the correct path
import {
  EventFormData,
  EventFormFields,
  eventFormSchema,
} from "@/lib/validations";
import { useFileUpload } from "@/hooks/useFileUpload";
import { FILE_CONFIG } from "@/lib/constants";

// interface FileUploadProps {
//   accept: string;
//   maxSize: number;
//   onUpload: (file: File) => void; // Adjusted to not return Promise based on typical usage
//   isUploading: boolean;
//   uploadProgress?: number;
//   uploadedFile: { name: string; size: number } | null;
// }

interface EventFormProps {
  onSubmit: (data: EventFormData & { banner?: string }) => Promise<void>;
  initialData?: Partial<EventFormFields>;
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
  } = useForm<EventFormFields>({
    // ← Use EventFormFields
    resolver: zodResolver(eventFormSchema), // ← Use eventFormSchema
    defaultValues: initialData,
  });

  const handleFormSubmit: SubmitHandler<EventFormFields> = async (
    data: EventFormFields
  ) => {
    try {
      setError("");

      // Converta as strings para Date
      const formData: EventFormData = {
        ...data,
        eventStartDate: new Date(data.eventStartDate),
        eventEndDate: new Date(data.eventEndDate),
        submissionStartDate: new Date(data.submissionStartDate),
        submissionEndDate: new Date(data.submissionEndDate),
      };

      await onSubmit({ ...formData, banner: uploadedFile?.fileName });
    } catch (err: any) {
      setError(err.message || "Erro ao salvar evento");
    }
  };

  const handleImageUpload = (file: File) => {
    uploadImage(file).catch(() => {
      setError("Erro ao fazer upload da imagem. Por favor, tente novamente.");
    });
  };

  const watchedEvaluationType = watch("evaluationType");

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? "Editar Evento" : "Criar Novo Evento"}
        </CardTitle>
        <p className="text-sm text-gray-600">
          Preencha todos os campos obrigatórios para{" "}
          {initialData ? "atualizar" : "criar"} o evento
        </p>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do evento *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Ex: Workshop de Inovação"
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
              {...register("description")}
              placeholder="Descreva o evento, objetivos e informações importantes"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Banner/Imagem */}
          <div className="space-y-2">
            <Label>Banner do evento</Label>
            {/* Added explicit type assertion for FileUploadProps */}
            <FileUpload
              accept={FILE_CONFIG.allowedImageTypes.join(", ")}
              maxSize={FILE_CONFIG.maxSize}
              onUpload={handleImageUpload as (file: File) => void}
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
              <Label htmlFor="eventStartDate">Data de início do evento *</Label>
              <Input
                id="eventStartDate"
                type="datetime-local"
                {...register("eventStartDate")} // ← Correto
              />
              {errors.eventStartDate && (
                <p className="text-sm text-red-600">
                  {errors.eventStartDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventEndDate">Data de fim do evento *</Label>
              <Input
                id="eventEndDate"
                type="datetime-local"
                {...register("eventEndDate")} // ← Era "eventStartDate", agora "eventEndDate"
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
                {...register("submissionStartDate")} // ← Era "eventStartDate", agora "submissionStartDate"
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
                {...register("submissionEndDate")} // ← Era "eventStartDate", agora "submissionEndDate"
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
              value={watchedEvaluationType || ""}
              onValueChange={(value) =>
                setValue(
                  "evaluationType",
                  value as EventFormFields["evaluationType"]
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de avaliação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DIRECT">Avaliação Direta</SelectItem>
                <SelectItem value="PAIR">Avaliação por Pares</SelectItem>
                <SelectItem value="PANEL">Por Comitê</SelectItem>
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
            <Button
              type="submit"
              disabled={isSubmitting}
              className="btn-gradient-accent"
            >
              {isSubmitting
                ? "Salvando..."
                : initialData
                ? "Atualizar evento"
                : "Criar evento"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
