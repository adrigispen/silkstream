import React from "react";
import styled from "styled-components";
import { useUpdateVideoMetadataMutation } from "../services/api";
import { toast } from "react-hot-toast";

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
  background-color: #e5e7eb;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const RemoveTag = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.125rem;

  &:hover {
    color: #ef4444;
  }
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background-color: #2563eb;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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
  const [formData, setFormData] = React.useState({
    title: initialMetadata?.title || "",
    description: initialMetadata?.description || "",
    tags: initialMetadata?.tags || [],
    category: initialMetadata?.category || "",
  });
  const [tagInput, setTagInput] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMetadata({
        videoId,
        metadata: formData,
      }).unwrap();
      toast.success("Metadata updated successfully");
    } catch (error) {
      toast.error(`Failed to update metadata: ${error}`);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

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
        <TagInput
          id="tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="Type a tag and press Enter"
        />
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
        {isLoading ? "Saving..." : "Save Metadata"}
      </Button>
    </Form>
  );
};

export default VideoMetadataForm;
