import { useState } from "react";
import { useFileUpload } from "./useFileUpload";
import { eventService } from "@/lib/service/eventService";
import { EventFormData } from "@/lib/validations";
import { Event } from "@/types";
import toast from "react-hot-toast";

interface UseUpdateEventReturn {
  updateEvent: (eventId: string, formData: EventFormData) => Promise<Event>;
  isUpdating: boolean;
}

export function useUpdateEvent(): UseUpdateEventReturn {
  const [isUpdating, setIsUpdating] = useState(false);
  const { uploadImage, isUploading } = useFileUpload();

  const updateEvent = async (
    eventId: string,
    formData: EventFormData
  ): Promise<Event> => {
    try {
      setIsUpdating(true);

      let bannerUrl: string | undefined;

      // 1️⃣ Upload da imagem (se fornecida)
      if (formData.image) {
        const uploadResponse = await uploadImage(formData.image);
        bannerUrl = uploadResponse.fileId;
      }

      // 2️⃣ Preparar dados para atualização
      const updateData = {
        name: formData.name,
        description: formData.description,
        eventStartDate: formData.eventStartDate,
        eventEndDate: formData.eventEndDate,
        submissionStartDate: formData.submissionStartDate,
        submissionEndDate: formData.submissionEndDate,
        evaluationType: formData.evaluationType,
        ...(bannerUrl && { banner: bannerUrl }),
      };

      console.log("📝 Atualizando evento com dados:", updateData);
      const updatedEvent = await eventService.updateEvent(eventId, updateData);

      toast.success("Evento atualizado com sucesso!");
      console.log("✅ Evento atualizado:", updatedEvent);
      return updatedEvent;
    } catch (error: any) {
      console.error("❌ Erro ao atualizar evento:", error);
      toast.error(error.message || "Erro ao atualizar evento");
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateEvent,
    isUpdating: isUpdating || isUploading,
  };
}
