import React from "react";
import styled from "styled-components";
import Select, { SingleValue, MultiValue } from "react-select";

const FiltersContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex-grow: 1;
  justify-content: flex-end;
`;

const SearchInput = styled.input`
  padding: 0.5rem;
  border: 1px solid rgb(204, 204, 204);
  border-radius: 4px;
  flex-grow: 2;
`;

const CategorySelect = styled(Select<Option>)`
  min-width: 100px;
  font-family: sans-serif;
  font-size: 13px;
  flex-grow: 1;
`;

const TagsSelect = styled(Select<Option, true>)`
  min-width: 100px;
  font-family: sans-serif;
  font-size: 13px;
  flex-grow: 1;
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
        placeholder="Search all videos..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <CategorySelect
        placeholder="Find by category"
        value={category ? { value: category, label: category } : null}
        options={[
          { value: "", label: "All categories" },
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
        isClearable
        placeholder="Find by tag"
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
