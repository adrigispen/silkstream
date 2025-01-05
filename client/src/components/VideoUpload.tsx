import React, { useState, useRef } from "react";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { UploadProgress } from "../types/video";

const VideoUpload: React.FC = () => {
  const [progress, setProgress] = useState<UploadProgress>({
    progress: 0,
    status: "idle",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setSelectedFile(file);
      setProgress({ progress: 0, status: "idle" });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setProgress({ progress: 0, status: "uploading" });

      // TODO: Replace with your S3 bucket details and credentials management
      const s3Client = new S3Client({
        region: import.meta.env.VITE_AWS_REGION,
        credentials: {
          accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
          secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
        },
      });

      const command = new PutObjectCommand({
        Bucket: import.meta.env.VITE_AWS_BUCKET_NAME,
        Key: `videos/${Date.now()}-${selectedFile.name}`,
        Body: selectedFile,
        ContentType: selectedFile.type,
      });

      await s3Client.send(command);

      setProgress({ progress: 100, status: "completed" });
    } catch (error) {
      console.error("Upload error:", error);
      setProgress({
        progress: 0,
        status: "error",
        error: "Failed to upload video",
      });
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        ref={fileInputRef}
        className="hidden"
      />

      <div>
        <button onClick={() => fileInputRef.current?.click()}>
          Select Video
        </button>

        {selectedFile && (
          <div>
            <p>{selectedFile.name}</p>
            <button
              onClick={handleUpload}
              disabled={progress.status === "uploading"}
            >
              {progress.status === "uploading" ? "Uploading..." : "Upload"}
            </button>
          </div>
        )}

        {progress.status === "uploading" && (
          <div>
            <div style={{ width: `${progress.progress}%` }} />
          </div>
        )}

        {progress.status === "error" && <p>{progress.error}</p>}
      </div>
    </div>
  );
};

export default VideoUpload;
