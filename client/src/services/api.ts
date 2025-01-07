import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Video, VideoMetadata, TagSuggestion } from "../types/video";

interface UploadUrlResponse {
  url: string;
  key: string;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL }),
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
        url: `videos/${encodeURIComponent(videoId)}/metadata`,
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
    getTagSuggestions: builder.query<{ suggestions: TagSuggestion[] }, string>({
      query: (prefix) => `tags/suggest?prefix=${encodeURIComponent(prefix)}`,
    }),
  }),
});

export const {
  useGetVideosQuery,
  useGetVideoMetadataQuery,
  useUpdateVideoMetadataMutation,
  useGetUploadUrlMutation,
  useGetTagSuggestionsQuery,
  useLazyGetTagSuggestionsQuery,
} = api;
