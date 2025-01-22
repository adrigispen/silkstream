import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useGetAllVideosQuery } from "../services/api";
import ListView from "./ListView";

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
  @media (min-width: 768px) {
    gap: 1rem;
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: #6b7280;
  padding: 2rem;
`;

const VideoList: React.FC = () => {
  const [pageToken, setPageToken] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);

  const { data, error, isLoading, isFetching } = useGetAllVideosQuery({
    pageToken,
    limit: 40,
    sortBy: sortBy,
    sortDirection,
  });

  const handleLoadMore = () => {
    if (data?.nextPageToken && !isFetching) {
      setPageToken(data.nextPageToken);
    }
  };

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
  }, [sortBy, sortDirection]);

  if (isLoading) return <LoadingMessage>Loading videos...</LoadingMessage>;
  if (error) return <ErrorMessage>Error loading videos</ErrorMessage>;

  return (
    <Container>
      <FlexContainer>
        <ListView
          metadata={data?.metadata || []}
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

      {data?.metadata?.length === 0 && (
        <EmptyMessage>No videos uploaded yet</EmptyMessage>
      )}
    </Container>
  );
};

export default VideoList;
