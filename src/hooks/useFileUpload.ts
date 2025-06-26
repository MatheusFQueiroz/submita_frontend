"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { FileUploadResponse } from "@/types";
import { FILE_CONFIG } from "@/lib/constants";
import toast from "react-hot-toast";

interface UseFileUploadReturn {
  uploadProgress: number;
  isUploading: boolean;
  uploadedFile: FileUploadResponse | null;
  uploadImage: (file: File) => Promise<FileUploadResponse>;
  uploadPdf: (file: File) => Promise<FileUploadResponse>;
  reset: () => void;
}

export function useFileUpload(): UseFileUploadReturn {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<FileUploadResponse | null>(
    null
  );

  const validateFile = useCallback((file: File, allowedTypes: string[]) => {
    // Verifica tipo
    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(
          ", "
        )}`
      );
    }

    // Verifica tamanho
    if (file.size > FILE_CONFIG.maxSize) {
      throw new Error(
        `Arquivo muito grande. Tamanho máximo: ${
          FILE_CONFIG.maxSize / 1024 / 1024
        }MB`
      );
    }
  }, []);

  const uploadImage = useCallback(
    async (file: File): Promise<FileUploadResponse> => {
      try {
        validateFile(file, FILE_CONFIG.allowedImageTypes);
        setIsUploading(true);
        setUploadProgress(0);

        const response = await api.uploadFile(
          "/files/upload/image",
          file,
          (progress) => setUploadProgress(progress)
        );

        setUploadedFile(response);
        toast.success("Imagem enviada com sucesso!");
        return response;
      } catch (error: any) {
        console.error("Erro no upload da imagem:", error);
        toast.error(error.message || "Erro ao enviar imagem");
        throw error;
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [validateFile]
  );

  const uploadPdf = useCallback(
    async (file: File): Promise<FileUploadResponse> => {
      try {
        validateFile(file, FILE_CONFIG.allowedPdfTypes);
        setIsUploading(true);
        setUploadProgress(0);

        const response = await api.uploadFile(
          "/files/upload/pdf",
          file,
          (progress) => setUploadProgress(progress)
        );

        setUploadedFile(response);
        toast.success("PDF enviado com sucesso!");
        return response;
      } catch (error: any) {
        console.error("Erro no upload do PDF:", error);
        toast.error(error.message || "Erro ao enviar PDF");
        throw error;
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [validateFile]
  );

  const reset = useCallback(() => {
    setUploadProgress(0);
    setIsUploading(false);
    setUploadedFile(null);
  }, []);

  return {
    uploadProgress,
    isUploading,
    uploadedFile,
    uploadImage,
    uploadPdf,
    reset,
  };
}
