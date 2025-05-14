import React, { type SVGProps, useState, useEffect } from "react";

import { Input, TextArea, Button } from "@douyinfe/semi-ui";

import { ValueDisplay } from "../value-display";
import { FlowRefValueSchema, FlowLiteralValueSchema } from "../../typings";
import { VariableSelector } from "../../plugins/sync-variable-plugin/variable-selector";

export function FxIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      {...props}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M5.581 4.49A2.75 2.75 0 0 1 8.319 2h.931a.75.75 0 0 1 0 1.5h-.931a1.25 1.25 0 0 0-1.245 1.131l-.083.869H9.25a.75.75 0 0 1 0 1.5H6.849l-.43 4.51A2.75 2.75 0 0 1 3.681 14H2.75a.75.75 0 0 1 0-1.5h.931a1.25 1.25 0 0 0 1.245-1.132L5.342 7H3.75a.75.75 0 0 1 0-1.5h1.735zM9.22 9.22a.75.75 0 0 1 1.06 0l1.22 1.22l1.22-1.22a.75.75 0 1 1 1.06 1.06l-1.22 1.22l1.22 1.22a.75.75 0 1 1-1.06 1.06l-1.22-1.22l-1.22 1.22a.75.75 0 1 1-1.06-1.06l1.22-1.22l-1.22-1.22a.75.75 0 0 1 0-1.06"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

function InputWrap({
  value,
  onChange,
  readonly,
  hasError,
  style,
  useTextArea = false,
  rows = 4,
  placeholder = "",
}: {
  value: string;
  onChange: (v: string) => void;
  readonly?: boolean;
  hasError?: boolean;
  style?: React.CSSProperties;
  useTextArea?: boolean;
  rows?: number;
  placeholder?: string;
}) {
  if (readonly) {
    return <ValueDisplay value={value} hasError={hasError} />;
  }

  if (useTextArea) {
    return (
      <TextArea
        value={value as string}
        onChange={onChange}
        validateStatus={hasError ? "error" : undefined}
        style={style}
        rows={rows}
        placeholder={placeholder}
      />
    );
  }

  return (
    <Input
      value={value as string}
      onChange={onChange}
      validateStatus={hasError ? "error" : undefined}
      style={style}
      placeholder={placeholder}
    />
  );
}

export interface FxExpressionProps {
  value: FlowRefValueSchema;
  onChange: (value: FlowLiteralValueSchema | FlowRefValueSchema) => void;
  literal?: boolean;
  hasError?: boolean;
  readonly?: boolean;
  icon?: React.ReactNode;
  useTextArea?: boolean;
  rows?: number;
  placeholder?: string;
  form?: any;
  fieldPath?: string;
  clearBeforeFxSelect?: boolean;
}

export function FxExpression(props: FxExpressionProps) {
  const {
    value,
    onChange,
    readonly,
    literal,
    icon,
    useTextArea = false,
    rows = 4,
    placeholder = "",
    form,
    fieldPath,
    clearBeforeFxSelect = false,
  } = props;
  const [isExpressionMode, setIsExpressionMode] = useState(false);

  useEffect(() => {
    const isExpression = !!value?.type && value?.type === "expression";
    setIsExpressionMode(isExpression);
    // if (form && fieldPath) {
    //   const isExpression = !!value?.type && value?.type === "expression";
    //   setIsExpressionMode(isExpression);
    // }

    // // 如果传入的是对象，则提取出content部分
    // if (
    //   value &&
    //   typeof value === "object" &&
    //   (value.type === "fx" || value.type === "expression") &&
    //   "content" in value
    // ) {
    //   console.log(
    //     "FxExpression: 检测到对象类型值，提取content:",
    //     value.content
    //   );
    // }
  }, [form, fieldPath, value]);

  // if (literal)
  //   return (
  //     <InputWrap
  //       value={value as string}
  //       onChange={onChange}
  //       readonly={readonly}
  //       useTextArea={useTextArea}
  //       rows={rows}
  //       placeholder={placeholder}
  //     />
  //   );

  // 获取实际显示的字符串值
  // const getDisplayValue = (): string => {
  //   if (typeof value === "string") return value;
  //   if (typeof value === "object" && value && "content" in value)
  //     return value.content || "";
  //   return String(value || "");
  // };

  const toggleExpression = () => {
    // console.log("FxExpression: 切换表达式模式前状态:", {
    //   isExpressionMode,
    //   formExists: !!form,
    //   fieldPathExists: !!fieldPath,
    //   value,
    // });

    if (isExpressionMode) {
      console.log("FxExpression: 从表达式模式切换回普通模式");
      // if (form && fieldPath) {
      //   const fieldName = fieldPath.split(".").pop() || "";
      //   const inputs = form.getValueIn("inputs");
      //   if (inputs && inputs.properties && inputs.properties[fieldName]) {
      //     const originalType =
      //       inputs.properties[fieldName]._originalType || "string";
      //     const updatedProperties = {
      //       ...inputs.properties,
      //       [fieldName]: {
      //         ...inputs.properties[fieldName],
      //         type: originalType,
      //         _originalType: undefined,
      //       },
      //     };
      //     form.setValueIn("inputs.properties", updatedProperties);
      //   }
      // }

      // 从对象中提取字符串
      // const stringValue = getDisplayValue();
      // console.log("FxExpression: 切换回普通模式，使用值:", stringValue);
      onChange({
        type: "string",
        content: "",
      });

      setIsExpressionMode(false);
    } else {
      console.log("FxExpression: 从普通模式切换到表达式模式");

      // if (form && fieldPath) {
      //   const fieldName = fieldPath.split(".").pop() || "";
      //   const inputs = form.getValueIn("inputs");
      //   if (inputs && inputs.properties && inputs.properties[fieldName]) {
      //     const updatedProperties = {
      //       ...inputs.properties,
      //       [fieldName]: {
      //         ...inputs.properties[fieldName],
      //         _originalType: inputs.properties[fieldName].type,
      //         type: "expression",
      //       },
      //     };
      //     form.setValueIn("inputs.properties", updatedProperties);
      //   }
      // }

      // const currentValue = getDisplayValue();
      // const newValue = clearBeforeFxSelect ? "" : currentValue;

      // console.log("FxExpression: 切换到表达式模式，使用值:", newValue);
      onChange({
        type: "expression",
        content: "",
      });

      setIsExpressionMode(true);
    }
  };

  return (
    <React.Fragment>
      <div style={{ display: "flex" }}>
        {isExpressionMode ? (
          <VariableSelector
            value={value?.content as string}
            hasError={props.hasError}
            style={{ flexGrow: 1 }}
            onChange={(v) => {
              console.log("FxExpression VariableSelector onChange:", v);
              onChange({
                type: "expression",
                content: v || "",
              });
            }}
            readonly={readonly}
          />
        ) : (
          <InputWrap
          value={value?.content as string}
            onChange={(v) => {
              console.log("FxExpression InputWrap onChange:", v);
              onChange({
                type: "string",
                content: v,
              });
            }}
            hasError={props.hasError}
            readonly={readonly}
            style={{
              flexGrow: 1,
              outline: props.hasError ? "1px solid red" : undefined,
            }}
            useTextArea={useTextArea}
            rows={rows}
            placeholder={placeholder}
          />
        )}
        {!readonly &&
          (icon || (
            <Button
              theme="borderless"
              icon={<FxIcon />}
              onClick={toggleExpression}
            />
          ))}
      </div>
    </React.Fragment>
  );
}
