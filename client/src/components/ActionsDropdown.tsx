import React from "react";
import styled from "styled-components";

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

interface ActionsDropdownProps {
  selectedVideoIds: string[];
}

const ActionsDropdown: React.FC<ActionsDropdownProps> = ({
  selectedVideoIds,
}) => {
  return (
    <>{selectedVideoIds.length > 0 && <ActionsButton>Actions</ActionsButton>}</>
  );
};

export default ActionsDropdown;
