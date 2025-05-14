import React from "react";

import { FlowNodeRegistry } from "@flowgram.ai/free-layout-editor";

import { useIsSidebar, useNodeRenderContext } from "../../hooks";
import { FormTitleDescription, FormWrapper } from "./styles";

/**
 * @param props
 * @constructor
 */
export function FormContent(props: { children?: React.ReactNode,style?: React.CSSProperties }) {
  const { node, expanded } = useNodeRenderContext();
  const isSidebar = useIsSidebar();
  const registry = node.getNodeRegistry<FlowNodeRegistry>();
  return (
    <FormWrapper isSidebar={isSidebar} style={props.style}>
      {isSidebar ? (
        <>
          <FormTitleDescription>
            {registry.info?.description}
          </FormTitleDescription>
          <div style={{ overflow: "auto" }}>{props.children}</div>
        </>
      ) : expanded ? (
        props.children
      ) : undefined}
    </FormWrapper>
  );
}
