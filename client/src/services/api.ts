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

interface UploadRequest {
  fileName: string;
  fileType: string;
  file: File; // Added to help with optimistic updates
}

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000/api/" }),
  tagTypes: ["Videos"],
  endpoints: (builder) => ({
    getVideos: builder.query<{ videos: Video[] }, void>({
      query: () => "videos",
      providesTags: ["Videos"],
    }),
    getUploadUrl: builder.mutation<UploadUrlResponse, UploadRequest>({
      query: ({ fileName, fileType }) => ({
        url: "get-upload-url",
        method: "POST",
        body: { fileName, fileType },
      }),
      async onQueryStarted({ file, fileName }, { queryFulfilled, dispatch }) {
        // Optimistic update
        const optimisticVideo: Video = {
          id: `temp-${Date.now()}`,
          key: `uploads/${Date.now()}-${fileName}`,
          url: URL.createObjectURL(file),
          lastModified: new Date().toISOString(),
          size: file.size,
        };

        const patchResult = dispatch(
          api.util.updateQueryData("getVideos", undefined, (draft) => {
            draft.videos.unshift(optimisticVideo);
          })
        );

        try {
          const { data } = await queryFulfilled;

          // Now perform the actual S3 upload
          const uploadResponse = await fetch(data.url, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": file.type,
            },
          });

          if (!uploadResponse.ok) {
            throw new Error("Upload failed");
          }
        } catch (error) {
          // Undo the optimistic update on failure
          patchResult.undo();

          throw error;
        }
      },
      invalidatesTags: ["Videos"],
    }),
  }),
});

export const { useGetVideosQuery, useGetUploadUrlMutation } = api;
