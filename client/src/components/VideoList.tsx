import React, { useState } from "react";
import styled from "styled-components";
import VideoPlayer from "./VideoPlayer";
import VideoMetadataForm from "./VideoMetadataForm";
import { useGetVideosQuery } from "../services/api";
import { Video } from "../types/video";
import VideoDetails from "./VideoDetails";

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

const FlexContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  width: 100%;
  @media (min-width: 768px) {
    gap: 0.2rem;
  }
`;

const VideoCard = styled.div`
  border: 1px solid #e5e7eb;
  background-color: white;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1rem;
  cursor: pointer;
  width: 35vw;
  transition: background-color 0.2s;
  gap: 0.2rem;

  @media (min-width: 768px) {
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
    align-items: center;
  }

  &:hover {
    background-color: #f9fafb;
  }
`;

const HeaderRow = styled.div`
  display: none;

  @media (min-width: 768px) {
    display: flex;
    padding: 0rem 1rem;
    width: 100%;
    justify-content: space-between;
    align-items: center;

    font-weight: bold;
    font-size: 11px;
    text-transform: uppercase;
    color: black;
    font-style: normal;
  }
`;

const HeaderTitle = styled.h4`
  width: 25%;
`;

const VideoTitle = styled.h4`
  font-weight: 500;
  margin: 5px 0px;

  @media (min-width: 768px) {
    width: 25%;
  }
`;

const HeaderCategory = styled.span`
  width: 15%;
`;

const Category = styled.span`
  font-weight: 400;
  text-transform: uppercase;
  font-size: 0.875rem;
  color: #6b7280;

  @media (min-width: 768px) {
    width: 15%;
  }
`;

const HeaderDescription = styled.span`
  width: 30%;
`;

const Description = styled.span`
  font-style: italic;
  margin: 5px 0px;
  font-size: 0.875rem;
  color: #6b7280;

  @media (min-width: 768px) {
    width: 30%;
    margin: 0px;
  }
`;

const HeaderTags = styled.div`
  width: 30%;
  display: flex;
  justify-content: right;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin: 5px 0px;

  @media (min-width: 768px) {
    width: 30%;
    justify-content: right;
  }
`;

const Tag = styled.span`
  background-color: navy;
  padding: 0.15rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: white;
`;
const EmptyMessage = styled.div`
  text-align: center;
  color: #6b7280;
  padding: 2rem;
`;

const VideoList: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const { data, error, isLoading } = useGetVideosQuery();
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const formatFileName = (key: string) => {
    return key.split("/").pop() || key;
  };

  if (isLoading) return <LoadingMessage>Loading videos...</LoadingMessage>;
  if (error) return <ErrorMessage>Error loading videos</ErrorMessage>;

  return (
    <Container>
      {selectedVideo && (
        <FlexContainer>
          <VideoPlayerWrapper>
            <VideoPlayer url={selectedVideo.url} />
          </VideoPlayerWrapper>
          {isEditMode ||
          !data?.videos.find((video) => video.id === selectedVideo.id)
            ?.metadata ? (
            <VideoMetadataForm
              key={selectedVideo.id}
              videoId={selectedVideo.id}
              metadata={
                data?.videos.find((video) => video.id === selectedVideo.id)
                  ?.metadata
              }
              closeForm={() => setIsEditMode(false)}
            />
          ) : (
            <VideoDetails
              editDetails={() => setIsEditMode(true)}
              metadata={
                data?.videos.find((video) => video.id === selectedVideo.id)
                  ?.metadata
              }
            />
          )}
        </FlexContainer>
      )}
      <FlexContainer>
        <HeaderRow>
          <HeaderTitle>Title</HeaderTitle>
          <HeaderCategory>Category</HeaderCategory>
          <HeaderDescription>Description</HeaderDescription>
          <HeaderTags>Tags</HeaderTags>
        </HeaderRow>
        {data?.videos.map((video) => (
          <VideoCard key={video.id} onClick={() => setSelectedVideo(video)}>
            <VideoTitle>
              {video.metadata?.title || formatFileName(video.key)}
            </VideoTitle>
            <Category>{video.metadata?.category || ""}</Category>
            <Description>{video.metadata?.description || ""}</Description>
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
