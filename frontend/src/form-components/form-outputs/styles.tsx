import styled from "styled-components";

export const FormOutputsContainer = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  padding: 3px 12px;
  min-height: 32px;
  align-items: center;
  // background-color: rgb(251, 251, 252);
  // border-radius: 0px 0px 12px 12px;
  border-top: 1px solid rgb(245, 245, 245);
  gap: 8px;

  :global(.semi-tag .semi-tag-content) {
    font-size: 10px;
  }
`;
