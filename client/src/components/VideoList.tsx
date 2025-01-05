import React, { useState } from "react";
import styled from "styled-components";
import VideoPlayer from "./VideoPlayer";
import VideoMetadataForm from "./VideoMetadataForm";
import { useGetVideosQuery } from "../services/api";
import { Video } from "../types/video";

const Container = styled.div`
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  justify-content: center;
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

const Image = styled.img`
  max-height: 50vh;
`;

const FlexContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const VideoCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.5rem;
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
        <FlexContainer>
          <VideoPlayerWrapper>
            <VideoPlayer
              url={selectedVideo.url}
              title={formatFileName(selectedVideo.key)}
            />
          </VideoPlayerWrapper>
          <VideoMetadataForm
            videoId={selectedVideo.id}
            initialMetadata={selectedVideo.metadata}
          />
        </FlexContainer>
      ) : (
        <Image src="/hang.svg" />
      )}
      <FlexContainer>
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
      </FlexContainer>

      {data?.videos.length === 0 && (
        <EmptyMessage>No videos uploaded yet</EmptyMessage>
      )}
    </Container>
  );
};

export default VideoList;
