import React, { useState } from "react";
import styled from "styled-components";
import {
  useLazyGetTagSuggestionsQuery,
  useUpdateVideoMetadataMutation,
} from "../services/api";
import { toast } from "react-hot-toast";
import { TagSuggestion, VideoMetadata } from "../types/video";
import Select from "react-select";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #374151;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }
`;

const TextArea = styled.textarea`
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  min-height: 100px;
  resize: vertical;
  font-family: sans-serif;
  font-size: 0.85rem;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }
`;

const TagInput = styled(Input)`
  margin-bottom: 0.5rem;
  width: 100%;
  padding: 0.5rem;
`;

const TagList = styled.div`
  display: flex;
  max-width: 200px;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Tag = styled.span`
  background-color: navy;
  color: white;
  padding: 0.25rem 0.5rem;
  font-size: 0.9rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const RemoveTag = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.125rem;

  &:hover {
    color: #ef4444;
  }
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: darkgoldenrod;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background-color: goldenrod;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SuggestionsList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  margin-top: 0.25rem;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SuggestionItem = styled.li<{ isActive: boolean }>`
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${(props) => (props.isActive ? "#e5e7eb" : "transparent")};

  &:hover {
    background-color: #f3f4f6;
  }

  span.count {
    color: #6b7280;
    font-size: 0.875rem;
  }
`;

const TagInputContainer = styled.div`
  position: relative;
`;

const CategorySelect = styled(Select<Option>)`
  width: 100%;
  min-width: 100px;
  font-family: sans-serif;
  font-size: 13px;
  text-transform: capitalize;
`;

const LoadingIndicator = styled.div`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-size: 0.875rem;
`;

interface VideoMetadataFormProps {
  videoId: string;
  categories: string[];
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
    category?: string;
  };
  closeForm: () => void;
  uploadDate: string;
}

interface Option {
  value: string;
  label: string;
}

const VideoMetadataForm: React.FC<VideoMetadataFormProps> = ({
  videoId,
  categories,
  metadata,
  closeForm,
  uploadDate,
}) => {
  const [updateMetadata, { isLoading }] = useUpdateVideoMetadataMutation();
  const [formData, setFormData] = useState({
    title: metadata?.title || "",
    description: metadata?.description || "",
    tags: metadata?.tags || [],
    category: metadata?.category || "",
  });
  const [tagInput, setTagInput] = useState("");
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [getTagSuggestions, { isFetching }] = useLazyGetTagSuggestionsQuery();
  const [selectedTagIndex, setSelectedTagIndex] = useState(-1);

  const fetchSuggestions = async (prefix: string) => {
    if (prefix.length >= 1) {
      try {
        const result = await getTagSuggestions(prefix).unwrap();
        setSuggestions(result.suggestions);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInput(value);
    fetchSuggestions(value);
  };

  const handleSuggestionClick = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInput("");
    setSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMetadata({
        videoId,
        metadata: {
          ...formData,
          originalFileName: videoId,
          s3Key: videoId,
          uploadDate: uploadDate,
        },
      }).unwrap();
      toast.success("Metadata updated successfully");
      closeForm();
    } catch (error) {
      toast.error(`Failed to update metadata: ${error}`);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) {
      if (e.key === "Enter" && tagInput.trim()) {
        e.preventDefault();
        if (!formData.tags.includes(tagInput.trim())) {
          setFormData((prev) => ({
            ...prev,
            tags: [...prev.tags, tagInput.trim()],
          }));
        }
        setTagInput("");
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedTagIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedTagIndex((prev) => (prev > -1 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedTagIndex > -1) {
          handleSuggestionClick(suggestions[selectedTagIndex].tag);
          setSelectedTagIndex(-1);
        } else if (tagInput.trim()) {
          if (!formData.tags.includes(tagInput.trim())) {
            setFormData((prev) => ({
              ...prev,
              tags: [...prev.tags, tagInput.trim()],
            }));
          }
          setTagInput("");
          setSuggestions([]);
        }
        break;
      case "Escape":
        setSuggestions([]);
        setSelectedTagIndex(-1);
        break;
    }
  };

  React.useEffect(() => {
    const handleClickOutside = () => setSuggestions([]);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  React.useEffect(() => {
    setSelectedTagIndex(-1);
  }, [suggestions]);

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Enter video title"
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="description">Description</Label>
        <TextArea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Enter video description"
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="category">Category</Label>
        <CategorySelect
          placeholder="Select category..."
          defaultValue={
            metadata?.category
              ? {
                  value: metadata?.category,
                  label: metadata?.category,
                }
              : null
          }
          onChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              category: value ? value.value : "",
            }))
          }
          options={categories.map((cat) => ({
            value: cat.toLowerCase(),
            label: cat,
          }))}
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="tags">Tags</Label>
        <TagInputContainer>
          <TagInput
            id="tags"
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a tag and press Enter"
          />
          {isFetching && <LoadingIndicator>Loading...</LoadingIndicator>}
          {!isFetching && suggestions.length > 0 && (
            <SuggestionsList>
              {suggestions.map(({ tag, count }, i) => (
                <SuggestionItem
                  key={tag}
                  isActive={i === selectedTagIndex}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSuggestionClick(tag);
                  }}
                >
                  <span>{tag}</span>
                  <span className="count">Used {count} times</span>
                </SuggestionItem>
              ))}
            </SuggestionsList>
          )}
        </TagInputContainer>
        <TagList>
          {formData.tags.map((tag) => (
            <Tag key={tag}>
              {tag}
              <RemoveTag onClick={() => handleRemoveTag(tag)}>
                &times;
              </RemoveTag>
            </Tag>
          ))}
        </TagList>
      </FormGroup>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save"}
      </Button>
    </Form>
  );
};

export default VideoMetadataForm;
