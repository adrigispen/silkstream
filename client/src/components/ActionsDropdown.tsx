import React, { useState } from "react";
import styled from "styled-components";
import {
  useBatchDeleteVideosMutation,
  useBatchUpsertMetadataMutation,
} from "../services/api";
import toast from "react-hot-toast";
import Select, { MultiValue, SingleValue } from "react-select";

const ActionsDiv = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

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

const ActionsSubButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: white;
  height: 30px;

  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: darkgoldenrod;
    color: white;
  }
`;

const ActionsPanel = styled.div<{ showPanel: boolean }>`
  display: ${({ showPanel }) => (showPanel ? "flex" : "none")};
  position: absolute;
  width: 150px;
  margin-top: 40px;
  margin-left: -75px;

  flex-direction: column;
  background-color: white;
  border-radius: 4px;
  padding: 10px 0px;
  box-shadow: 0 3px 5px 0 rgba(0, 0, 0, 0.1);
`;

const ButtonPane = styled.div`
  display: flex;
`;

const Cancel = styled.button`
  padding-right: 1rem;
  background-color: white;
  color: navy;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    color: darkgoldenrod;
  }
`;

const BulkUpdateModal = styled.div<{ showModal: boolean }>`
  display: ${({ showModal }) => (showModal ? "flex" : "none")};
  position: absolute;
  margin-top: 40px;
  max-width: 210px;
  margin-left: -150px;
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  z-index: 10;

  box-shadow: 0 3px 5px 0 rgba(0, 0, 0, 0.1);
`;

const CategorySelect = styled(Select<Option>)`
  min-width: 180px;
  font-family: sans-serif;
  font-size: 13px;
`;

const TagsSelect = styled(Select<Option, true>)`
  min-width: 180px;
  font-family: sans-serif;
  font-size: 13px;
`;

const FlexContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Description = styled.p`
  margin-top: -8px;
  padding: 0px 5px;
  font-size: 0.8rem;
  font-style: italic;
  color: #333;
`;

interface Option {
  value: string;
  label: string;
}

interface ActionsDropdownProps {
  selectedVideoIds: string[];
  deselectVideos: () => void;
  categories: string[];
  availableTags: string[];
  isNew: (id: string) => boolean;
}

const ActionsDropdown: React.FC<ActionsDropdownProps> = ({
  selectedVideoIds,
  deselectVideos,
  categories,
  availableTags,
  isNew,
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
      setShowActions(false);
      deselectVideos();
      toast.success("Videos deleted");
    } catch (error) {
      toast.error(`Failed to delete videos: ${error}`);
    }
  };

  const handleBatchUpdate = async (
    videoIds: string[],
    category?: string,
    tags?: string[]
  ) => {
    const updates = [...videoIds].map((id) => {
      const metadata = {
        category: category ?? undefined,
        tags: tags ?? undefined,
        originalFileName: id,
        s3Key: id,
      };
      return {
        videoId: id,
        metadata,
        isNew: isNew(id) ? true : false,
      };
    });

    try {
      await batchUpsert(updates).unwrap();
      setSelectedCategory("");
      setSelectedTags([]);
      setShowActions(false);
      setShowBulkUpdate(false);
      deselectVideos();
      toast.success("Videos updated");
    } catch (error) {
      toast.error(`Failed to update videos: ${error}`);
    }
  };

  return (
    <ActionsDiv>
      {selectedVideoIds.length > 0 && (
        <ActionsButton
          onClick={() => {
            setShowActions(showActions ? false : true);
            if (showBulkUpdate) setShowBulkUpdate(false);
          }}
        >
          Actions
        </ActionsButton>
      )}
      {selectedVideoIds.length > 0 && (
        <ActionsPanel showPanel={showActions}>
          <ActionsSubButton onClick={() => handleBatchDelete(selectedVideoIds)}>
            Delete videos
          </ActionsSubButton>
          <ActionsSubButton onClick={() => setShowBulkUpdate(true)}>
            Bulk update videos
          </ActionsSubButton>
        </ActionsPanel>
      )}
      {selectedVideoIds.length > 0 && (
        <BulkUpdateModal showModal={showBulkUpdate}>
          <FlexContainer>
            <CategorySelect
              placeholder="Change category..."
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
              placeholder="Change tags..."
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
            <Description>
              If you select new tags, all existing tags will be replaced. Leave
              tags blank if you only want to update the category.
            </Description>
            <ButtonPane>
              <Cancel
                onClick={() => {
                  setShowBulkUpdate(false);
                  setShowActions(false);
                }}
              >
                Cancel
              </Cancel>
              <ActionsButton
                onClick={() =>
                  handleBatchUpdate(
                    selectedVideoIds,
                    selectedCategory,
                    selectedTags
                  )
                }
              >
                {`Save ${selectedVideoIds.length} videos`}
              </ActionsButton>
            </ButtonPane>
          </FlexContainer>
        </BulkUpdateModal>
      )}
    </ActionsDiv>
  );
};

export default ActionsDropdown;
