import React, { useCallback } from "react";

import { Typography, Tooltip } from "@douyinfe/semi-ui";

import { TypeTag } from "../type-tag";
import "./index.css";

const { Text } = Typography;

interface FormItemProps {
  children: React.ReactNode;
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  labelWidth?: number;
  isColumn?: boolean; // 是否为列模式
}
export function FormItem({
  children,
  name,
  required,
  description,
  type,
  labelWidth,
  isColumn = false,
}: FormItemProps): JSX.Element {
  const renderTitle = useCallback(
    (showTooltip?: boolean) => (
      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
        <Text style={{ flex: "1" }} ellipsis={{ showTooltip: !!showTooltip }}>
          {name}
        </Text>
        {required && (
          <span style={{ color: "#f93920", marginLeft: "2px", flexShrink: 0 }}>
            *
          </span>
        )}
      </div>
    ),
    [name, required]
  );
  return (
    <div
      style={{
        fontSize: 12,
        marginBottom: 6,
        width: "100%",
        display: "flex",
        flexDirection: isColumn ? "column" : "row",
        alignItems: "flex-start",
        gap: 8,
      }}
    >
      <div
        style={{
          color: "var(--semi-color-text-0)",
          width: labelWidth || 118,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          columnGap: 4,
          flexShrink: 0,
          paddingTop: 6,
        }}
      >
        <TypeTag className="form-item-type-tag" type={type} />
        {description ? (
          <Tooltip content={description}>{renderTitle()}</Tooltip>
        ) : (
          renderTitle(true)
        )}
      </div>
      <div
        style={{
          ...(isColumn
            ? {
                width: "100%",
              }
            : {
                flex: 1,
              }),
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </div>
  );
}
