import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  Video,
  VideoMetadata,
  TagSuggestion,
  PaginatedResponse,
} from "../types/video";

interface UploadUrlResponse {
  url: string;
  key: string;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL }),
  tagTypes: ["Videos"],
  endpoints: (builder) => ({
    getVideos: builder.query<
      PaginatedResponse<Video>,
      {
        pageToken?: string;
        limit?: number;
        search?: string;
        category?: string;
        tags?: string[];
        sortBy?: string;
        sortDirection?: string;
      }
    >({
      query: (params = {}) => ({
        url: "videos",
        params: {
          ...params,
          tags: params.tags?.join(","),
          limit: params.limit || 10,
        },
      }),
      providesTags: ["Videos"],
      merge: (currentCache, newItems, { arg }) => {
        if (!arg?.pageToken) {
          return newItems;
        }
        return {
          videos: [...currentCache.videos, ...newItems.videos],
          totalCount: newItems.totalCount,
          nextPageToken: newItems.nextPageToken,
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        if (!currentArg || !previousArg) return false;

        const currentFilters = { ...currentArg };
        const previousFilters = { ...previousArg };
        delete currentFilters.pageToken;
        delete previousFilters.pageToken;

        return (
          currentArg.pageToken !== previousArg.pageToken ||
          JSON.stringify(currentFilters) !== JSON.stringify(previousFilters)
        );
      },
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
    getCategories: builder.query<{ categories: string[] }, void>({
      query: () => "categories",
    }),
    getTags: builder.query<{ tags: string[] }, void>({
      query: () => "tags",
    }),
    getTagSuggestions: builder.query<{ suggestions: TagSuggestion[] }, string>({
      query: (prefix) => `tags/suggest?prefix=${encodeURIComponent(prefix)}`,
    }),
    deleteVideo: builder.mutation<void, string>({
      query: (videoId) => ({
        url: `videos/${videoId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Videos"],
    }),
    batchDeleteVideos: builder.mutation<void, { videoIds: string[] }>({
      query: (payload) => ({
        url: "videos/batch-delete",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Videos"],
    }),
    batchUpsertMetadata: builder.mutation<
      void,
      {
        videoId: string;
        metadata: {
          tags?: string[];
          category?: string;
          uploadDate: string;
          originalFileName: string;
          s3Key: string;
          thumbnailKey?: string;
          createdDate?: string;
        };
        isNew: boolean;
      }[]
    >({
      query: (updates) => ({
        url: "videos/batch-upsert",
        method: "POST",
        body: updates,
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
  useGetTagSuggestionsQuery,
  useLazyGetTagSuggestionsQuery,
  useGetTagsQuery,
  useGetCategoriesQuery,
  useDeleteVideoMutation,
  useBatchDeleteVideosMutation,
  useBatchUpsertMetadataMutation,
} = api;
