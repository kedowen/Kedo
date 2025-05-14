import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import {
  Select,
  Input,
  Switch,
  InputNumber,
  Button,
  Radio,
  Tabs,
  Space,
  Typography,
  TextArea,
  JsonViewer,
  Tooltip,
  Modal,
  Collapse,
} from "@douyinfe/semi-ui";
import {
  IconPlus,
  IconDelete,
  IconEdit,
  IconCode,
  IconListView,
} from "@douyinfe/semi-icons";
import { Field, FieldArray, useForm } from "@flowgram.ai/free-layout-editor";

import { FormItem } from "../../../form-components/form-item";
import { FxExpression } from "../../../form-components/fx-expression";
import { Feedback } from "../../../form-components/feedback";
import { useIsSidebar } from "../../../hooks";
import { FlowLiteralValueSchema, FlowRefValueSchema } from "../../../typings";
import {
  HeadersEditor as NewHeadersEditor,
  ParamsEditor as NewParamsEditor,
} from "./HeaderParamsEditor";
import { ParamsArrayEditor } from "@/components";

const { Text } = Typography;

// 样式
const SpaceStyle = { width: "100%", marginBottom: "8px" };
const FlexContainer = {
  display: "flex",
  alignItems: "center",
  marginBottom: "8px",
};
const FlexContent = { flex: 1, marginRight: "8px" };
const ButtonContainer = { textAlign: "right" as const, marginTop: "8px" };
const JsonEditorContainer = {
  width: "100%",
  minHeight: "100px",
  border: "1px solid #e0e0e0",
  borderRadius: "4px",
  padding: "8px",
};

// 请求方法选择器
export const HttpMethodSelector = () => {
  const { t } = useTranslation();
  const readonly = !useIsSidebar();
  const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"];

  return (
    <Field<string> name="inputsValues.method">
      {({ field }) => (
        <FormItem name={t('nodes.http_request.form.method')} type="string" required>
          <Select
            value={field.value || ""}
            onChange={(val: string) => field.onChange(val)}
            disabled={readonly}
            style={{ width: "100%" }}
            optionList={httpMethods.map((method) => ({
              label: method,
              value: method,
            }))}
          />
        </FormItem>
      )}
    </Field>
  );
};

// URL输入组件
export const UrlInput = () => {
  const { t } = useTranslation();
  const readonly = !useIsSidebar();
  const form = useForm();

  return (
    <Field<string> name="inputsValues.url">
      {({ field, fieldState }) => {
        console.log("URL字段当前值:", field.value, "类型:", typeof field.value);

        // 增强onChange处理
        const handleUrlChange = (value: any) => {
          console.log("URL onChange接收到值:", value, "类型:", typeof value);

          // 检测是否为FX模式对象，如果是则只提取content部分
          if (typeof value === "object") {
            console.log("URL提取FX表达式内容:", value.content);
            // 直接保存content字符串，而非整个对象
            field.onChange({
              type: value.type,
              content: value.content,
            });
          } else {
            field.onChange(value);
          }

          // 确保表单提交
          if (form && typeof (form as any).submit === "function") {
            setTimeout(() => (form as any).submit(), 0);
          }
        };

        return (
          <FormItem name={t('nodes.http_request.form.url')} type="string" required>
            <FxExpression
              value={field.value as FlowLiteralValueSchema | FlowRefValueSchema}
              onChange={handleUrlChange}
              readonly={readonly}
              hasError={Object.keys(fieldState?.errors || {}).length > 0}
              placeholder={t('nodes.http_request.form.urlPlaceholder')}
              fieldPath="inputsValues.url"
              form={form}
              clearBeforeFxSelect={true}
            />
            <Feedback errors={fieldState?.errors} />
          </FormItem>
        );
      }}
    </Field>
  );
};

// 自定义鉴权组件
export const CustomAuthEditor = () => {
  const { t } = useTranslation();
  const readonly = !useIsSidebar();

  return (
    <React.Fragment>
      <Field<string> name="inputsValues.authKey">
        {({ field: keyField }) => (
          <FormItem 
            name={t('nodes.http_request.form.authCustom.key')} 
            type="string"
            labelWidth={100}
            isColumn={false}
          >
            <div style={{width: "100%"}}>
              <Input
                value={keyField.value || ""}
                onChange={(val: any) => keyField.onChange(val)}
                disabled={readonly}
                placeholder={t('nodes.http_request.form.authCustom.key')}
              />
              <Typography.Text type="tertiary" style={{ fontSize: "12px" }}>
                {t('nodes.http_request.form.authCustom.valueRequired')}
              </Typography.Text>
            </div>
          </FormItem>
        )}
      </Field>

      <Field<
        FlowLiteralValueSchema | FlowRefValueSchema
      > name="inputsValues.tokenValue">
        {({ field: valueField, fieldState }) => (
          <FormItem 
            name={t('nodes.http_request.form.authCustom.value')} 
            type="string"
            labelWidth={100}
            isColumn={false}
          >
            <div style={{width: "100%"}}>
              <FxExpression
                value={valueField.value}
                onChange={(value) => {
                  console.log("Custom Auth Value onChange:", value);
                  // 正确处理表达式类型值
                  valueField.onChange(value);
                }}
                readonly={readonly}
                hasError={Object.keys(fieldState?.errors || {}).length > 0}
                placeholder={t('nodes.http_request.form.authCustom.valuePlaceholder')}
              />
              <Typography.Text type="tertiary" style={{ fontSize: "12px" }}>
                {t('nodes.http_request.form.authCustom.valueRequired')}
              </Typography.Text>
            </div>
          </FormItem>
        )}
      </Field>

      <Field<string> name="inputsValues.authAddTo">
        {({ field: addToField }) => (
          <FormItem 
            name={t('nodes.http_request.form.authCustom.addTo')} 
            type="string"
            labelWidth={100}
            isColumn={false}
          >
            <div style={{width: "100%"}}>
              <Select
                value={addToField.value || "Header"}
                onChange={(val) => addToField.onChange(val)}
                disabled={readonly}
                style={{ width: "100%" }}
                optionList={[
                  { label: "Header", value: "Header" },
                  { label: "Query", value: "Query" },
                ]}
              />
            </div>
          </FormItem>
        )}
      </Field>
    </React.Fragment>
  );
};

// 鉴权设置组件
export const AuthSettings = () => {
  const { t } = useTranslation();
  const readonly = !useIsSidebar();
  const form = useForm();

  return (
    <React.Fragment>
      <Field<boolean> name="inputsValues.enableAuth">
        {({ field: enableAuthField }) => (
          <FormItem 
            name={t('nodes.http_request.form.enableAuth')} 
            type="boolean"
            labelWidth={180}
            isColumn={false}
          >
            <Switch
              checked={!!enableAuthField.value}
              onChange={(val: boolean) => enableAuthField.onChange(val)}
              disabled={readonly}
            />
          </FormItem>
        )}
      </Field>

      <Field<boolean> name="inputsValues.enableAuth">
        {({ field: enableAuthField }) =>
          enableAuthField.value ? (
            <Space vertical style={{ width: "100%" }}>
              <Field<string> name="inputsValues.authType">
                {({ field: authTypeField }) => (
                  <FormItem 
                    name={t('nodes.http_request.form.authType')} 
                    type="string"
                    labelWidth={180}
                    isColumn={false}
                  >
                    <Radio.Group
                      value={authTypeField.value || "Bearer Token"}
                      onChange={(e) => {
                        console.log("切换鉴权类型:", e.target.value);
                        authTypeField.onChange(e.target.value);
                      }}
                      disabled={readonly}
                      style={{width: "100%"}}
                    >
                      <Radio value="Bearer Token">Bearer Token</Radio>
                      <Radio value="自定义">{t('nodes.http_request.form.authCustom.custom')}</Radio>
                    </Radio.Group>
                  </FormItem>
                )}
              </Field>

              <Field<string> name="inputsValues.authType">
                {({ field: authTypeField }) =>
                  authTypeField.value === "Bearer Token" ? (
                    // Bearer Token 模式使用专用字段
                    <Field<
                      FlowLiteralValueSchema | FlowRefValueSchema
                    > name="inputsValues.authValue">
                      {({ field: authValueField, fieldState }) => (
                        <FormItem 
                          name={t('nodes.http_request.form.authToken')} 
                          type="string"
                          labelWidth={100}
                          isColumn={false}
                        >
                          <div style={{width: "100%"}}>
                            <FxExpression
                              value={authValueField.value}
                              onChange={(value) => {
                                console.log("Bearer Token值变更:", value);
                                authValueField.onChange(value);
                              }}
                              readonly={readonly}
                              hasError={
                                Object.keys(fieldState?.errors || {}).length > 0
                              }
                              placeholder={t('nodes.http_request.form.tokenPlaceholder')}
                              fieldPath="inputsValues.authValue"
                              form={form}
                              clearBeforeFxSelect={false}
                            />
                            <Feedback errors={fieldState?.errors} />
                          </div>
                        </FormItem>
                      )}
                    </Field>
                  ) : (
                    <CustomAuthEditor />
                  )
                }
              </Field>
            </Space>
          ) : (
            <></>
          )
        }
      </Field>
    </React.Fragment>
  );
};

// JSON编辑器组件
interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readonly?: boolean;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  onChange,
  placeholder,
  readonly,
}) => {
  const [jsonValue, setJsonValue] = useState("");

  useEffect(() => {
    try {
      if (value) {
        const formattedJson = JSON.stringify(JSON.parse(value), null, 2);
        setJsonValue(formattedJson);
      } else {
        setJsonValue("");
      }
    } catch (e) {
      setJsonValue(value || "");
    }
  }, [value]);

  const handleChange = (newValue: string) => {
    setJsonValue(newValue);
    try {
      // 确保是有效的JSON
      JSON.parse(newValue);
      onChange(newValue);
    } catch (e) {
      // 仍然更新输入框的值，但不触发onChange
      onChange(newValue);
    }
  };

  return (
    <TextArea
      value={jsonValue}
      onChange={handleChange}
      disabled={readonly}
      placeholder={placeholder}
      rows={8}
      style={{ fontFamily: "monospace" }}
    />
  );
};

// 请求体编辑器组件
interface BodyContentEditorProps {
  bodyType?: string;
  name: string;
  readonly?: boolean;
}

export const BodyContentEditor: React.FC<BodyContentEditorProps> = ({
  bodyType,
  name,
  readonly,
}) => {
  const { t } = useTranslation();
  
  if (!bodyType || bodyType === "none") return null;

  switch (bodyType) {
    case "JSON":
      return (
        <Field<string> name={`${name}.bodyContent`}>
          {({ field: contentField }) => (
            <FormItem name={t('nodes.http_request.form.bodyContent.json')} type="string">
              <JsonEditor
                value={contentField.value || ""}
                onChange={(value: string) => contentField.onChange(value)}
                placeholder={t('nodes.http_request.form.bodyContent.jsonPlaceholder')}
                readonly={readonly}
              />
              {/* <div style={{ textAlign: "right", marginTop: "8px" }}>
                <Button
                  theme="light"
                  icon={<IconEdit />}
                  disabled={readonly}
                  onClick={() => {
                    // 这里可以添加JSON编辑器功能
                    console.log("Edit JSON");
                  }}
                >
                  Edit JSON
                </Button>
              </div> */}
            </FormItem>
          )}
        </Field>
      );

    case "form-data":
    case "x-www-form-urlencoded":
      return (
        <div>
          <Typography.Text strong>{t('nodes.http_request.form.bodyContent.params')}</Typography.Text>
          <ParamsArrayEditor
            arrayName="bodyContent"
            disabled={readonly}
            emptyText={t('nodes.http_request.form.bodyContent.emptyParams')}
          />
        </div>
      );

    case "raw text":
      return (
        <Field<string> name={`${name}.bodyContent`}>
          {({ field: contentField }) => (
            <FormItem name={t('nodes.http_request.form.bodyContent.rawText')} type="string">
              <FxExpression
                value={
                  contentField.value as
                    | FlowLiteralValueSchema
                    | FlowRefValueSchema
                }
                onChange={contentField.onChange}
                readonly={readonly}
                placeholder={t('nodes.http_request.form.bodyContent.rawTextPlaceholder')}
                useTextArea={true}
                rows={6}
              />
            </FormItem>
          )}
        </Field>
      );

    case "binary":
      return (
        <Field<string> name={`${name}.bodyContent`}>
          {({ field: contentField }) => (
            <FormItem name={t('nodes.http_request.form.bodyContent.binary')} type="string">
              <div
                style={{
                  border: "1px dashed #ccc",
                  borderRadius: "4px",
                  padding: "24px",
                  textAlign: "center",
                  cursor: readonly ? "not-allowed" : "pointer",
                }}
              >
                <input
                  type="file"
                  style={{ display: "none" }}
                  id="file-upload"
                  disabled={readonly}
                  onChange={(e) => {
                    // 这里只是示意，实际上需要处理文件上传
                    if (e.target.files && e.target.files[0]) {
                      contentField.onChange(e.target.files[0].name);
                    }
                  }}
                />
                <label
                  htmlFor="file-upload"
                  style={{ cursor: readonly ? "not-allowed" : "pointer" }}
                >
                  <Typography.Title heading={6} style={{ margin: 0 }}>
                    {contentField.value || t('nodes.http_request.form.bodyContent.upload')}
                  </Typography.Title>
                </label>
              </div>
            </FormItem>
          )}
        </Field>
      );

    default:
      return null;
  }
};

// 请求体设置组件
export const BodySettings = () => {
  const { t } = useTranslation();
  const readonly = !useIsSidebar();

  return (
    <React.Fragment>
      <Field<string> name="inputsValues.bodyType">
        {({ field: bodyTypeField }) => (
          <FormItem name={t('nodes.http_request.form.bodyType')} type="string">
            <Select
              value={bodyTypeField.value || "none"}
              onChange={(val: string) => bodyTypeField.onChange(val)}
              disabled={readonly}
              style={{ width: "100%" }}
              optionList={[
                { label: "none", value: "none" },
                { label: "JSON", value: "JSON" },
                { label: "form-data", value: "form-data" },
                {
                  label: "x-www-form-urlencoded",
                  value: "x-www-form-urlencoded",
                },
                { label: "raw text", value: "raw text" },
                { label: "binary", value: "binary" },
              ]}
            />
          </FormItem>
        )}
      </Field>

      <Field<string> name="inputsValues.bodyType">
        {({ field: bodyTypeField }) => (
          <BodyContentEditor
            bodyType={bodyTypeField.value}
            name="inputsValues"
            readonly={readonly}
          />
        )}
      </Field>
    </React.Fragment>
  );
};

// 高级设置组件
export const AdvancedSettings = () => {
  const { t } = useTranslation();
  const readonly = !useIsSidebar();

  return (
    <React.Fragment>
      <Field<number> name="inputsValues.timeout">
        {({ field: timeoutField }) => (
          <FormItem name={t('nodes.http_request.form.advanced.timeout')} type="number">
            <InputNumber
              value={timeoutField.value || 30000}
              onChange={(val: number) => timeoutField.onChange(val)}
              disabled={readonly}
              style={{ width: "100%" }}
              min={0}
            />
          </FormItem>
        )}
      </Field>

      <Field<number> name="inputsValues.maxRetries">
        {({ field: retriesField }) => (
          <FormItem name={t('nodes.http_request.form.advanced.retries')} type="number">
            <InputNumber
              value={retriesField.value || 3}
              onChange={(val: number) => retriesField.onChange(val)}
              disabled={readonly}
              style={{ width: "100%" }}
              min={0}
              max={10}
            />
          </FormItem>
        )}
      </Field>
    </React.Fragment>
  );
};

// HTTP请求输入组件
export const HttpInputs = () => {
  const { t } = useTranslation();
  const form = useForm();

  // 监听表单提交，在提交前转换FX类型的值为纯字符串
  useEffect(() => {
    if (!form) return;

    const originalSubmit = (form as any).submit;

    if (typeof originalSubmit !== "function") return;

    (form as any).submit = function (...args: any[]) {
      console.log("表单提交前处理: 转换FX值为字符串");

      // 获取当前的inputsValues
      const inputsValues = form.getValueIn("inputsValues") || {};
      const newValues = { ...inputsValues };
      let changed = false;

      // 遍历所有值，转换FX类型的对象为字符串
      Object.keys(newValues).forEach((key) => {
        const value = newValues[key];
        if (
          value &&
          typeof value === "object" &&
          (value.type === "fx" || value.type === "expression")
        ) {
          console.log(`转换字段 ${key} 的FX值:`, value, " → ", value.content);
          newValues[key] = value.content || "";
          changed = true;
        }

        // 处理数组中的FX值（例如headers和params）
        if (Array.isArray(value)) {
          const newArray = value.map((item) => {
            if (item && typeof item === "object") {
              const newItem = { ...item };
              if (
                item.value &&
                typeof item.value === "object" &&
                (item.value.type === "fx" || item.value.type === "expression")
              ) {
                newItem.value = item.value.content || "";
                changed = true;
              }
              return newItem;
            }
            return item;
          });

          if (changed) {
            newValues[key] = newArray;
          }
        }
      });

      // 如果有转换，更新inputsValues
      if (changed) {
        form.setValueIn("inputsValues", newValues);
      }

      // 调用原始的submit方法
      return originalSubmit.apply(this, args);
    };

    return () => {
      // 恢复原始的submit方法
      if (form && (form as any).submit !== originalSubmit) {
        (form as any).submit = originalSubmit;
      }
    };
  }, [form]);

  return (
    <Collapse
       expandIconPosition="left"
      defaultActiveKey={["basic", "headers", "params"]}
      keepDOM
    >
      <Collapse.Panel itemKey="basic" header={t('nodes.http_request.form.sections.basic')}>
        <HttpMethodSelector />
        <UrlInput />
      </Collapse.Panel>

      <Collapse.Panel itemKey="headers" header={t('nodes.http_request.form.sections.headers')}>
        <NewHeadersEditor />
      </Collapse.Panel>

      <Collapse.Panel itemKey="params" header={t('nodes.http_request.form.sections.params')}>
        <NewParamsEditor />
      </Collapse.Panel>

      <Collapse.Panel itemKey="auth" header={t('nodes.http_request.form.sections.auth')}>
        <AuthSettings />
      </Collapse.Panel>

      <Collapse.Panel itemKey="body" header={t('nodes.http_request.form.sections.body')}>
        <BodySettings />
      </Collapse.Panel>

      <Collapse.Panel itemKey="advanced" header={t('nodes.http_request.form.sections.advanced')}>
        <AdvancedSettings />
      </Collapse.Panel>
    </Collapse>
  );
};
