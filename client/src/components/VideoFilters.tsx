import React from "react";
import styled from "styled-components";

const FiltersContainer = styled.div`
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  min-width: 300px;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: white;
  height: 50px;
`;

const Actions = styled.button`
`

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

      <Select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </Select>

      <Select
        multiple
        value={selectedTags}
        onChange={(e) => {
          const selected = Array.from(
            e.target.selectedOptions,
            (option) => option.value
          );
          onTagsChange(selected);
        }}
      >
        {availableTags.map((tag) => (
          <option key={tag} value={tag}>
            {tag}
          </option>
        ))}
      </Select>
      <Actions>Actions</Actions>
    </FiltersContainer>
  );
};

export default VideoFilters;
