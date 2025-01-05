import React from "react";
import styled from "styled-components";
import { api, useGetUploadUrlMutation } from "../services/api";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

const UploadContainer = styled.div`
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const FileInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;

  &::file-selector-button {
    padding: 0.5rem 1rem;
    margin-right: 1rem;
    border: none;
    border-radius: 0.25rem;
    background-color: #3b82f6;
    color: white;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #2563eb;
    }
  }
`;

const VideoUpload: React.FC = () => {
  const [getUploadUrl] = useGetUploadUrlMutation();
  const dispatch = useDispatch();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { url } = await getUploadUrl({
        fileName: file.name,
        fileType: file.type,
        file,
      }).unwrap();

      // Create the actual upload promise
      const uploadPromise = fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      // Show toast for the actual upload
      await toast.promise(uploadPromise, {
        loading: "Uploading video...",
        success: "Video uploaded successfully!",
        error: "Upload failed",
      });

      if (!(await uploadPromise).ok) {
        throw new Error("Upload failed");
      }

      // Invalidate and refetch videos after successful S3 upload
      dispatch(api.util.invalidateTags(["Videos"]));
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    <UploadContainer>
      <FileInput type="file" accept="video/*" onChange={handleFileChange} />
    </UploadContainer>
  );
};

export default VideoUpload;
