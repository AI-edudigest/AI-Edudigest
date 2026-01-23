export interface UploadProgress {
  (progress: number): void;
}

export interface UploadResult {
  success: boolean;
  pdfUrl: string;
  pdfStoragePath: string;
  pdfFileName: string;
  pdfSize: number;
  uploadedAt: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

export const uploadPdf: (
  file: File,
  contentId: string,
  onProgress?: UploadProgress | null
) => Promise<UploadResult>;

export const deletePdf: (storagePath: string) => Promise<DeleteResult>;

export const formatFileSize: (bytes: number) => string;
