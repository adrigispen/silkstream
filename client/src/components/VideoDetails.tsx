import React from "react";
import styled from "styled-components";
import {
  useCheckFavoriteQuery,
  useToggleFavoriteMutation,
} from "../services/api";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  max-width: 200px;
`;

const Title = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  margin-top: 0.5rem;
`;

const Category = styled.span`
  font-weight: 400;
  text-transform: uppercase;
  font-size: 0.875rem;
  color: #6b7280;
`;

const Description = styled.span`
  font-style: italic;
  margin: 5px 0px;
  font-size: 0.875rem;
  color: #6b7280;
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Tag = styled.span`
  background-color: navy;
  color: white;
  padding: 0.25rem 0.5rem;
  font-size: 0.9rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const EditButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: darkgoldenrod;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 0.5rem;

  &:hover {
    background-color: goldenrod;
  }
`;

const Favorite = styled.img`
  height: 30px;
  width: 30px;
  cursor: pointer;
`;

interface VideoDetailsProps {
  editDetails: () => void;
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
    category?: string;
    id: string;
  };
}

const VideoDetails: React.FC<VideoDetailsProps> = ({
  metadata,
  editDetails,
}) => {
  const { data: favStatus } = useCheckFavoriteQuery(metadata?.id ?? "");

  const imageSource = favStatus?.isFavorited
    ? "/lilHeartFilled.svg"
    : "/lilHeartOutline.svg";

  const titleText = favStatus?.isFavorited
    ? "Remove from favorites"
    : "Add to favorites";

  const [toggleFavorite] = useToggleFavoriteMutation();

  const handleFavoriteClick = async () => {
    try {
      await toggleFavorite(metadata?.id || "");
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  return (
    <Container>
      <Title>{metadata?.title}</Title>
      <Category>{metadata?.category}</Category>
      <Description>{metadata?.description}</Description>
      <TagList>
        {metadata?.tags?.map((tag, i) => (
          <Tag key={i}>{tag}</Tag>
        ))}
      </TagList>
      <Favorite
        src={imageSource}
        title={titleText}
        onClick={handleFavoriteClick}
      />
      <EditButton onClick={editDetails}>Edit details</EditButton>
    </Container>
  );
};

export default VideoDetails;
