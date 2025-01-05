import React, { useState } from "react";
import styled from "styled-components";

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

const StatusMessage = styled.p<{ status: string }>`
  padding: 0.5rem;
  border-radius: 0.25rem;
  text-align: center;

  ${({ status }) => {
    switch (status) {
      case "Upload successful!":
        return `
          background-color: #dcfce7;
          color: #166534;
        `;
      case "Upload failed! Check console for details.":
        return `
          background-color: #fee2e2;
          color: #991b1b;
        `;
      default:
        return `
          background-color: #f3f4f6;
          color: #374151;
        `;
    }
  }}
`;

const VideoUpload: React.FC = () => {
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadStatus("Getting upload URL...");

      // Get pre-signed URL from our backend
      const urlResponse = await fetch(
        "http://localhost:3000/api/get-upload-url",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
          }),
        }
      );

      const { url } = await urlResponse.json();

      setUploadStatus("Uploading to S3...");

      // Upload directly to S3 using the pre-signed URL
      const uploadResponse = await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (uploadResponse.ok) {
        setUploadStatus("Upload successful!");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("Upload failed! Check console for details.");
    }
  };

  return (
    <UploadContainer>
      <FileInput type="file" accept="video/*" onChange={handleFileChange} />
      {uploadStatus && (
        <StatusMessage status={uploadStatus}>{uploadStatus}</StatusMessage>
      )}
    </UploadContainer>
  );
};

export default VideoUpload;
