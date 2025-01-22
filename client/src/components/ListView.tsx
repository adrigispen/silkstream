import { VideosViewProps } from "../types/video";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const VideosList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const VideoRow = styled.div<{ selected: boolean }>`
  border: 1px solid #e5e7eb;
  background-color: ${({ selected }) => (selected ? "#ffeec2" : "white")};
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.2s;
  gap: 1rem;

  &:hover {
    background-color: rgb(255, 247, 228);
  }
`;

const Checkbox = styled.input.attrs({ type: "checkbox" })`
  align-self: center;
  width: 30px;
  margin: -5px;
`;

const HeaderRow = styled.div`
  display: flex;
  padding: 0rem 1rem;
  width: 100%;
  justify-content: space-between;
  align-items: center;

  font-weight: bold;
  font-size: 11px;
  text-transform: uppercase;
  color: navy;
  font-style: normal;
`;

const HeaderTitle = styled.h4`
  width: 25%;
  cursor: pointer;
  margin-left: 30px;
`;

const VideoTitle = styled.h4`
  width: 25%;
  font-weight: 500;
  margin: 5px 0px;
`;

const HeaderCategory = styled.span`
  width: 15%;
  cursor: pointer;
`;

const Category = styled.span`
  width: 15%;
  font-weight: 400;
  text-transform: uppercase;
  font-size: 0.875rem;
  color: #6b7280;
`;

const HeaderDescription = styled.span`
  width: 30%;
`;

const Description = styled.span`
  width: 30%;
  font-style: italic;
  margin: 5px 0px;
  font-size: 0.875rem;
  color: #6b7280;
`;

const HeaderCreatedDate = styled.span`
  width: 10%;
  cursor: pointer;
`;

const CreatedDate = styled.span`
  width: 10%;
  color: #6b7280;
  margin: 5px 0px;
  color: #6b7280;
`;

const HeaderTags = styled.div`
  width: 20%;
  display: flex;
  justify-content: right;
`;

const Tags = styled.div`
  width: 20%;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin: 5px 0px;
  justify-content: right;
`;

const Tag = styled.span`
  background-color: navy;
  padding: 0.15rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: white;
`;

const ListView: React.FC<VideosViewProps> = ({
  videos,
  selectVideo,
  selectedVideo,
  sortBy,
  order,
  selectedVideoIds,
  selectVideoIds,
  formatDate,
  formatFileName,
}) => {
  const videosList = videos.map((video) => (
    <VideoRow
      key={video.id}
      onClick={() => {
        selectVideo(video);
      }}
      selected={video === selectedVideo}
    >
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
      <VideoTitle>
        {video.metadata?.title || formatFileName(video.id)}
      </VideoTitle>
      <Category>{video.metadata?.category || ""}</Category>
      <Description>{video.metadata?.description || ""}</Description>
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
    </VideoRow>
  ));

  return (
    <Container>
      <HeaderRow>
        <HeaderTitle
          onClick={() => {
            sortBy("title");
            order();
          }}
        >
          Title
        </HeaderTitle>
        <HeaderCategory
          onClick={() => {
            sortBy("category");
            order();
          }}
        >
          Category
        </HeaderCategory>
        <HeaderDescription>Description</HeaderDescription>
        <HeaderCreatedDate
          onClick={() => {
            sortBy("createdDate");
            order();
          }}
        >
          Created date
        </HeaderCreatedDate>
        <HeaderTags>Tags</HeaderTags>
      </HeaderRow>
      <VideosList>{videosList}</VideosList>
    </Container>
  );
};

export default ListView;
