import styled from "styled-components";

interface FormWrapperProps {
  isSidebar?: boolean;
}

export const FormWrapper = styled.div<FormWrapperProps>`
  box-sizing: border-box;
  width: 100%;
  display: flex;
  border-radius: 0 0 8px 8px;
  flex-direction: column;
  // background-color: rgba(0, 0, 0, 0.02);
  background-color: rgba(255, 255, 255, 0.9);
  height: ${(props) => (props.isSidebar ? "calc(100% - 40px)" : "auto")};
`;

export const FormTitleDescription = styled.div`
  color: var(--semi-color-text-1);
  font-size: 14px;
  line-height: 22px;
  border-bottom: 1px solid var(--semi-color-border);
  padding: 8px;
  word-break: break-all;
  white-space: break-spaces;
`;
