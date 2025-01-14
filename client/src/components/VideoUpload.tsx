import React, { useRef } from "react";
import styled from "styled-components";
import { api, useGetUploadUrlMutation } from "../services/api";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

const UploadButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: darkgoldenrod;
  min-height: 38px;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: goldenrod;
    color: white;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;
const VideoUpload: React.FC = () => {
  const [getUploadUrl] = useGetUploadUrlMutation();
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { url } = await getUploadUrl({
        fileName: file.name,
        fileType: file.type,
      }).unwrap();

      // Create the actual upload promise
      const uploadPromise = fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
        mode: "cors",
        credentials: "omit",
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
    <>
      <UploadButton onClick={handleButtonClick}>Upload Video</UploadButton>
      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
      />
    </>
  );
};

export default VideoUpload;
