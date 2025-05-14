import React from "react";
import { Typography } from "@douyinfe/semi-ui";
import { useTranslation } from 'react-i18next';

import {
  Field,
  FieldRenderProps,
  FormRenderProps,
  FormMeta,
  ValidateTrigger,
} from "@flowgram.ai/free-layout-editor";
import { useIsSidebar } from "../../hooks";
import {
  FormHeader,
  FormContent,
  FormOutputs,
  FormItem,
  Feedback,
} from "../../form-components";
import {
  FlowNodeJSON,
  FlowRefValueSchema,
  FlowLiteralValueSchema,
} from "../../typings";
import { FxExpression } from "../../form-components/fx-expression";

const { Text } = Typography;

// 用于安全显示可能是对象的值
const safeRenderValue = (value: any): string => {
  if (value === null || value === undefined) {
    return "--";
  }

  if (typeof value === "object") {
    // 检查是否是FX表达式对象
    if (value.type === "expression" && value.content) {
      return `${value.content}`;
    }
    // 其他对象类型转为JSON字符串
    return JSON.stringify(value);
  }

  return String(value);
};

// 将收件人字符串按逗号或分号分割成数组
const splitRecipients = (value: any): string[] => {
  const str = safeRenderValue(value);
  if (str === "--") return [];

  // 使用正则表达式按逗号或分号分割
  return str.split(/[,;]+/).filter((item) => item.trim() !== "");
};

export const renderForm = ({ form }: FormRenderProps<FlowNodeJSON>) => {
  const { t } = useTranslation();
  const readonly = !useIsSidebar();

  // 如果是只读模式（即在画布上），则使用简化视图
  if (readonly) {
    return (
      <>
        <FormHeader />
        <div style={{ fontSize: "13px", width: "100%" }}>
          {/* 收件人区域 */}
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #f0f0f0",
              backgroundColor: "#fafbfc",
              borderRadius: "4px 4px 0 0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  marginRight: "6px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                    fill="#86909c"
                  />
                </svg>
              </div>
              <Text strong style={{ color: "#4e5969", fontSize: "14px" }}>
                {t('nodes.email.inputs.email.title')}
              </Text>
            </div>
            <Field name="inputsValues.email">
              {({ field }) => {
                const recipients = splitRecipients(field.value.content);
                const isEmpty = recipients.length === 0;

                return (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      minHeight: "28px",
                    }}
                  >
                    {isEmpty ? (
                      <div
                        style={{
                          padding: "5px 10px",
                          color: "#c0c6cc",
                          fontSize: "13px",
                          fontStyle: "italic",
                          backgroundColor: "#f7f8fa",
                          borderRadius: "4px",
                          border: "1px dashed #e5e6eb",
                        }}
                      >
                        {t('nodes.email.form.noRecipients')}
                      </div>
                    ) : recipients.length > 3 ? (
                      [
                        ...recipients.slice(0, 2).map((recipient, index) => (
                          <div
                            key={index}
                            style={{
                              padding: "5px 12px",
                              borderRadius: "16px",
                              backgroundColor: "#edf3ff",
                              color: "#2253e6",
                              fontSize: "13px",
                              fontWeight: 500,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "flex",
                              alignItems: "center",
                              boxShadow: "0 1px 2px rgba(0,20,100,0.06)",
                            }}
                            title={recipient}
                          >
                            <span
                              style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                backgroundColor: "#2253e6",
                                marginRight: "6px",
                              }}
                            ></span>
                            {recipient}
                          </div>
                        )),
                        <div
                          key="more"
                          style={{
                            padding: "5px 12px",
                            borderRadius: "16px",
                            backgroundColor: "#f5f6f8",
                            color: "#606a78",
                            fontSize: "13px",
                            fontWeight: 500,
                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                          }}
                          title={t('nodes.email.form.moreRecipients', { count: recipients.length - 2 })}
                        >
                          +{recipients.length - 2}
                        </div>,
                      ]
                    ) : (
                      recipients.map((recipient, index) => (
                        <div
                          key={index}
                          style={{
                            padding: "5px 12px",
                            borderRadius: "16px",
                            backgroundColor: "#edf3ff",
                            color: "#2253e6",
                            fontSize: "13px",
                            fontWeight: 500,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "flex",
                            alignItems: "center",
                            boxShadow: "0 1px 2px rgba(0,20,100,0.06)",
                          }}
                          title={recipient}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: "#2253e6",
                              marginRight: "6px",
                            }}
                          ></span>
                          {recipient}
                        </div>
                      ))
                    )}
                  </div>
                );
              }}
            </Field>
          </div>

          {/* 主题显示 */}
          <div
            style={{
              display: "flex",
              padding: "12px 16px",
              alignItems: "flex-start",
              borderBottom: "1px solid #f5f5f5",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                minWidth: "60px",
                color: "#4e5969",
                flexShrink: 0,
                paddingTop: "2px",
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  marginRight: "6px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V8L12 13L20 8V18ZM12 11L4 6H20L12 11Z"
                    fill="#86909c"
                  />
                </svg>
              </div>
              <Text strong>{t('nodes.email.inputs.subject.title')}</Text>
            </div>

            <Field name="inputsValues.subject">
              {({ field }) => {
                const value = safeRenderValue(field.value.content);
                const isEmpty = value === "--" || value.trim() === "";

                return isEmpty ? (
                  <div
                    style={{
                      flex: 1,
                      padding: "6px 12px",
                      backgroundColor: "#f7f8fa",
                      borderRadius: "6px",
                      border: "1px dashed #e5e6eb",
                      color: "#c0c6cc",
                      fontSize: "13px",
                      fontStyle: "italic",
                    }}
                  >
                    {t('nodes.email.form.noSubject')}
                  </div>
                ) : (
                  <div
                    style={{
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      wordBreak: "break-all",
                      backgroundColor: "#eef6ff",
                      color: "#1d54c3",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      whiteSpace: "normal",
                      border: "1px solid #c6d9f7",
                      fontSize: "13px",
                      lineHeight: "1.5",
                      fontWeight: 500,
                    }}
                  >
                    <span>{value}</span>
                  </div>
                );
              }}
            </Field>
          </div>

          {/* 内容显示 */}
          <div
            style={{
              display: "flex",
              padding: "12px 16px",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                minWidth: "60px",
                color: "#4e5969",
                flexShrink: 0,
                paddingTop: "2px",
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  marginRight: "6px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z"
                    fill="#86909c"
                  />
                </svg>
              </div>
              <Text strong>{t('nodes.email.inputs.content.title')}</Text>
            </div>

            <Field name="inputsValues.content">
              {({ field }) => {
                const value = safeRenderValue(field.value.content);
                const isEmpty = value === "--" || value.trim() === "";

                return isEmpty ? (
                  <div
                    style={{
                      flex: 1,
                      padding: "6px 12px",
                      backgroundColor: "#f7f8fa",
                      borderRadius: "6px",
                      border: "1px dashed #e5e6eb",
                      color: "#c0c6cc",
                      fontSize: "13px",
                      fontStyle: "italic",
                    }}
                  >
                    {t('nodes.email.form.noContent')}
                  </div>
                ) : (
                  <div
                    style={{
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      wordBreak: "break-all",
                      backgroundColor: "#eef9f2",
                      color: "#18794e",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      whiteSpace: "normal",
                      border: "1px solid #c6e6d4",
                      fontSize: "13px",
                      lineHeight: "1.5",
                    }}
                  >
                    <span>{value}</span>
                  </div>
                );
              }}
            </Field>
          </div>

          {/* 输出区域 */}
          {/* <div style={{ 
            display: 'flex', 
            padding: '12px 16px',
            alignItems: 'center',
            backgroundColor: '#fbfbfc',
            borderRadius: '0 0 12px 12px',
            borderTop: '1px solid #f5f5f5'
          }}>
            <Text type="secondary" style={{ fontSize: '12px', marginRight: '8px' }}>输出</Text>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ 
                backgroundColor: '#f0f0f0',
                color: '#666',
                padding: '2px 10px',
                borderRadius: '14px',
                fontSize: '12px'
              }}>
                result
              </div>
              <div style={{ 
                backgroundColor: '#f0f0f0',
                color: '#666',
                padding: '2px 10px',
                borderRadius: '14px',
                fontSize: '12px'
              }}>
                success
              </div>
            </div>
          </div> */}
          <FormOutputs />
        </div>
      </>
    );
  }

  // 否则使用原来的编辑表单
  return (
    <>
      <FormHeader />
      <FormContent>
        <div style={{ padding: 12 }}>
          <Field
            name="inputsValues.email"
            render={({
              field: { value, onChange },
              fieldState,
            }: FieldRenderProps<
              FlowLiteralValueSchema | FlowRefValueSchema
            >) => {
              const isEmpty =
                !value ||
                (typeof value === "object" &&
                  value.type === "expression" &&
                  !value.content);

              return (
                <FormItem
                  name={t('nodes.email.inputs.email.title')}
                  type="string"
                  required={true}
                  isColumn={true}
                  labelWidth={70}
                >
                  <FxExpression
                    value={value}
                    onChange={onChange}
                    hasError={Object.keys(fieldState?.errors || {}).length > 0}
                    readonly={readonly}
                    useTextArea={true}
                    rows={4}
                    placeholder={t('nodes.email.inputs.email.description')}
                    form={form}
                    fieldPath="inputsValues.email"
                  />
                  <Feedback
                    errors={fieldState?.errors}
                    invalid={fieldState?.invalid}
                  />
                </FormItem>
              );
            }}
          />

          <Field
            name="inputsValues.subject"
            render={({
              field: { value, onChange },
              fieldState,
            }: FieldRenderProps<
              FlowLiteralValueSchema | FlowRefValueSchema
            >) => {
              const isEmpty =
                !value ||
                (typeof value === "object" &&
                  value.type === "expression" &&
                  !value.content);

              return (
                <FormItem
                  name={t('nodes.email.inputs.subject.title')}
                  type="string"
                  required={true}
                  isColumn={true}
                  labelWidth={60}
                >
                  <FxExpression
                    value={value}
                    onChange={onChange}
                    hasError={Object.keys(fieldState?.errors || {}).length > 0}
                    readonly={readonly}
                    placeholder={t('nodes.email.form.subjectPlaceholder')}
                    form={form}
                    fieldPath="inputsValues.subject"
                  />
                  <Feedback
                    errors={fieldState?.errors}
                    invalid={fieldState?.invalid}
                  />
                </FormItem>
              );
            }}
          />

          <Field
            name="inputsValues.content"
            render={({
              field: { value, onChange },
              fieldState,
            }: FieldRenderProps<
              FlowLiteralValueSchema | FlowRefValueSchema
            >) => {
              const isEmpty =
                !value ||
                (typeof value === "object" &&
                  value.type === "expression" &&
                  !value.content);

              return (
                <FormItem
                  name={t('nodes.email.inputs.content.title')}
                  type="string"
                  required={true}
                  isColumn={true}
                  labelWidth={60}
                >
                  <FxExpression
                    value={value}
                    onChange={onChange}
                    hasError={Object.keys(fieldState?.errors || {}).length > 0}
                    readonly={readonly}
                    useTextArea={true}
                    rows={6}
                    placeholder={t('nodes.email.form.contentPlaceholder')}
                    form={form}
                    fieldPath="inputsValues.content"
                  />
                  <Feedback
                    errors={fieldState?.errors}
                    invalid={fieldState?.invalid}
                  />
                </FormItem>
              );
            }}
          />
        </div>

        <FormOutputs />
      </FormContent>
    </>
  );
};

export const formMeta: FormMeta<FlowNodeJSON> = {
  render: renderForm,
  validateTrigger: ValidateTrigger.onChange,
  validate: {
    title: ({ value }: { value: string }) => (value ? undefined : t('nodes.email.validation.titleRequired')),
    "inputsValues.email": ({ value }) => {
      console.log(value, "email");
      if (typeof value === "string" && value.trim() === "") {
        return t('nodes.email.validation.emailRequired');
      }
      if (
        typeof value === "object" &&
        value.type === "expression" &&
        !value.content
      ) {
        return t('nodes.email.validation.emailRequired');
      }
      return undefined;
    },
    "inputsValues.subject": ({ value }) => {
      if (typeof value === "string" && value.trim() === "") {
        return t('nodes.email.validation.subjectRequired');
      }
      if (
        typeof value === "object" &&
        value.type === "expression" &&
        !value.content
      ) {
        return t('nodes.email.validation.subjectRequired');
      }
      return undefined;
    },
    "inputsValues.content": ({ value }) => {
      if (typeof value === "string" && value.trim() === "") {
        return t('nodes.email.validation.contentRequired');
      }
      if (
        typeof value === "object" &&
        value.type === "expression" &&
        !value.content
      ) {
        return t('nodes.email.validation.contentRequired');
      }
      return undefined;
    },
  },
};
