import { useState } from "react";
import { useFileUpload } from "./useFileUpload";
import { eventService } from "@/lib/service/eventService";
import { EventFormData } from "@/types/form";
import { Event } from "@/types";
import toast from "react-hot-toast";

export function useCreateEvent() {
  const [isCreating, setIsCreating] = useState(false);
  const { uploadImage, isUploading } = useFileUpload();

  const createEvent = async (formData: EventFormData): Promise<Event> => {
    try {
      setIsCreating(true);

      let bannerUrl: string | undefined;

      // 1️⃣ PRIMEIRO: Upload da imagem (se fornecida)
      if (formData.image) {
        console.log("📤 Fazendo upload da imagem...");
        const uploadResponse = await uploadImage(formData.image);
        bannerUrl = uploadResponse.fileId;
        console.log("✅ Upload concluído. ID da imagem:", bannerUrl);
      }

      // 2️⃣ SEGUNDO: Criar evento com ID da imagem
      const eventData = {
        name: formData.name, // ✅ Usar "name"
        description: formData.description,
        banner: bannerUrl, // ✅ Usar "banner" com ID da imagem
        eventStartDate: formData.eventStartDate,
        eventEndDate: formData.eventEndDate,
        submissionStartDate: formData.submissionStartDate,
        submissionEndDate: formData.submissionEndDate,
        evaluationType: formData.evaluationType,
      };

      console.log("📝 Criando evento com dados:", eventData);
      const event = await eventService.createEvent(eventData);

      toast.success("Evento criado com sucesso!");
      console.log("✅ Evento criado:", event);
      return event;
    } catch (error: any) {
      console.error("❌ Erro ao criar evento:", error);
      toast.error(error.message || "Erro ao criar evento");
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createEvent,
    isCreating: isCreating || isUploading,
  };
}
