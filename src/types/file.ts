export interface FileUploadResponse {
  success: boolean;
  fileId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  message?: string;
}

export interface FileMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadDate: Date;
  bucket: string;
}
