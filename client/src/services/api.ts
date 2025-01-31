import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  Video,
  VideoMetadata,
  TagSuggestion,
  PaginatedResponse,
  PaginatedMetadataResponse,
} from "../types/video";

interface UploadUrlResponse {
  url: string;
  key: string;
}

const VIDEO_TAG_TYPES = {
  VIDEO: "Video",
  VIDEO_LIST: "VideoList",
  UNTAGGED: "Untagged",
  JUST_TAGGED: "JustTagged",
  FAVORITE: "Favorite",
} as const;

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL }),
  tagTypes: Object.values(VIDEO_TAG_TYPES),
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
      providesTags: (result) =>
        result
          ? [
              ...result.videos.map(({ id }) => ({
                type: VIDEO_TAG_TYPES.VIDEO,
                id,
              })),
              { type: VIDEO_TAG_TYPES.VIDEO_LIST, id: "LIST" },
            ]
          : [{ type: VIDEO_TAG_TYPES.VIDEO_LIST, id: "LIST" }],
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
    getAllVideos: builder.query<
      PaginatedMetadataResponse<VideoMetadata>,
      {
        pageToken?: string;
        limit?: number;
        sortBy?: string;
        sortDirection?: string;
        search?: string;
        category?: string;
        tags?: string[];
      }
    >({
      query: (params = {}) => ({
        url: "videos-archive",
        params: {
          ...params,
          limit: params.limit || 20,
        },
      }),
      providesTags: [VIDEO_TAG_TYPES.VIDEO],
      merge: (currentCache, newItems, { arg }) => {
        if (!arg?.pageToken) {
          return newItems;
        }
        return {
          metadata: [...currentCache.metadata, ...newItems.metadata],
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
    getUntaggedVideos: builder.query<{ videos: Video[] }, void>({
      query: () => ({
        url: "videos-untagged",
      }),
      providesTags: [VIDEO_TAG_TYPES.UNTAGGED],
    }),
    getRecentlyTaggedVideos: builder.query<{ videos: Video[] }, void>({
      query: () => ({
        url: "videos-just-tagged",
      }),
      providesTags: [VIDEO_TAG_TYPES.JUST_TAGGED],
    }),
    getVideoById: builder.query<Video, string>({
      query: (id) => `videos/${encodeURIComponent(id)}`,
      providesTags: (_result, _error, videoId) => [
        { type: VIDEO_TAG_TYPES.VIDEO, id: videoId },
      ],
    }),
    checkFavorite: builder.query<{ isFavorited: boolean }, string>({
      query: (videoId) => ({
        url: `videos/${encodeURIComponent(videoId)}/is-favorite`,
        method: "GET",
      }),
      providesTags: (_result, _error, videoId) => [
        { type: VIDEO_TAG_TYPES.FAVORITE, id: videoId },
      ],
    }),
    getVideoMetadata: builder.query<VideoMetadata, string>({
      query: (videoId) => `videos/${videoId}/metadata`,
      providesTags: (_result, _error, videoId) => [
        { type: VIDEO_TAG_TYPES.VIDEO, id: videoId },
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
        { type: VIDEO_TAG_TYPES.VIDEO, id: videoId },
        VIDEO_TAG_TYPES.VIDEO_LIST,
        VIDEO_TAG_TYPES.UNTAGGED,
        VIDEO_TAG_TYPES.JUST_TAGGED,
      ],
    }),
    generateThumbnail: builder.mutation<void, { videoKey: string }>({
      query: ({ videoKey }) => ({
        url: `videos/${encodeURIComponent(videoKey)}/thumbnail`,
        method: "POST",
      }),
      invalidatesTags: [VIDEO_TAG_TYPES.VIDEO_LIST],
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
      invalidatesTags: [VIDEO_TAG_TYPES.VIDEO_LIST, VIDEO_TAG_TYPES.UNTAGGED],
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
      invalidatesTags: [
        VIDEO_TAG_TYPES.VIDEO_LIST,
        VIDEO_TAG_TYPES.UNTAGGED,
        VIDEO_TAG_TYPES.JUST_TAGGED,
      ],
    }),
    batchDeleteVideos: builder.mutation<void, { videoIds: string[] }>({
      query: (payload) => ({
        url: "videos/batch-delete",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        VIDEO_TAG_TYPES.VIDEO_LIST,
        VIDEO_TAG_TYPES.UNTAGGED,
        VIDEO_TAG_TYPES.JUST_TAGGED,
      ],
    }),
    batchUpsertMetadata: builder.mutation<
      void,
      {
        videoId: string;
        metadata: {
          tags?: string[];
          category?: string;
          uploadDate?: string;
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
      invalidatesTags: (_result, _error, updates) => [
        ...updates.map(({ videoId }) => ({
          type: VIDEO_TAG_TYPES.VIDEO,
          id: videoId,
        })),
        VIDEO_TAG_TYPES.VIDEO_LIST,
        VIDEO_TAG_TYPES.UNTAGGED,
        VIDEO_TAG_TYPES.JUST_TAGGED,
      ],
    }),
    toggleFavorite: builder.mutation<{ isFavorited: boolean }, string>({
      query: (videoId) => ({
        url: `videos/${encodeURIComponent(videoId)}/favorite`,
        method: "POST",
      }),
      invalidatesTags: [
        VIDEO_TAG_TYPES.VIDEO_LIST,
        VIDEO_TAG_TYPES.UNTAGGED,
        VIDEO_TAG_TYPES.JUST_TAGGED,
      ],
    }),
    getRandomFavorites: builder.query<Video[], number | void>({
      query: (limit = 20) => ({
        url: "videos/random-favorites",
        params: { limit },
      }),
      providesTags: [VIDEO_TAG_TYPES.FAVORITE],
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
  useGetVideoByIdQuery,
  useToggleFavoriteMutation,
  useGetRandomFavoritesQuery,
  useGetAllVideosQuery,
  useCheckFavoriteQuery,
  useGetUntaggedVideosQuery,
  useGetRecentlyTaggedVideosQuery,
  useGenerateThumbnailMutation,
} = api;
