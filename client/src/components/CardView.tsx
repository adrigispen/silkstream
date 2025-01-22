import { Link } from "react-router-dom";
import { VideosViewProps } from "../types/video";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  gap: 1rem;
`;

const VideoCard = styled.div`
  border: 1px solid #e5e7eb;
  background-color: white;
  border-radius: 0.5rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem;
  cursor: pointer;
  max-width: 45%;
  min-width: 200px;
  flex-basis: 20%;
  flex-grow: 1;
  transition: background-color 0.2s;
  gap: 1rem;

  &:hover {
    background-color: rgb(255, 247, 228);
  }
`;

const MetadataContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 60%;
`;

const Checkbox = styled.input.attrs({ type: "checkbox" })`
  display: none;
  align-self: flex-start;
  margin: -10px;
`;

const VideoTitle = styled.h4`
  font-weight: 500;
  margin: 5px 0px;
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

const ThumbnailContainer = styled.div`
  position: relative;
  width: 110px;
  height: 190px;
  overflow: hidden;
`;

const Thumbnail = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CreatedDate = styled.span`
  color: #6b7280;
  margin: 5px 0px;
  color: #6b7280;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin: 5px 0px;
`;

const Tag = styled.span`
  background-color: navy;
  padding: 0.15rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: white;
`;

const LinkWrapper = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

const CardView: React.FC<VideosViewProps> = ({
  videos,
  selectVideo,
  selectedVideoIds,
  selectVideoIds,
  formatDate,
  formatFileName,
}) => {
  const videoCards = videos.map((video) => (
    <VideoCard key={video.id}>
      <Checkbox
        onClick={(e) => {
          const newSelectedIds = selectedVideoIds.includes(video.id)
            ? selectedVideoIds.filter((id) => id !== video.id)
            : selectedVideoIds.concat(video.id);
          selectVideoIds(newSelectedIds);
          e.stopPropagation();
        }}
        defaultChecked={selectedVideoIds.includes(video.id) ? true : false}
      />
      <LinkWrapper to={`/videos/${encodeURIComponent(video.id)}`}>
        <ThumbnailContainer>
          {video.thumbnailUrl ? (
            <Thumbnail
              src={video.thumbnailUrl}
              alt={video.metadata?.title || "Video thumbnail"}
            />
          ) : (
            <div>
              <img src="/hang.svg" />
            </div>
          )}
        </ThumbnailContainer>
      </LinkWrapper>

      <MetadataContainer
        onClick={() => {
          if (selectVideo) {
            selectVideo(video);
          }
        }}
      >
        <VideoTitle>
          {video.metadata?.title || formatFileName(video.id)}
        </VideoTitle>
        <Category>{video.metadata?.category || ""}</Category>
        <Description>
          {video.metadata?.description
            ? `${video.metadata?.description?.slice(0, 20)}...`
            : ""}
        </Description>
        <CreatedDate>
          {video.metadata?.createdDate
            ? formatDate(video.metadata.createdDate)
            : ""}
        </CreatedDate>
        {video.metadata?.tags && video.metadata.tags.length > 0 && (
          <Tags>
            {video.metadata.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </Tags>
        )}
      </MetadataContainer>
    </VideoCard>
  ));

  return <Container>{videoCards}</Container>;
};

export default CardView;
