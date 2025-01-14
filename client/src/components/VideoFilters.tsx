import React from "react";
import styled from "styled-components";
import Select, { SingleValue, MultiValue } from "react-select";

const FiltersContainer = styled.div`
  margin: 1rem 0 1rem 1rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const SearchInput = styled.input`
  padding: 0.5rem;
  border: 1px solid rgb(204, 204, 204);
  border-radius: 4px;
  min-width: 180px;
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

interface VideoFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  categories: string[];
  availableTags: string[];
}

const VideoFilters: React.FC<VideoFiltersProps> = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  selectedTags,
  onTagsChange,
  categories,
  availableTags,
}) => {
  return (
    <FiltersContainer>
      <SearchInput
        type="text"
        placeholder="Search videos..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <CategorySelect
        placeholder="Select category..."
        value={category ? { value: category, label: category } : null}
        options={[
          { value: "", label: "All Categories" },
          ...categories.map((cat) => ({
            value: cat,
            label: cat,
          })),
        ]}
        onChange={(selectedOption: SingleValue<Option>) =>
          onCategoryChange(selectedOption ? selectedOption.value : "")
        }
      />

      <TagsSelect
        isMulti
        isClearable // Add this line
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
          onTagsChange(selected);
        }}
      />
    </FiltersContainer>
  );
};

export default VideoFilters;
