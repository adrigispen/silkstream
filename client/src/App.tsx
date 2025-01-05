import React, { useState } from "react";

function App() {
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
    <div>
      <h1>S3 Upload Test (with Pre-signed URLs)</h1>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <img src="/hang.svg" />
      {uploadStatus && <p>{uploadStatus}</p>}
    </div>
  );
}

export default App;
