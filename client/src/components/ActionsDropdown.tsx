import React, { useState } from "react";
import styled from "styled-components";
import {
  useBatchDeleteVideosMutation,
  useBatchUpsertMetadataMutation,
} from "../services/api";
import toast from "react-hot-toast";
import Select, { MultiValue, SingleValue } from "react-select";
import { Video } from "../types/video";

const ActionsButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: darkgoldenrod;
  height: 38px;
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

const CategorySelect = styled(Select<Option>)`
  min-width: 180px;
  font-family: sans-serif;
  font-size: 13px;
  text-transform: capitalize;
`;

const TagsSelect = styled(Select<Option, true>)`
  min-width: 180px;
  font-family: sans-serif;
  font-size: 13px;
`;

interface Option {
  value: string;
  label: string;
}

interface ActionsDropdownProps {
  selectedVideos: Video[];
  deselectVideos: () => void;
  categories: string[];
  availableTags: string[];
}

const ActionsDropdown: React.FC<ActionsDropdownProps> = ({
  selectedVideos,
  deselectVideos,
  categories,
  availableTags,
}) => {
  const [batchDelete] = useBatchDeleteVideosMutation();
  const [batchUpsert] = useBatchUpsertMetadataMutation();
  const [showActions, setShowActions] = useState<boolean>(false);
  const [showBulkUpdate, setShowBulkUpdate] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleBatchDelete = async (videoIds: string[]) => {
    try {
      await batchDelete({ videoIds });
      toast.success("Videos deleted");
    } catch (error) {
      toast.error(`Failed to delete videos: ${error}`);
    }
  };

  const handleBatchUpdate = async (
    videos: Video[],
    category?: string,
    tags?: string[]
  ) => {
    const updates = [...videos].map((video) => {
      const metadata = {
        uploadDate: video.lastModified,
        category: category ?? undefined,
        tags: tags ?? undefined,
        originalFileName: video.key,
        s3Key: video.key,
      };
      return {
        videoId: video.id,
        metadata,
        isNew: video.metadata ? false : true,
      };
    });

    try {
      await batchUpsert(updates).unwrap();;
      toast.success("Videos updated");
      setSelectedCategory("");
      setSelectedTags([]);
      setShowActions(false);
      setShowBulkUpdate(false);
      deselectVideos();
    } catch (error) {
      toast.error(`Failed to update videos: ${error}`);
    }
  };

  return (
    <>
      {selectedVideos.length > 0 && (
        <ActionsButton onClick={() => setShowActions(true)}>
          Actions
        </ActionsButton>
      )}
      {showActions === true && (
        <div>
          <button
            onClick={() =>
              handleBatchDelete(selectedVideos.map((video: Video) => video.id))
            }
          >
            Delete Videos
          </button>
          <button onClick={() => setShowBulkUpdate(true)}>
            Bulk update videos
          </button>
        </div>
      )}
      {showBulkUpdate && (
        <div>
          <CategorySelect
            placeholder="Select category..."
            value={
              selectedCategory
                ? { value: selectedCategory, label: selectedCategory }
                : null
            }
            options={[
              { value: "", label: "All Categories" },
              ...categories.map((cat) => ({
                value: cat,
                label: cat,
              })),
            ]}
            onChange={(selectedOption: SingleValue<Option>) =>
              setSelectedCategory(selectedOption ? selectedOption.value : "")
            }
          />

          <TagsSelect
            isMulti
            isClearable
            placeholder="Select tags..."
            value={selectedTags.map((tag) => ({
              value: tag,
              label: tag,
            }))}
            name="tags"
            options={availableTags.map((tag) => ({
              value: tag,
              label: tag,
            }))}
            onChange={(selectedOptions: MultiValue<Option>) => {
              const selected = selectedOptions.map((option) => option.value);
              setSelectedTags(selected);
            }}
          />
          <button
            onClick={() =>
              handleBatchUpdate(selectedVideos, selectedCategory, selectedTags)
            }
          >
            Save
          </button>
        </div>
      )}
    </>
  );
};

export default ActionsDropdown;
