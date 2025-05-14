import React, { useRef, useState, ReactNode } from "react";
import { JsonViewer } from "@douyinfe/semi-ui";
import styled from "styled-components";

// Styled component for the container
const JsonEditorContainer = styled.div`
  width: 100%;
  position: relative;
  .semi-json-view,
  .semi-json-view-container {
    width: 100% !important;
    max-width: 100% !important;
  }

  /* Override any inner elements that might have fixed width */
  * {
    max-width: 100%;
  }
`;

// Helper functions for JSON formatting and parsing
const formatJsonString = (value: any): string => {
  try {
    return JSON.stringify(value, null, 2);
  } catch (e) {
    return "";
  }
};

const parseJsonString = (value: string): any => {
  try {
    return JSON.parse(value);
  } catch (e) {
    return null;
  }
};

interface JsonEditorProps {
  value: any;
  onChange?: (value: any) => void;
  height?: number;
  showSearch?: boolean;
  children?: ReactNode; // 子元素
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  onChange,
  height = 150,
  showSearch = false,
  children,
}) => {
  const jsonViewerRef = useRef<any>(null);

  return (
    <JsonEditorContainer
      onBlur={() => {
        if (jsonViewerRef.current && jsonViewerRef.current.getValue) {
          const currentValue = jsonViewerRef.current.getValue();
          const parsedValue = parseJsonString(currentValue);
          if (parsedValue !== null && onChange) {
            onChange(parsedValue);
          }
        }
      }}
    >
      <JsonViewer
        ref={jsonViewerRef}
        height={height}
        style={{ overflow: "hidden", width: "100%" }}
        value={formatJsonString(value)}
        defaultExpandedKeys={[]}
        showSearch={showSearch}
      />
      {children}
    </JsonEditorContainer>
  );
};
