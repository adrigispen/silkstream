import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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

export const { useGetVideosQuery, useGetUploadUrlMutation } = api;
