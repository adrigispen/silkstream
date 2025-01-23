import { Link } from "react-router-dom";
import { ArchiveViewProps } from "../types/video";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const VideosList = styled.div`
  display: flex;
  flex-direction: column;
`;

const VideoRow = styled.div`
  border: 1px solid #e5e7eb;
  background-color: white;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  cursor: pointer;
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

const LinkWrapper = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

const ListView: React.FC<ArchiveViewProps> = ({
  metadata,
  sortBy,
  order,
  selectedVideoIds,
  selectVideoIds,
  formatDate,
  formatFileName,
}) => {
  const videosList = metadata.map((video) => (
    <LinkWrapper to={`/videos/${encodeURIComponent(video.id)}`}>
      <VideoRow key={video.id}>
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
        <VideoTitle>{video.title || formatFileName(video.id)}</VideoTitle>
        <Category>{video.category || ""}</Category>
        <Description>{video.description || ""}</Description>
        <CreatedDate>
          {video.createdDate ? formatDate(video.createdDate) : ""}
        </CreatedDate>
        {video.tags && video.tags.length > 0 && (
          <Tags>
            {video.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </Tags>
        )}
      </VideoRow>
    </LinkWrapper>
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
