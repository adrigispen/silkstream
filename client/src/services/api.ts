import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface VideoMetadata {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  category?: string;
  originalFileName: string;
  s3Key: string;
  uploadDate: string;
}

interface Video {
  id: string;
  key: string;
  url: string;
  lastModified: string;
  size: number;
}

interface UploadUrlResponse {
  url: string;
  key: string;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000/api/" }),
  tagTypes: ["Videos"],
  endpoints: (builder) => ({
    getVideos: builder.query<{ videos: Video[] }, void>({
      query: () => "videos",
      providesTags: ["Videos"],
    }),
    getVideoMetadata: builder.query<VideoMetadata, string>({
      query: (videoId) => `videos/${videoId}/metadata`,
      providesTags: (_result, _error, videoId) => [
        { type: "Videos", id: videoId },
      ],
    }),
    updateVideoMetadata: builder.mutation<
      void,
      { videoId: string; metadata: Partial<VideoMetadata> }
    >({
      query: ({ videoId, metadata }) => ({
        url: `videos/${videoId}.metadata`,
        method: "PATCH",
        body: metadata,
      }),
      invalidatesTags: (_result, _error, { videoId }) => [
        { type: "Videos", id: videoId },
        "Videos",
      ],
    }),
    getUploadUrl: builder.mutation<
      UploadUrlResponse,
      { fileName: string; fileType: string }
    >({
      query: (body) => ({
        url: "get-upload-url",
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Videos"],
    }),
  }),
});

export const {
  useGetVideosQuery,
  useGetVideoMetadataQuery,
  useUpdateVideoMetadataMutation,
  useGetUploadUrlMutation,
} = api;
