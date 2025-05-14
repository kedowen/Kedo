import styled from "styled-components";

export const FileUploadContainer = styled.div`
  width: 100%;
`;

export const FileItemContainer = styled.div`
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 10px 12px;
  border-radius: 4px;
  border: 1px solid var(--semi-color-border);
  background-color: var(--semi-color-bg-2);
  width: 100%;
  justify-content: space-between;
  transition: all 0.2s ease;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    background-color: var(--semi-color-fill-0);
    border-color: var(--semi-color-primary-light-default);
    box-shadow: 0 2px 8px rgba(var(--semi-color-primary-rgb), 0.15);
    transform: translateY(-1px);
  }
`;

export const FileInfoContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  max-width: calc(100% - 40px);
`;

export const FileNameText = styled.div`
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const UploadContainer = styled.div`
  width: 100%;
  margin-bottom: 12px;
`;

export const UploadIcon = styled.div`
  margin-bottom: 8px;
  color: var(--semi-color-primary);
  transition: transform 0.2s ease;
`;

export const TitleContainer = styled.div`
  margin: 0;
  margin-bottom: 4px;
  transition: color 0.2s ease;
`;

export const FileListContainer = styled.div`
  width: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  max-height: 200px;
  padding: 8px;
  padding-right: 4px;
  margin-bottom: 12px;
  border: 1px solid var(--semi-color-border);
  border-radius: 6px;
  background-color: var(--semi-color-tertiary-light-default);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(var(--semi-color-border), 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--semi-color-tertiary);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--semi-color-tertiary-hover);
  }
`;

interface DropZoneProps {
  disabled?: boolean;
}

export const DropZoneContainer = styled.div<DropZoneProps>`
  box-sizing: border-box;
  width: 100%;
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--semi-color-border);
  border-radius: 4px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: all 0.3s ease;

  &:hover {
    ${(props) =>
      !props.disabled &&
      `
      border-color: var(--semi-color-primary);
      background-color: var(--semi-color-primary-light-default);
      box-shadow: 0 2px 12px rgba(var(--semi-color-primary-rgb), 0.1);
    `}
  }

  &:hover ${UploadIcon} {
    transform: scale(1.1);
  }

  &:hover ${TitleContainer} {
    color: var(--semi-color-primary);
  }
`;
