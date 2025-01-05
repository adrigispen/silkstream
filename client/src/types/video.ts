export interface VideoMetadata {
  id: string;
  title: string;
  fileName: string;
  uploadDate: string;
  size: number;
  duration?: number;
  url?: string;
}

export interface UploadProgress {
  progress: number;
  status: "idle" | "uploading" | "completed" | "error";
  error?: string;
}
