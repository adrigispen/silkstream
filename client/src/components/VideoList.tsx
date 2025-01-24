import React, { useEffect, useState } from "react";
import styled from "styled-components";
import VideoPlayer from "./VideoPlayer";
import VideoMetadataForm from "./VideoMetadataForm";
import {
  useGetVideosQuery,
  useGetTagsQuery,
  useGetCategoriesQuery,
  useGetUntaggedVideosQuery,
  useGetRecentlyTaggedVideosQuery,
} from "../services/api";
import { Video } from "../types/video";
import VideoDetails from "./VideoDetails";
import VideoFilters from "./VideoFilters";
import ActionsDropdown from "./ActionsDropdown";
import Modal from "react-modal";
import CardView from "./CardView";

const Button = styled.button`
  align-self: center;
  padding: 0.5rem 1rem;
  background-color: darkgoldenrod;
  min-height: 38px;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: goldenrod;
    color: white;
  }
`;

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

const FlexContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  width: 100%;
`;

const Header = styled.h3`
  color: navy;
  width: 100%;
  margin: 20px 0 0 0;
`;

const ActionsRow = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
  width: 100%;
  align-items: center;
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: #6b7280;
  padding: 2rem;
`;

const customModalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    maxWidth: "1000px",
    width: "80%",
    padding: "1rem",
  },
};

const VideoList: React.FC = () => {
  const [pageToken, setPageToken] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);

  const { data, error, isLoading, isFetching } = useGetVideosQuery({
    pageToken,
    limit: 20,
    search: searchTerm,
    category: selectedCategory,
    tags: selectedTags,
    sortBy: sortBy,
    sortDirection,
  });

  const { data: untaggedData } = useGetUntaggedVideosQuery();

  const { data: justTaggedData } = useGetRecentlyTaggedVideosQuery();

  const { data: tagsData } = useGetTagsQuery();

  const { data: categoriesData } = useGetCategoriesQuery();

  const handleLoadMore = () => {
    if (data?.nextPageToken && !isFetching) {
      setPageToken(data.nextPageToken);
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

  const changeSortDirection = () =>
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");

  useEffect(() => {
    setPageToken(undefined);
  }, [searchTerm, selectedCategory, selectedTags, sortBy, sortDirection]);

  if (isLoading) return <LoadingMessage>Loading videos...</LoadingMessage>;
  if (error) return <ErrorMessage>Error loading videos</ErrorMessage>;

  return (
    <Container>
      <Modal
        isOpen={!!selectedVideo}
        onRequestClose={() => setSelectedVideo(null)}
        style={customModalStyles}
        contentLabel="Video Details"
      >
        {selectedVideo && (
          <FlexContainer>
            <div>
              <VideoPlayer url={selectedVideo.url} />
            </div>
            {isEditMode ||
            (data?.videos.find((video) => video.id === selectedVideo.id) &&
              !data?.videos.find((video) => video.id === selectedVideo.id)
                ?.metadata) ? (
              <VideoMetadataForm
                key={`form${selectedVideo.id}`}
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
                    ?.metadata ??
                  justTaggedData?.videos.find(
                    (video) => video.id === selectedVideo.id
                  )?.metadata
                }
              />
            )}
          </FlexContainer>
        )}
      </Modal>
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
            selectedVideoIds={selectedVideoIds}
            categories={categoriesData?.categories ?? []}
            availableTags={tagsData?.tags ?? []}
            deselectVideos={() => setSelectedVideoIds([])}
            isNew={(id: string) =>
              data?.videos.find((video) => video.id === id)?.metadata
                ? false
                : true
            }
          />
        </ActionsRow>
        {(untaggedData?.videos || justTaggedData?.videos || []).length > 0 && (
          <>
            <Header>Recently uploaded</Header>
            <CardView
              videos={
                untaggedData?.videos.concat(justTaggedData?.videos || []) || []
              }
              selectVideo={(video: Video) => {
                if (!video.metadata) setIsEditMode(true);
                setSelectedVideo(video);
              }}
              selectedVideo={selectedVideo}
              selectedVideoIds={selectedVideoIds}
              selectVideoIds={setSelectedVideoIds}
              formatDate={formatDate}
              formatFileName={formatFileName}
            />
          </>
        )}
        <Header>Favorites</Header>
        <CardView
          videos={data?.videos || []}
          selectVideo={setSelectedVideo}
          selectedVideo={selectedVideo}
          sortBy={setSortBy}
          order={changeSortDirection}
          selectedVideoIds={selectedVideoIds}
          selectVideoIds={setSelectedVideoIds}
          formatDate={formatDate}
          formatFileName={formatFileName}
        />
        {data?.nextPageToken && (
          <Button onClick={handleLoadMore} disabled={isFetching}>
            {isFetching ? "Loading" : "Next page"}
          </Button>
        )}
      </FlexContainer>

      {data?.videos?.length === 0 && (
        <EmptyMessage>No videos uploaded yet</EmptyMessage>
      )}
    </Container>
  );
};

export default VideoList;
