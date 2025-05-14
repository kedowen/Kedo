import styled from "styled-components";

export const ErrorContainerStyle = styled.div`
  border-radius: 4px;
  &.has-error {
    background-color: var(--semi-color-danger-light-default);
    border-color: var(--semi-color-danger-light-default);
    outline: red solid 1px;
  }
`;
