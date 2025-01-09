import React, { useCallback } from "react";
import styled from "styled-components";
import debounce from "lodash/debounce";
import {
  useLazyGetTagSuggestionsQuery,
  useUpdateVideoMetadataMutation,
} from "../services/api";
import { toast } from "react-hot-toast";
import { TagSuggestion } from "../types/video";

const VideoDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
`;

const Title = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  margin-top: 0.5rem;
`;

const Category = styled.span`
  font-weight: 400;
  text-transform: uppercase;
  font-size: 0.875rem;
  color: #6b7280;
`;

const Description = styled.span`
  font-style: italic;
  margin: 5px 0px;
  font-size: 0.875rem;
  color: #6b7280;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }
`;

const TagInput = styled(Input)`
  margin-bottom: 0.5rem;
`;

const TagList = styled.div`
  display: flex;
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

const EditButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: darkgoldenrod;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 0.5rem;

  &:hover {
    background-color: goldenrod;
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
  initialMetadata?: {
    title?: string;
    description?: string;
    tags?: string[];
    category?: string;
  };
}

const VideoMetadataForm: React.FC<VideoMetadataFormProps> = ({
  videoId,
  initialMetadata,
}) => {
  const [updateMetadata, { isLoading }] = useUpdateVideoMetadataMutation();
  const [isEditMode, setIsEditMode] = React.useState<boolean>(false);
  const [formData, setFormData] = React.useState({
    title: initialMetadata?.title || "",
    description: initialMetadata?.description || "",
    tags: initialMetadata?.tags || [],
    category: initialMetadata?.category || "",
  });
  const [tagInput, setTagInput] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<TagSuggestion[]>([]);
  const [getTagSuggestions, { isFetching }] = useLazyGetTagSuggestionsQuery();
  const [selectedTagIndex, setSelectedTagIndex] = React.useState(-1);

  const debouncedFetchSuggestions = useCallback(
    debounce(async (prefix: string) => {
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
    }, 300),
    [getTagSuggestions]
  );

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInput(value);
    debouncedFetchSuggestions(value);
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
        metadata: formData,
      }).unwrap();
      toast.success("Metadata updated successfully");
      setIsEditMode(false);
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
          // Original tag adding logic
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

  return isEditMode || !initialMetadata ? (
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
        <Input
          id="category"
          value={formData.category}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, category: e.target.value }))
          }
          placeholder="Enter video category"
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
  ) : (
    <VideoDetails>
      <Title>{initialMetadata?.title}</Title>
      <Category>{initialMetadata?.category}</Category>
      <Description>{initialMetadata?.description}</Description>
      <TagList>
        {initialMetadata?.tags?.map((tag) => (
          <Tag>{tag}</Tag>
        ))}
      </TagList>
      <EditButton onClick={() => setIsEditMode(true)}>Edit details</EditButton>
    </VideoDetails>
  );
};

export default VideoMetadataForm;
