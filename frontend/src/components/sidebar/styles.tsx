import { SideSheet } from "@douyinfe/semi-ui";
import styled from "styled-components";

export const StyledSideSheet = styled(SideSheet)`
  top: ${(props) =>
    props.placement === "left" || props.placement === "right"
      ? "20px"
      : "auto"};
  right: 20px;
  height: calc(100vh - 40px);
  border-radius: 16px;
  overflow: hidden;

  .semi-sidesheet-header {
    display: none;
  }
  .semi-sidesheet-body {
    padding: 0;
    overflow: hidden;
  }
`;
