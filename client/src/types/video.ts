export interface VideoMetadata {
  id: string;
  title?: string;
  description?: string;
  tags?: string[];
  category?: string;
  originalFileName?: string;
  s3Key: string;
  uploadDate: string;
}

export interface Video {
  id: string;
  key: string;
  url: string;
  lastModified: string;
  size: number;
  metadata: VideoMetadata;
}

export interface UploadProgress {
  progress: number;
  status: "idle" | "uploading" | "completed" | "error";
  error?: string;
}

export interface TagSuggestion {
  tag: string;
  count: number;
  lastUsed: string;
}

export interface VideoQueryParams {
  search?: string;
  sortBy?: "title" | "category" | "uploadDate" | "size";
  sortDirection?: "asc" | "desc";
  tags?: string[];
  category?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<Video> {
  videos: Video[];
  nextPage?: string;
  totalCount: number;
}
