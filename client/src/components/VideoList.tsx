import React, { useEffect, useState } from "react";
import styled from "styled-components";
import VideoPlayer from "./VideoPlayer";
import VideoMetadataForm from "./VideoMetadataForm";
import {
  useGetVideosQuery,
  useGetTagsQuery,
  useGetCategoriesQuery,
} from "../services/api";
import { Video } from "../types/video";
import VideoDetails from "./VideoDetails";
import VideoFilters from "./VideoFilters";
import ActionsDropdown from "./ActionsDropdown";

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

const ActionsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
  width: 100%;
  align-items: center;
`;

const VideoCard = styled.div<{ selected: boolean }>`
  border: 1px solid #e5e7eb;
  background-color: ${({ selected }) => (selected ? "#ffeec2" : "white")};
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
    background-color: rgb(255, 247, 228);
  }
`;

const Checkbox = styled.input.attrs({ type: "checkbox" })`
  align-self: flex-start;

  @media (min-width: 768px) {
    align-self: center;
    width: 30px;
    margin-left: -5px;
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
    color: navy;
    font-style: normal;
  }
`;

const HeaderTitle = styled.h4`
  width: 25%;
  cursor: pointer;
  margin-left: 30px;
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
  cursor: pointer;
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

const HeaderUploadDate = styled.span`
  width: 10%;
  cursor: pointer;
`;

const UploadDate = styled.span`
  color: #6b7280;
  margin: 5px 0px;
  color: #6b7280;

  @media (min-width: 768px) {
    width: 10%;
    margin: 0px;
  }
`;

const HeaderTags = styled.div`
  width: 20%;
  display: flex;
  justify-content: right;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin: 5px 0px;

  @media (min-width: 768px) {
    width: 20%;
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
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedVideos, setSelectedVideos] = useState<Video[]>([]);

  const { data, error, isLoading, isFetching } = useGetVideosQuery({
    page,
    limit: 1000,
    search: searchTerm,
    category: selectedCategory,
    tags: selectedTags,
    sortBy: sortBy,
    sortDirection,
  });

  const { data: tagsData } = useGetTagsQuery();

  const { data: categoriesData } = useGetCategoriesQuery();

  const handleLoadMore = () => {
    if (data?.nextPage && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const formatFileName = (key: string) => {
    return key.split("/").pop() || key;
  };

  const formatDate = (date: string) => {
    const arr = date.split("-");
    const day = arr.pop()?.slice(0, 2);
    const month = arr.pop();
    const year = arr.pop();
    return `${day}.${month}.${year}`;
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategory, selectedTags]);

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
              categories={categoriesData?.categories ?? []}
              metadata={
                data?.videos.find((video) => video.id === selectedVideo.id)
                  ?.metadata
              }
              uploadDate={selectedVideo.lastModified}
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
        <ActionsRow>
          <VideoFilters
            search={searchTerm}
            onSearchChange={setSearchTerm}
            category={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            categories={categoriesData?.categories ?? []}
            availableTags={tagsData?.tags ?? []}
          />
          <ActionsDropdown
            selectedVideos={selectedVideos}
            categories={categoriesData?.categories ?? []}
            availableTags={tagsData?.tags ?? []}
            deselectVideos={() => setSelectedVideos([])}
          />
        </ActionsRow>
        <HeaderRow>
          <HeaderTitle
            onClick={() => {
              setSortBy("title");
              setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
            }}
          >
            Title
          </HeaderTitle>
          <HeaderCategory
            onClick={() => {
              setSortBy("category");
              setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
            }}
          >
            Category
          </HeaderCategory>
          <HeaderDescription>Description</HeaderDescription>
          <HeaderUploadDate
            onClick={() => {
              setSortBy("uploadDate");
              setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
            }}
          >
            Date uploaded
          </HeaderUploadDate>
          <HeaderTags>Tags</HeaderTags>
        </HeaderRow>
        {data?.videos?.map((video) => (
          <VideoCard
            key={video.id}
            onClick={() => setSelectedVideo(video)}
            selected={video === selectedVideo}
          >
            <Checkbox
              onClick={(e) => {
                const newSelecteds = selectedVideos.includes(video)
                  ? selectedVideos.filter((vid) => vid !== video)
                  : selectedVideos.concat(video);
                setSelectedVideos(newSelecteds);
                e.stopPropagation();
              }}
              checked={selectedVideos.includes(video) ? true : false}
            />
            <VideoTitle>
              {video.metadata?.title || formatFileName(video.id)}
            </VideoTitle>
            <Category>{video.metadata?.category || ""}</Category>
            <Description>{video.metadata?.description || ""}</Description>
            <UploadDate>
              {video.lastModified ? formatDate(video.lastModified) : ""}
            </UploadDate>
            {video.metadata?.tags && video.metadata.tags.length > 0 && (
              <Tags>
                {video.metadata.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Tags>
            )}
          </VideoCard>
        ))}
        {data?.nextPage && (
          <button onClick={handleLoadMore} disabled={isFetching}>
            {isFetching ? "Loading" : "Load More"}
          </button>
        )}
      </FlexContainer>

      {data?.videos?.length === 0 && (
        <EmptyMessage>No videos uploaded yet</EmptyMessage>
      )}
    </Container>
  );
};

export default VideoList;
