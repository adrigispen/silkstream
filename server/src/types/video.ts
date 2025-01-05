export interface VideoMetadata {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  category?: string;
  originalFileName: string;
  s3Key: string;
  uploadDate: string;
}

export interface Video {
  id: string;
  key: string;
  url: string;
  lastModified: string;
  size: number;
  metadata: VideoMetadata | null;
}
