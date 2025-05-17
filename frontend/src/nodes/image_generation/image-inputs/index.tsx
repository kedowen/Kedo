import React, { useState, useEffect, useCallback } from "react";
import { Field, FieldArray, useForm } from "@flowgram.ai/free-layout-editor";
import {
  Typography,
  Input,
  Select,
  Button,
  TextArea,
  Collapse,
  Upload,
  Slider,
  InputNumber,
  Space,
} from "@douyinfe/semi-ui";
import {
  IconDelete,
  IconMinus,
  IconPlus,
  IconUpload,
} from "@douyinfe/semi-icons";
import { TypeSelect } from "../../../form-components/type-select";
import { TypeDefault } from "../../../form-components/type-default";
import { FxExpression, FxIcon } from "../../../form-components/fx-expression";
import { VariableSelector } from "@/plugins/sync-variable-plugin/variable-selector";
import {
  FlowLiteralValueSchema,
  FlowRefValueSchema,
  JsonSchema,
} from "@/typings";
import { ParamsArrayEditor } from "@/components";
import { FileUpload, FormItem } from "@/form-components";
import { useIsSidebar } from "@/hooks";
import { awaitWrapper, getImageLLMList } from "@/api";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { Feedback } from "@/form-components/feedback";

const { Text } = Typography;
const { Option } = Select;

// 风格选项定义 - 使用语言包
const styleOptionsEnum = Array.from({ length: 7 }).map((_, index) => 
  i18n.t(`nodes.image_generation.styleOptions.${index}`)
);

// 比例选项及对应的宽高值
const aspectRatioMap: Record<string, { width: number; height: number }> = {
  "1:1 (1024*1024)": { width: 1024, height: 1024 },
  "16:9 (1024*576)": { width: 1024, height: 576 },
  "3:2 (1024*682)": { width: 1024, height: 682 },
  "4:3 (1024*768)": { width: 1024, height: 768 },
  "3:4 (768*1024)": { width: 768, height: 1024 },
  "2:3 (682*1024)": { width: 682, height: 1024 },
  "9:16 (576*1024)": { width: 576, height: 1024 },
};

// 样式定义
const SectionStyle = {
  marginBottom: "20px",
};

const LabelStyle = {
  fontSize: "12px",
  color: "#666",
  marginBottom: "4px",
  display: "block",
};

const RequiredLabelStyle = {
  ...LabelStyle,
  position: "relative" as const,
};

const RequiredMark = {
  color: "#ff4d4f",
  marginLeft: "4px",
  fontSize: "14px",
  fontWeight: "bold" as const,
};

const RowStyle = {
  display: "flex",
  alignItems: "center",
  marginBottom: "12px",
  gap: "8px",
};

const ParamContainer = {
  padding: "12px",
  border: "1px solid #e0e0e0",
  borderRadius: "4px",
  marginBottom: "16px",
  background: "#fafafa",
};

// 模型类型选择器
const ModelTypeSelector = () => {
  const readonly = !useIsSidebar();
  const [modelList, setModelList] = useState([]);

  const actGetModelList = async () => {
    const [err, res] = await awaitWrapper(getImageLLMList());
    if (res && res.data) {
      return [null, res.data];
    } else {
      return [err, null];
    }
  };

  useEffect(() => {
    const getList = async () => {
      const [err, data] = await actGetModelList();
      if (data) {
        console.log(data);

        setModelList(data);
      }
    };
    getList();
  }, []);

  return (
    <Field<string> name="inputsValues.modelType">
      {({ field }) => (
        <Select
          onChangeWithObject
          value={field.value}
          onChange={(val) => {
            field.onChange({
              value: val.value,
              label: val.label,
            });
          }}
          disabled={readonly}
          style={{ width: "100%" }}
          optionList={
            modelList.map((item: any) => ({
              label: item.itemValue,
              value: item.itemDetailId,
              title:item.itemName
            })) || []
          }
        />
      )}
    </Field>
  );
};

// 图像输入组件
export const ImageInputs = () => {
  const { t } = useTranslation();
  const form = useForm();
  const [customProps, setCustomProps] = useState<Record<string, JsonSchema>>(
    {}
  );

  // 用于保持表单值的同步
  const syncFormValues = useCallback(() => {
    if (form) {
      const formAny = form as any;
      if (typeof formAny.submit === "function") {
        formAny.submit();
      }
    }
  }, [form]);

  // 初始化自定义参数
  useEffect(() => {
    if (form?.values?.inputs?.properties) {
      const { properties } = form.values.inputs;
      // 过滤出自定义属性，排除系统预设的属性
      const systemProps = [
        "style",
        "width",
        "height",
        "aspectRatio",
        "referenceImages",
        "similarity",
        "prompt",
        "negativePrompt",
      ];

      const customProperties: Record<string, JsonSchema> = {};
      Object.keys(properties).forEach((key) => {
        if (!systemProps.includes(key)) {
          customProperties[key] = properties[key];
        }
      });

      setCustomProps(customProperties);
    }
  }, [form?.values?.inputs?.properties]);

  // 添加自定义参数
  const handleAddCustomParam = () => {
    const newParamKey = `param_${Date.now()}`;
    const newProps = {
      ...customProps,
      [newParamKey]: { type: "string", description: t('nodes.image_generation.form.customParamName') },
    };

    setCustomProps(newProps);

    // 更新表单的inputs.properties
    if (form?.values?.inputs?.properties) {
      const updatedProperties = {
        ...form.values.inputs.properties,
        [newParamKey]: { type: "string", description: t('nodes.image_generation.form.customParamName') },
      };

      form.setValueIn("inputs.properties", updatedProperties);

      // 初始化参数值
      form.setValueIn(`inputsValues.${newParamKey}`, "");

      syncFormValues();
    }
  };

  // 删除自定义参数
  const handleDeleteParam = (key: string) => {
    const { [key]: _, ...restProps } = customProps;
    setCustomProps(restProps);

    // 从表单中移除
    if (form?.values?.inputs?.properties) {
      const { [key]: _, ...restProperties } = form.values.inputs.properties;
      form.setValueIn("inputs.properties", restProperties);

      // 从inputsValues中也移除
      if (
        form.values.inputsValues &&
        form.values.inputsValues[key] !== undefined
      ) {
        const { [key]: __, ...restInputValues } = form.values.inputsValues;
        form.setValueIn("inputsValues", restInputValues);
      }

      syncFormValues();
    }
  };

  // 更新自定义参数
  const handleParamChange = (
    oldKey: string,
    updatedSchema: JsonSchema,
    newKey?: string
  ) => {
    if (newKey && newKey !== oldKey) {
      // 重命名参数
      const { [oldKey]: paramSchema, ...restProps } = customProps;
      setCustomProps({
        ...restProps,
        [newKey]: updatedSchema,
      });

      // 更新表单值
      if (form?.values?.inputs?.properties) {
        const { [oldKey]: _, ...restProperties } =
          form.values.inputs.properties;
        form.setValueIn("inputs.properties", {
          ...restProperties,
          [newKey]: updatedSchema,
        });

        // 移动inputsValues中的值
        if (
          form.values.inputsValues &&
          form.values.inputsValues[oldKey] !== undefined
        ) {
          const value = form.values.inputsValues[oldKey];
          const { [oldKey]: __, ...restInputValues } = form.values.inputsValues;
          form.setValueIn("inputsValues", {
            ...restInputValues,
            [newKey]: value,
          });
        }
      }
    } else {
      // 只更新schema
      setCustomProps({
        ...customProps,
        [oldKey]: updatedSchema,
      });

      // 更新表单
      if (form?.values?.inputs?.properties) {
        form.setValueIn(`inputs.properties.${oldKey}`, updatedSchema);
      }
    }

    syncFormValues();
  };

  // 处理宽高比例变化
  const handleAspectRatioChange = (value: string) => {
    if (aspectRatioMap[value]) {
      const { width, height } = aspectRatioMap[value];
      form?.setValueIn("inputsValues.width", width);
      form?.setValueIn("inputsValues.height", height);

      syncFormValues();
    }
  };

  // // 处理图片上传
  // const handleImageUpload = (files: File[]) => {
  //   if (!files || files.length === 0) return;

  //   const file = files[0];
  //   const reader = new FileReader();

  //   reader.onload = (e) => {
  //     const imageData = e.target?.result as string;

  //     // 获取当前参考图列表
  //     const currentReferenceImages = Array.isArray(
  //       form?.values?.inputsValues?.referenceImages
  //     )
  //       ? [...form.values.inputsValues.referenceImages]
  //       : [];

  //     // 添加新图片
  //     currentReferenceImages.push({
  //       imageData,
  //       similarity: form?.values?.inputsValues?.similarity || 0.7,
  //     });

  //     // 更新表单
  //     form?.setValueIn("inputsValues.referenceImages", currentReferenceImages);
  //     syncFormValues();
  //   };

  //   reader.readAsDataURL(file);
  // };

  const addReferenceImages = (field) => {
    field.append({
      type: "expression",
      content: "",
      similarity: 0.7,
    });
  };

  const deleteReferenceImages = (field, index) => {
    field.delete(index);
  };

  // 删除参考图
  const handleDeleteImage = (index: number) => {
    const currentReferenceImages = Array.isArray(
      form?.values?.inputsValues?.referenceImages
    )
      ? [...form.values.inputsValues.referenceImages]
      : [];

    if (index >= 0 && index < currentReferenceImages.length) {
      currentReferenceImages.splice(index, 1);
      form?.setValueIn("inputsValues.referenceImages", currentReferenceImages);
      syncFormValues();
    }
  };

  // 更新参考图相似度
  const handleUpdateImageSimilarity = (index: number, similarity: number) => {
    const currentReferenceImages = Array.isArray(
      form?.values?.inputsValues?.referenceImages
    )
      ? [...form.values.inputsValues.referenceImages]
      : [];

    if (index >= 0 && index < currentReferenceImages.length) {
      currentReferenceImages[index].similarity = similarity;
      form?.setValueIn("inputsValues.referenceImages", currentReferenceImages);
      syncFormValues();
    }
  };

  // 验证提示词
  const validatePrompt = (value: string | undefined) => {
    if (!value || value.trim() === "") {
      return t('nodes.image_generation.validation.promptRequired');
    }
    return undefined;
  };

  const toggleExpression = (field) => {
    field.onChange({
      content: "",
      type: field.value.type === "expression" ? "file" : "expression",
      similarity: field.value.similarity,
    });
  };
  return (
    <div>
      {/* 模型设置区 */}
      <Collapse defaultActiveKey={["modelSettings"]} expandIconPosition="left">
        <Collapse.Panel header={t('nodes.image_generation.form.modelSettings')} itemKey="modelSettings">
          <div style={SectionStyle}>
            <div style={RowStyle}>
              <div style={{ flex: 1 }}>
                <Text style={LabelStyle}>{t('nodes.image_generation.form.style')}</Text>
                <Field name="inputsValues.style">
                  {({ field }) => (
                    <Select
                      style={{ width: "100%" }}
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        syncFormValues();
                      }}
                    >
                      {styleOptionsEnum.map((style) => (
                        <Option key={style} value={style}>
                          {style}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Field>
              </div>
            </div>
            <div style={RowStyle}>
              <div style={{ flex: 1 }}>
                <Text style={LabelStyle}>{t('nodes.image_generation.form.modelType')}</Text>
                <ModelTypeSelector />
              </div>
            </div>

            <div style={RowStyle}>
              <div style={{ flex: 1 }}>
                <Text style={LabelStyle}>{t('nodes.image_generation.form.aspectRatio')}</Text>
                <Field name="inputsValues.aspectRatio">
                  {({ field }) => (
                    <Select
                      style={{ width: "100%" }}
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        handleAspectRatioChange(value as string);
                      }}
                    >
                      {Object.keys(aspectRatioMap).map((ratio) => {
                        // 找到aspectRatioOptions中对应的翻译
                        const index = ["1:1 (1024*1024)", "16:9 (1024*576)", "3:2 (1024*682)", 
                                      "4:3 (1024*768)", "3:4 (768*1024)", "2:3 (682*1024)", "9:16 (576*1024)"].indexOf(ratio);
                        const localizedRatio = index >= 0 ? i18n.t(`nodes.image_generation.aspectRatioOptions.${index}`) : ratio;
                        return (
                          <Option key={ratio} value={ratio}>
                            {localizedRatio}
                          </Option>
                        );
                      })}
                    </Select>
                  )}
                </Field>
              </div>
            </div>

            <div style={RowStyle}>
              <div style={{ flex: 1 }}>
                <Text style={LabelStyle}>{t('nodes.image_generation.form.width')}</Text>
                <Field name="inputsValues.width">
                  {({ field }) => (
                    <InputNumber
                      style={{ width: "100%" }}
                      value={field.value as number}
                      min={256}
                      max={1024}
                      onChange={(value) => {
                        field.onChange(value);
                        syncFormValues();
                      }}
                    />
                  )}
                </Field>
              </div>
              <div style={{ flex: 1 }}>
                <Text style={LabelStyle}>{t('nodes.image_generation.form.height')}</Text>
                <Field name="inputsValues.height">
                  {({ field }) => (
                    <InputNumber
                      style={{ width: "100%" }}
                      value={field.value as number}
                      min={256}
                      max={1024}
                      onChange={(value) => {
                        field.onChange(value);
                        syncFormValues();
                      }}
                    />
                  )}
                </Field>
              </div>
            </div>
          </div>
        </Collapse.Panel>
      </Collapse>

      {/* 参考图区 */}
      <Collapse defaultActiveKey={["referenceImages"]} expandIconPosition="left">
        <Collapse.Panel header={t('nodes.image_generation.form.referenceImages')} itemKey="referenceImages">
          <div style={{ ...SectionStyle }}>
            <FieldArray name="inputsValues.referenceImages">
              {({ field: fieldArray }) => (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={LabelStyle}>{t('nodes.image_generation.form.referenceImages')}</Text>
                    <Button
                      size="small"
                      icon={<IconPlus />}
                      onClick={() => {
                        addReferenceImages(fieldArray);
                      }}
                    />
                  </div>
                  {fieldArray.map((child, childIndex) => (
                    <div style={{ marginTop: "8px" }}>
                      <div
                        style={{ display: "flex", gap: "8px", width: "100%" }}
                      >
                        <InputNumber
                          style={{ width: "80px" }}
                          value={child.value.similarity as number}
                          min={0}
                          max={1}
                          step={0.1}
                          onChange={(value) => {
                            child.onChange({
                              ...child.value,
                              similarity: value,
                            });
                            syncFormValues();
                          }}
                        />
                        {child.value.type === "expression" ? (
                          <VariableSelector
                            style={{ flex: 1, height: "32px" }}
                            value={child.value.content}
                            onChange={(v) =>
                              child.onChange({
                                ...child.value,
                                content: v,
                              })
                            }
                          />
                        ) : (
                          <FileUpload
                            accept="image/*"
                            style={{ flex: 1 }}
                            onUploadComplete={(url) =>
                              child.onChange({
                                ...child.value,
                                content: url,
                              })
                            }
                            defaultFileUrl={child.value.content}
                          />
                        )}

                        <Button
                          theme="borderless"
                          icon={<FxIcon />}
                          style={{ marginLeft: "4px", height: "32px" }}
                          onClick={() => toggleExpression(child)}
                        />
                        <Button
                          size="small"
                          icon={<IconMinus />}
                          onClick={() => {
                            deleteReferenceImages(fieldArray, childIndex);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </>
              )}
            </FieldArray>

            {/* 参考图列表 */}
            {/* <Field name="inputsValues.referenceImages">
              {({ field }) => {
                const referenceImages =
                  (field.value as Array<{
                    imageData: string;
                    similarity: number;
                  }>) || [];
                return (
                  <div style={{ marginTop: "12px" }}>
                    {referenceImages.map((image, index) => (
                      <div key={index} style={ParamContainer}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                          }}
                        >
                          <Text strong>{t('nodes.image_generation.form.referenceImages')} #{index + 1}</Text>
                          <Button
                            type="danger"
                            theme="borderless"
                            icon={<IconDelete />}
                            onClick={() => handleDeleteImage(index)}
                          />
                        </div>
                        <div>
                          <img
                            src={image.imageData}
                            alt={`${t('nodes.image_generation.form.referenceImages')} ${index}`}
                            style={{
                              width: "100%",
                              height: "auto",
                              maxHeight: "150px",
                              objectFit: "contain",
                              marginBottom: "8px",
                            }}
                          />
                        </div>
                        <div>
                          <Text style={LabelStyle}>{t('nodes.image_generation.form.similarity')}</Text>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <Slider
                              style={{ flex: 1 }}
                              value={image.similarity}
                              min={0}
                              max={1}
                              step={0.01}
                              onChange={(value) =>
                                handleUpdateImageSimilarity(
                                  index,
                                  value as number
                                )
                              }
                            />
                            <InputNumber
                              style={{ width: "70px" }}
                              value={image.similarity}
                              min={0}
                              max={1}
                              step={0.01}
                              onChange={(value) =>
                                handleUpdateImageSimilarity(
                                  index,
                                  value as number
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {referenceImages.length === 0 && (
                      <div
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          color: "#999",
                        }}
                      >
                        {t('nodes.image_generation.form.noCustomParams')}
                      </div>
                    )}
                  </div>
                );
              }}
            </Field> */}
          </div>
        </Collapse.Panel>
      </Collapse> 

      {/* 自定义参数区 - 调整位置到提示词前面 */}
      <Collapse defaultActiveKey={["customParams"]} expandIconPosition="left">
        <Collapse.Panel
          header={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <span>{t('nodes.image_generation.form.customParams')}</span>
            </div>
          }
          itemKey="customParams"
        >
          <div style={SectionStyle}>
            <ParamsArrayEditor
              arrayName="customParams"
              disabled={false}
              emptyText={t('nodes.image_generation.form.noCustomParams')}
            />
          </div>
        </Collapse.Panel>
      </Collapse>

      {/* 提示词区 - 调整位置到后面 */}
      <Collapse defaultActiveKey={["promptSettings"]} expandIconPosition="left">
        <Collapse.Panel header={t('nodes.image_generation.form.promptSettings')} itemKey="promptSettings">
          <div style={SectionStyle}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Text style={RequiredLabelStyle}>
                {t('nodes.image_generation.form.prompt')}
                <span style={RequiredMark}>*</span>
              </Text>
            </div>
            <Field name="inputsValues.prompt">
              {({ field, fieldState }) => (
                <>
                  <TextArea
                    placeholder={t('nodes.image_generation.form.promptPlaceholder')}
                    value={field.value as string}
                    onChange={(value) => {
                      field.onChange(value);
                      syncFormValues();
                    }}
                    autosize={{ minRows: 3, maxRows: 6 }}
                    style={{ width: "100%" }}
                  />
                  {fieldState.errors && fieldState.errors.length > 0 && (
                    <Feedback 
                      errors={fieldState.errors}
                      invalid={true}
                    />
                  )}
                </>
              )}
            </Field>

            <div style={{ marginTop: "12px" }}>
              <Text style={LabelStyle}>{t('nodes.image_generation.form.negativePrompt')}</Text>
              <Field name="inputsValues.negativePrompt">
                {({ field }) => (
                  <TextArea
                    placeholder={t('nodes.image_generation.form.negativePromptPlaceholder')}
                    value={field.value as string}
                    onChange={(value) => {
                      field.onChange(value);
                      syncFormValues();
                    }}
                    autosize={{ minRows: 3, maxRows: 5 }}
                    style={{ width: "100%" }}
                  />
                )}
              </Field>
            </div>
          </div>
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};
