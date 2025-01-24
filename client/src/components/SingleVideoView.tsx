import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import styled from "styled-components";
import VideoPlayer from "./VideoPlayer";
import VideoDetails from "./VideoDetails";
import { useGetCategoriesQuery, useGetVideoByIdQuery } from "../services/api";
import VideoMetadataForm from "./VideoMetadataForm";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
`;

const StyledLink = styled(Link)`
  display: inline-flex;
  padding: 10px 16px;
  margin: 0 1rem 1rem 0;
  background-color: white;
  border-radius: 4px;
  border: 1px solid goldenrod;
  color: darkgoldenrod;
  text-decoration: none;
  font-family: sans-serif;
  font-size: 13px;

  &:hover {
    background-color: rgb(255, 247, 228);
  }
`;

const FlexContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
`;

const SingleVideoView: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const decodedVideoId = decodeURIComponent(videoId ?? "");
  const {
    data: video,
    isLoading,
    error,
  } = useGetVideoByIdQuery(decodedVideoId);

  const { data: categoriesData } = useGetCategoriesQuery();

  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  if (isLoading) return <div>Loading...</div>;
  if (error || !video) return <div>Error loading video</div>;

  return (
    <Container>
      <StyledLink to="/">← To favorites</StyledLink>
      <StyledLink to="/videos-archive">← To video archive</StyledLink>
      <FlexContainer>
        <div>
          <VideoPlayer url={video.url} />
        </div>
        {isEditMode || !video.metadata ? (
          <VideoMetadataForm
            key={`form${video.id}`}
            videoId={video.id}
            categories={categoriesData?.categories ?? []}
            metadata={video.metadata}
            uploadDate={video.lastModified}
            closeForm={() => setIsEditMode(false)}
          />
        ) : (
          <VideoDetails
            metadata={video.metadata}
            editDetails={() => setIsEditMode(true)}
          />
        )}
      </FlexContainer>
    </Container>
  );
};

export default SingleVideoView;
