export interface VideoMetadata {
  id: string;
  title?: string;
  description?: string;
  tags?: string[];
  category?: string;
  originalFileName?: string;
  s3Key: string;
  uploadDate: string;

  thumbnailKey?: string;
  createdDate?: string; // ISO string
  duration?: number;
  processingError?: string;
}

export interface ProcessingResult {
  thumbnailUrl?: string;
  createdDate?: Date;
  duration?: number;
  error?: string;
}

export interface Video {
  id: string;
  key: string;
  url: string;
  lastModified: string;
  size: number;
  metadata: VideoMetadata | null;
}

export interface VideoQueryParams {
  search?: string;
  sortBy?: "title" | "category" | "uploadDate" | "size" | "createdDate";
  sortDirection?: "asc" | "desc";
  tags?: string[];
  category?: string;
  page?: number;
  limit?: number;
}

export interface VideoMetadataUpsert {
  videoId: string;
  metadata: Partial<VideoMetadata> & {
    s3Key: string;
    uploadDate: string;
  };
  isNew?: boolean;
}
