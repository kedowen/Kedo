import React, { useEffect, useState, useCallback, useRef } from "react";
import { Field, useForm } from "@flowgram.ai/free-layout-editor";
import { FlowLiteralValueSchema, FlowRefValueSchema } from "../../typings";
import { Typography, Tag, Space, Tooltip } from "@douyinfe/semi-ui";
import { IconImage } from "@douyinfe/semi-icons";
import { FormArrayOutputs, FormOutputs } from "@/form-components";
import { useTranslation } from 'react-i18next';

// 用于安全显示可能是对象的值
const safeRenderValue = (value: any): string => {
  if (value === null || value === undefined || value === "") {
    return "--";
  }

  if (typeof value === "object") {
    // 检查是否是表达式对象
    if (value.type === "expression" && value.content) {
      return `{{${value.content}}}`;
    }
    // 数组显示长度
    if (Array.isArray(value)) {
      return `[${value.length}项]`;
    }
    // 其他对象类型转为JSON字符串
    return JSON.stringify(value);
  }

  return String(value);
};

// 简化的图像生成视图组件
export const SimplifiedImageView = () => {
  const { t } = useTranslation();
  const form = useForm();
  const [customInputParams, setCustomInputParams] = useState<string[]>([]);
  const [customArrayParams, setCustomArrayParams] = useState<
    Array<{ title: string; type: string; value: any }>
  >([]);
  const formValuesRef = useRef<any>(null);

  // 系统预设参数列表 - 这些是基本参数，不会显示在自定义输入标签中
  const SYSTEM_PARAMS = [
    "style",
    "width",
    "height",
    "aspectRatio",
    "referenceImages",
    "similarity",
    "prompt",
    "negativePrompt",
    "customParams",
  ];

  // 表单同步函数，确保变更被提交
  const handleFormSync = useCallback(() => {
    if (!form) {
      console.error("表单实例不存在，无法同步");
      return;
    }

    const formAny = form as any;

    try {
      if (typeof formAny.submit === "function") {
        formAny.submit();
      } else if (typeof formAny.handleSubmit === "function") {
        formAny.handleSubmit();
      }
    } catch (err) {
      console.error("表单同步出错:", err);
    }
  }, [form]);

  // 更新参数函数
  const updateParams = useCallback(() => {
    if (!form?.values) return;

    // 更新自定义参数列表
    if (form.values.inputs?.properties) {
      const allParams = Object.keys(form.values.inputs.properties);
      // 过滤出非系统参数的自定义参数
      const filteredParams = allParams.filter(
        (param) => !SYSTEM_PARAMS.includes(param)
      );

      // 检查是否有变化，避免不必要的更新
      const currentParamsStr = JSON.stringify(filteredParams);
      const prevParamsStr = JSON.stringify(customInputParams);

      if (currentParamsStr !== prevParamsStr) {
        console.log("自定义参数已更新:", filteredParams);
        setCustomInputParams(filteredParams);
      }
    }

    // 检查并处理customParams数组参数
    if (
      form.values.inputsValues &&
      form.values.inputsValues.customParams &&
      Array.isArray(form.values.inputsValues.customParams)
    ) {
      const customParams = form.values.inputsValues.customParams;
      // 检查是否有变化，避免不必要的更新
      const currentParamsStr = JSON.stringify(customParams);
      const prevParamsStr = JSON.stringify(customArrayParams);

      if (currentParamsStr !== prevParamsStr) {
        setCustomArrayParams(customParams);
      }
    }
  }, [form?.values, SYSTEM_PARAMS]);

  // 监听表单变更
  // useEffect(() => {
  //   // 初始更新
  //   if (form?.values) {
  //     formValuesRef.current = { ...form.values };
  //     updateParams();
  //   }

  //   // 设置更新间隔
  //   const interval = setInterval(() => {
  //     if (form?.values) {
  //       // 简单检查部分关键路径的值是否发生变化
  //       const hasInputsChanged = form.values.inputs !== formValuesRef.current?.inputs;
  //       const hasInputsValuesChanged = form.values.inputsValues !== formValuesRef.current?.inputsValues;

  //       if (hasInputsChanged || hasInputsValuesChanged) {
  //         formValuesRef.current = { ...form.values };
  //         updateParams();
  //         handleFormSync();
  //       }
  //     }
  //   }, 500);
  //   return () => clearInterval(interval);
  // }, [form, updateParams, handleFormSync]);

  // 自定义参数展示逻辑
  const renderCustomParams = () => {
    // 优先显示customParams数组参数
    if (customArrayParams.length > 0) {
      // 只显示前两个参数
      const visibleParams = customArrayParams.slice(0, 2);
      const hiddenCount = customArrayParams.length - 2;

      return (
        <>
          {visibleParams.map((param, index) => (
            <Tooltip
              key={index}
              content={
                <div style={{ maxWidth: "200px", wordBreak: "break-all" }}>
                  <Typography.Text>
                    {param.title}: {safeRenderValue(param.value)}
                    <br />
                    <small>{t('nodes.image_generation.simplifiedView.type')}: {param.type}</small>
                  </Typography.Text>
                </div>
              }
            >
              <div>
                <InputTag type="tertiary">{param.title}</InputTag>
              </div>
            </Tooltip>
          ))}

          {/* 显示额外参数数量 */}
          {hiddenCount > 0 && (
            <Tooltip
              content={
                <div style={{ maxWidth: "200px" }}>
                  {customArrayParams.slice(2).map((param, index) => (
                    <div key={index} style={{ marginBottom: "4px" }}>
                      <Typography.Text>
                        {param.title}: {safeRenderValue(param.value)}
                        <br />
                        <small>{t('nodes.image_generation.simplifiedView.type')}: {param.type}</small>
                      </Typography.Text>
                    </div>
                  ))}
                </div>
              }
            >
              <div>
                <InputTag type="tertiary" style={{ cursor: "pointer" }}>
                  +{hiddenCount}
                </InputTag>
              </div>
            </Tooltip>
          )}
        </>
      );
    }

    // 如果没有customParams数组参数，则显示旧版的自定义参数
    if (customInputParams.length > 0) {
      const visibleParams = customInputParams.slice(0, 2);
      const hiddenCount = customInputParams.length - 2;

      return (
        <>
          {visibleParams.map((param) => (
            <InputTag key={param} type="tertiary">
              {param}
            </InputTag>
          ))}
          {hiddenCount > 0 && (
            <InputTag type="tertiary">+{hiddenCount}</InputTag>
          )}
        </>
      );
    }

    return null;
  };

  return (
    <React.Fragment>
      {/* 风格和尺寸显示 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "8px 10px 4px 10px",
          // borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Field<
          string | FlowLiteralValueSchema | FlowRefValueSchema
        > name="inputsValues.style">
          {({ field: styleField }) => (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginRight: "12px",
              }}
            >
              <IconImage
                size="small"
                style={{ color: "#2080f0", marginRight: "6px" }}
              />
              <Typography.Text strong style={{ fontSize: "13px" }}>
                {safeRenderValue(styleField.value)}
              </Typography.Text>
            </div>
          )}
        </Field>
        <Field<
          string | FlowLiteralValueSchema | FlowRefValueSchema
        > name="inputsValues.modelType.label">
          {({ field: ratioField }) => (
            <Tag
              color="green"
              size="small"
              type="light"
              style={{
                marginRight: "12px",
              }}
            >
              {/* <span>
                {ratioField.value}
              </span> */}
              {safeRenderValue(ratioField.value)}
            </Tag>
          )}
        </Field>

        <Field<
          string | FlowLiteralValueSchema | FlowRefValueSchema
        > name="inputsValues.aspectRatio">
          {({ field: ratioField }) => (
            <Tag color="blue" size="small" type="light">
              {safeRenderValue(ratioField.value)}
            </Tag>
          )}
        </Field>
      </div>

      <FormArrayOutputs name="inputsValues.customParams" label={t('nodes.image_generation.simplifiedView.input')} />
      <FormOutputs />
      {/* 输入输出参数显示 */}
      {/* <div style={{ padding: "8px 10px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            marginBottom: "6px",
          }}
        >
          <Typography.Text
            type="secondary"
            size="small"
            style={{ width: "36px", paddingTop: "2px" }}
          >
            {t('nodes.image_generation.simplifiedView.input')}
          </Typography.Text>
          <div>
            <Space spacing={4} wrap style={{ flexWrap: "wrap", gap: "4px" }}> */}
      {/* 显示自定义参数 */}
      {/* {renderCustomParams()} */}
      {/* </Space>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
          // }}
        >
          <Typography.Text
            type="secondary"
            size="small"
            style={{ width: "36px" }}
          >
            {t('nodes.image_generation.simplifiedView.output')}
          </Typography.Text>
          <Space spacing={4}>
            <InputTag type="tertiary">data</InputTag>
            <InputTag type="tertiary">msg</InputTag>
          </Space>
        </div> */}
      {/* </div> */}
    </React.Fragment>
  );
};

// 输入标签组件
const InputTag = ({
  children,
  type,
  style,
}: {
  children: React.ReactNode;
  type: "primary" | "warning" | "tertiary";
  style?: React.CSSProperties;
}) => {
  // 根据类型设置不同的颜色
  const getColor = () => {
    switch (type) {
      case "primary":
        return { bg: "#e6f7ff", text: "#1890ff" };
      case "warning":
        return { bg: "#fff0f0", text: "#ff4d4f" };
      case "tertiary":
        return { bg: "#f0f0f0", text: "#666" };
      default:
        return { bg: "#f0f0f0", text: "#666" };
    }
  };

  const colors = getColor();

  return (
    <div
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        padding: "1px 6px",
        borderRadius: "10px",
        fontSize: "11px",
        fontWeight: type !== "tertiary" ? "bold" : "normal",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
