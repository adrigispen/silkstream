// client/src/components/VideoList.tsx
import React, { useState } from "react";
import styled from "styled-components";
import VideoPlayer from "./VideoPlayer";
import { useGetVideosQuery } from "../services/api";

interface Video {
  id: string;
  key: string;
  url: string;
  lastModified: string;
  size: number;
}

const Container = styled.div`
  padding: 1rem;
  margin: 0 auto;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 1rem;
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  padding: 1rem;
`;

const VideoPlayerWrapper = styled.div`
  margin-bottom: 2rem;
`;

const GridContainer = styled.div`
  display: grid;
  gap: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const VideoCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f9fafb;
  }
`;

const VideoTitle = styled.h3`
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const VideoInfo = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: #6b7280;
  padding: 2rem;
`;

const VideoList: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const { data, error, isLoading } = useGetVideosQuery();

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatFileName = (key: string) => {
    return key.split("/").pop() || key;
  };

  if (isLoading) return <LoadingMessage>Loading videos...</LoadingMessage>;
  if (error) return <ErrorMessage>Error loading videos</ErrorMessage>;

  return (
    <Container>
      {selectedVideo ? (
        <VideoPlayerWrapper>
          <VideoPlayer
            url={selectedVideo.url}
            title={formatFileName(selectedVideo.key)}
          />
        </VideoPlayerWrapper>
      ) : (
        <img src="/hang.svg" />
      )}

      <GridContainer>
        {data?.videos.map((video) => (
          <VideoCard key={video.id} onClick={() => setSelectedVideo(video)}>
            <VideoTitle>{formatFileName(video.key)}</VideoTitle>
            <VideoInfo>
              <p>Size: {formatFileSize(video.size)}</p>
              <p>
                Uploaded: {new Date(video.lastModified).toLocaleDateString()}
              </p>
            </VideoInfo>
          </VideoCard>
        ))}
      </GridContainer>

      {data?.videos.length === 0 && (
        <EmptyMessage>No videos uploaded yet</EmptyMessage>
      )}
    </Container>
  );
};

export default VideoList;
