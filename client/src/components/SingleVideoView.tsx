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

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: darkgoldenrod;
  text-decoration: none;
  margin-bottom: 1rem;

  &:hover {
    color: goldenrod;
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
      <BackLink to="/">← Back to all videos</BackLink>
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
