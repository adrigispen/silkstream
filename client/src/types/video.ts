export interface VideoMetadata {
  id: string;
  title?: string;
  description?: string;
  tags?: string[];
  category?: string;
  originalFileName?: string;
  s3Key: string;
  uploadDate?: string;

  thumbnailKey?: string;
  createdDate?: string;
  duration?: number;
}

export interface Video {
  id: string;
  key: string;
  url: string;
  thumbnailUrl?: string;
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
  nextPageToken?: string;
  totalCount: number;
}

export interface PaginatedMetadataResponse<VideoMetadata> {
  metadata: VideoMetadata[];
  nextPageToken?: string;
  totalCount: number;
}

export interface VideosViewProps {
  videos: Video[];
  selectVideo: (video: Video) => void;
  selectedVideo: Video | null;
  sortBy: (property: string) => void;
  order: () => void;
  selectedVideoIds: string[];
  selectVideoIds: (ids: string[]) => void;
  formatDate: (date: string) => string;
  formatFileName: (name: string) => string;
}

export interface ArchiveViewProps {
  metadata: VideoMetadata[];
  sortBy: (property: string) => void;
  order: () => void;
  selectedVideoIds: string[];
  selectVideoIds: (ids: string[]) => void;
  formatDate: (date: string) => string;
  formatFileName: (name: string) => string;
}
