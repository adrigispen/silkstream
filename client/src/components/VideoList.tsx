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
  display: flex;
  flex-direction: column;
  padding: 1rem;
  cursor: pointer;
  max-width: 25vw;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f9fafb;
  }
`;

const VideoTitle = styled.h3`
  font-weight: 500;
  margin: 5px 0px;
`;

const VideoInfo = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const Category = styled.p`
  font-weight: 400;
  margin: 2px 0px;
  text-transform: uppercase;
`;

const Description = styled.p`
  margin: 2px 0px;
  font-style: italic;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.8rem;
`;

const Tag = styled.span`
  background-color: #e5e7eb;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: #4b5563;
`;
const EmptyMessage = styled.div`
  text-align: center;
  color: #6b7280;
  padding: 2rem;
`;

const VideoList: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const { data, error, isLoading } = useGetVideosQuery();

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
              title={
                selectedVideo.metadata?.title ||
                formatFileName(selectedVideo.key)
              }
            />
          </VideoPlayerWrapper>
          <VideoMetadataForm
            key={selectedVideo.id}
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
            <VideoTitle>
              {video.metadata?.title || formatFileName(video.key)}
            </VideoTitle>
            <VideoInfo>
              {video.metadata?.category && (
                <Category>{video.metadata.category}</Category>
              )}
              {video.metadata?.description && (
                <Description>{video.metadata.description}</Description>
              )}
            </VideoInfo>
            {video.metadata?.tags && video.metadata.tags.length > 0 && (
              <Tags>
                {video.metadata.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Tags>
            )}
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
