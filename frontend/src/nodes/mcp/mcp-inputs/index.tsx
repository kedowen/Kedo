import React, { useState, useCallback, useEffect } from "react";
import {
  Button,
  Input,
  Typography,
  Select,
  Collapse,
  Tooltip,
  Space,
  Modal,
  JsonViewer,
  Switch,
  Radio,
} from "@douyinfe/semi-ui";
import {
  IconPlus,
  IconDelete,
  IconHelpCircle,
  IconEdit,
} from "@douyinfe/semi-icons";
import { useTranslation } from "react-i18next";

import {
  Field,
  FormRenderProps,
  useForm,
} from "@flowgram.ai/free-layout-editor";
import {
  FlowNodeJSON,
  FlowLiteralValueSchema,
  FlowRefValueSchema,
} from "../../../typings";
import { TypeSelect } from "../../../form-components";
import { FxExpression } from "../../../form-components/fx-expression";
import { CodeParamItem } from "../../code/code-inputs";
import { useIsSidebar } from "../../../hooks";
import { ParamsArrayEditor } from "@/components";
import { OutputParamsEditor } from "@/components/output-params-editor";
import { FormItem } from "../../../form-components/form-item";
import { Feedback } from "../../../form-components/feedback";

const { Text } = Typography;

// 系统预设的MCP输入参数
const MCP_BUILT_IN_INPUTS = ["mcpServer", "operation", "headers"];
// 系统预设的MCP输出参数
const MCP_BUILT_IN_OUTPUTS = ["outputList", "rowNum"];

// 定义JsonSchema类型
interface JsonSchema {
  type?: string;
  description?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  [key: string]: any;
}

// 操作类型选项
const getOperationTypes = (t: any) => [
  { label: t("nodes.mcp.inputs.operationTypes.sse"), value: "sse" },
  { label: t("nodes.mcp.inputs.operationTypes.streamableHttp"), value: "streamableHttp" },
];

// 安全获取错误消息
const getErrorMessage = (errors: any): string => {
  if (!errors) return "";

  if (typeof errors === "string") return errors;

  if (typeof errors === "object") {
    // 如果是错误对象数组
    if (Array.isArray(errors)) {
      return errors
        .map((err) =>
          typeof err === "string" ? err : err.message || JSON.stringify(err)
        )
        .join(", ");
    }

    // 如果是带message属性的对象
    if (errors.message) return errors.message;

    // 如果是对象，尝试获取第一个错误消息
    const values = Object.values(errors);
    if (values.length > 0) {
      const firstError = values[0];
      if (typeof firstError === "string") return firstError;
      if (typeof firstError === "object" && firstError && firstError.message)
        return firstError.message;
      return String(firstError);
    }

    return JSON.stringify(errors);
  }

  return String(errors);
};

// MCP服务器地址输入组件
const MCPServerInput = ({ form }: { form: any }) => {
  const { t } = useTranslation();
  // 安全提交表单
  const safeSubmitForm = () => {
    try {
      if (form && typeof form.submit === "function") {
        setTimeout(() => form.submit(), 0);
      }
    } catch (error) {
      console.error(t("common.errors.formSubmit"), error);
    }
  };

  return (
    <Field<string> name="inputsValues.mcpServer">
      {({ field, fieldState }) => {
        const hasError = fieldState?.errors
          ? Object.keys(fieldState.errors).length > 0
          : false;

        return (
          <div style={{ marginBottom: "16px" }}>
            <Text strong style={{ display: "block", marginBottom: "8px" }}>
              {t("nodes.mcp.inputs.mcpServer")}
            </Text>
            <div style={{ display: "flex", maxWidth: "100%" }}>
              <Input
                style={{ width: "100%" }}
                placeholder={t("nodes.mcp.validation.mcpServerRequired")}
                value={field.value || ""}
                onChange={(value) => {
                  field.onChange(value);
                  setTimeout(() => safeSubmitForm(), 50);
                }}
                validateStatus={hasError ? "error" : undefined}
              />
            </div>
            {hasError && (
              <Text
                type="danger"
                style={{ fontSize: "12px", marginTop: "4px" }}
              >
                {getErrorMessage(fieldState.errors)}
              </Text>
            )}
          </div>
        );
      }}
    </Field>
  );
};

// 样式定义
const FlexContainer = {
  display: "flex",
  alignItems: "center",
  marginBottom: "12px",
  gap: "8px",
};

const FlexContent = {
  flex: 1,
  minWidth: 0,
};

const ButtonContainer = {
  display: "flex",
  justifyContent: "center",
  marginTop: "16px",
};

// 请求头编辑器组件
export const HeadersEditor = () => {
  const readonly = !useIsSidebar();
  const form = useForm();
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [tempHeaders, setTempHeaders] = useState<any[]>([]);

  // 将请求头数组转换为JSON对象
  const headersToJson = (headers: any[] = []): Record<string, any> => {
    const result: Record<string, any> = {};
    if (Array.isArray(headers)) {
      headers.forEach((header) => {
        if (header && header.key) {
          result[header.key] = header.value;
        }
      });
    }
    return result;
  };

  // 将JSON对象转换为请求头数组
  const jsonToHeaders = (json: Record<string, any> = {}): any[] => {
    return Object.entries(json).map(([key, value]) => ({
      key,
      value: value === undefined ? "" : value,
    }));
  };

  // 打开模态框时，创建请求头的临时副本
  const openHeadersModal = () => {
    const currentHeaders = form?.values?.inputsValues?.headers || [];
    setTempHeaders([...currentHeaders]);
    setModalVisible(true);
  };

  // 关闭模态框并保存更改
  const handleModalOk = () => {
    if (form) {
      form.setValueIn("inputsValues.headers", tempHeaders);
      if (typeof (form as any).submit === "function") {
        setTimeout(() => (form as any).submit(), 0);
      }
    }
    setModalVisible(false);
  };

  // 关闭模态框并放弃更改
  const handleModalCancel = () => {
    setModalVisible(false);
  };

  // 添加新请求头
  const addHeader = () => {
    setTempHeaders([...tempHeaders, { key: "", value: "" }]);
  };

  // 删除请求头
  const deleteHeader = (index: number) => {
    const newHeaders = [...tempHeaders];
    newHeaders.splice(index, 1);
    setTempHeaders(newHeaders);
  };

  // 更新请求头键
  const updateHeaderKey = (index: number, value: string) => {
    const newHeaders = [...tempHeaders];
    newHeaders[index] = { ...newHeaders[index], key: value };
    setTempHeaders(newHeaders);
  };

  // 更新请求头值
  const updateHeaderValue = (index: number, value: any) => {
    const newHeaders = [...tempHeaders];
    newHeaders[index] = { ...newHeaders[index], value };
    setTempHeaders(newHeaders);
  };

  return (
    <Field name="inputsValues.headers">
      {({ field }) => {
        const jsonObj = headersToJson(field.value || []);
        const jsonString = JSON.stringify(jsonObj, null, 2);

        return (
          <div style={{ position: "relative" }}>
            <JsonViewer
              style={{ overflow: "hidden" }}
              height={150}
              defaultExpandedKeys={[]}
              value={jsonString}
              onBlur={(val: string) => {
                try {
                  // 尝试解析JSON
                  const parsed = JSON.parse(val || "{}");
                  // 转换回请求头数组格式
                  const newHeaders = jsonToHeaders(parsed);
                  // 更新字段值
                  field.onChange(newHeaders);

                  // 提交表单
                  if (form) {
                    const formAny = form as any;
                    if (typeof formAny.submit === "function") {
                      setTimeout(() => formAny.submit(), 0);
                    }
                  }
                } catch (e) {
                  console.error(t("common.errors.jsonParseFailed"), e);
                }
              }}
              showSearch={false}
              onChange={undefined}
              disabled={readonly}
            />

            {/* 添加编辑按钮在右上角 */}
            {!readonly && (
              <div
                style={{
                  position: "absolute",
                  top: "5px",
                  right: "5px",
                  zIndex: 100,
                }}
              >
                <Tooltip content={t("nodes.mcp.form.headersTooltip")}>
                  <Button
                    size="small"
                    theme="borderless"
                    type="primary"
                    onClick={openHeadersModal}
                  >
                    <IconEdit />
                  </Button>
                </Tooltip>
              </div>
            )}

            {/* 自定义模态框 */}
            <Modal
              title={t("nodes.mcp.form.editHeaders")}
              visible={modalVisible}
              onOk={handleModalOk}
              onCancel={handleModalCancel}
              centered
              width={800}
            >
              <div
                style={{
                  maxHeight: "400px",
                  overflow: "auto",
                  padding: "12px 0",
                }}
              >
                {tempHeaders.map((header, index) => (
                  <div key={index} style={FlexContainer}>
                    <div style={FlexContent}>
                      <Input
                        value={header.key || ""}
                        onChange={(val) => updateHeaderKey(index, val)}
                        disabled={readonly}
                        placeholder={t("nodes.mcp.form.headerName")}
                        style={{ marginBottom: "8px" }}
                      />
                    </div>
                    <div style={FlexContent}>
                      <FxExpression
                        value={header.value}
                        onChange={(val) => updateHeaderValue(index, val)}
                        readonly={readonly}
                        placeholder={t("nodes.mcp.form.headerValue")}
                        clearBeforeFxSelect={true}
                      />
                    </div>
                    {!readonly && tempHeaders.length > 1 && (
                      <Button
                        theme="borderless"
                        icon={<IconDelete />}
                        onClick={() => deleteHeader(index)}
                        style={{ color: "#ff4d4f" }}
                      />
                    )}
                  </div>
                ))}
                {!readonly && (
                  <div style={ButtonContainer}>
                    <Button
                      theme="light"
                      onClick={addHeader}
                      icon={<IconPlus />}
                    >
                      {t("nodes.mcp.form.addHeader")}
                    </Button>
                  </div>
                )}
              </div>
            </Modal>
          </div>
        );
      }}
    </Field>
  );
};

// 自定义鉴权组件
export const CustomAuthEditor = () => {
  const readonly = !useIsSidebar();
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <Field<string> name="inputsValues.authKey">
        {({ field: keyField }) => (
          <FormItem name={t("nodes.mcp.inputs.authKey")} type="string" labelWidth={160}>
            <Input
              value={keyField.value || ""}
              onChange={(val: any) => keyField.onChange(val)}
              disabled={readonly}
              placeholder={t("nodes.mcp.form.enterAuthKey")}
            />
            <Typography.Text type="tertiary" style={{ fontSize: "12px" }}>
              {t("nodes.mcp.form.valueRequired")}
            </Typography.Text>
          </FormItem>
        )}
      </Field>

      <Field<
        FlowLiteralValueSchema | FlowRefValueSchema
      > name="inputsValues.tokenValue">
        {({ field: valueField, fieldState }) => (
          <FormItem name={t("nodes.mcp.inputs.tokenValue")} type="string" labelWidth={160}>
            <FxExpression
              value={valueField.value}
              onChange={(value) => {
                console.log("Custom Auth Value onChange:", value);
                // 正确处理表达式类型值
                valueField.onChange(value);
              }}
              readonly={readonly}
              hasError={Object.keys(fieldState?.errors || {}).length > 0}
              placeholder={t("nodes.mcp.form.enterOrReferenceValue")}
            />
            <Typography.Text type="tertiary" style={{ fontSize: "12px" }}>
              {t("nodes.mcp.form.valueRequired")}
            </Typography.Text>
          </FormItem>
        )}
      </Field>

      <Field<string> name="inputsValues.authAddTo">
        {({ field: addToField }) => (
          <FormItem name={t("nodes.mcp.inputs.authAddTo")} type="string" labelWidth={160}>
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
          </FormItem>
        )}
      </Field>
    </React.Fragment>
  );
};

// 鉴权设置组件
export const AuthSettings = () => {
  const readonly = !useIsSidebar();
  const form = useForm();
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <Field<boolean> name="inputsValues.enableAuth">
        {({ field: enableAuthField }) => (
          <FormItem name={t("nodes.mcp.inputs.enableAuth")} type="boolean" labelWidth={160}>
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
                  <FormItem name={t("nodes.mcp.inputs.authType")} type="string" labelWidth={160}>
                    <Radio.Group
                      value={authTypeField.value || "Bearer Token"}
                      onChange={(e) => {
                        console.log("切换鉴权类型:", e.target.value);
                        authTypeField.onChange(e.target.value);
                        // 不再需要在切换类型时互相赋值
                      }}
                      disabled={readonly}
                    >
                      <Radio value="Bearer Token">Bearer Token</Radio>
                      <Radio value="自定义">{t("nodes.mcp.inputs.authTypes.custom")}</Radio>
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
                        <FormItem name={t("nodes.mcp.inputs.authValue")} type="string" labelWidth={160}>
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
                            placeholder={t("nodes.mcp.form.enterAuthToken")}
                            fieldPath="inputsValues.authValue"
                            form={form}
                            clearBeforeFxSelect={false}
                          />
                          <Feedback errors={fieldState?.errors} />
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

// MCP输入组件
export const MCPInputs = ({ form }: FormRenderProps<FlowNodeJSON>) => {
  const { t } = useTranslation();
  const [activeKeys, setActiveKeys] = useState([
    t("nodes.mcp.form.basicSettings"),
    t("nodes.mcp.inputs.headers"),
    t("nodes.mcp.simplifiedView.auth"),
    t("nodes.mcp.form.outputParams"),
  ]);

  // 安全提交表单
  const safeSubmitForm = () => {
    try {
      if (form && typeof (form as any).submit === "function") {
        setTimeout(() => (form as any).submit(), 0);
      }
    } catch (error) {
      console.error(t("common.errors.formSubmit"), error);
    }
  };

  // 数据迁移：处理旧版本的customParams，将其转换为headers
  useEffect(() => {
    try {
      if (!form) return;

      // 检查是否存在旧的customParams数据
      const customParams = form.getValueIn("inputsValues.customParams");
      const headers = form.getValueIn("inputsValues.headers");

      // 如果存在customParams但没有headers，或headers为空数组
      if (
        customParams &&
        Array.isArray(customParams) &&
        customParams.length > 0 &&
        (!headers || (Array.isArray(headers) && headers.length === 0))
      ) {
        console.log(
          t("nodes.mcp.form.dataMigrationStart"),
          customParams
        );

        // 将customParams数据复制到headers
        form.setValueIn("inputsValues.headers", [...customParams]);

        // 清空并删除customParams
        form.setValueIn("inputsValues.customParams", []);

        // 确保inputs中包含headers属性
        const inputs = form.getValueIn("inputs") || {};
        if (!inputs.properties?.headers) {
          const updatedInputs = {
            ...inputs,
            properties: {
              ...(inputs.properties || {}),
              headers: {
                type: "object",
                title: t("nodes.mcp.inputs.headers"),
                description: t("nodes.mcp.form.headersDescription"),
                additionalProperties: {
                  type: "string",
                },
              },
            },
          };
          form.setValueIn("inputs", updatedInputs);
        }

        // 提交表单保存更改
        safeSubmitForm();
        console.log(t("nodes.mcp.form.dataMigrationComplete"));
      }
    } catch (error) {
      console.error(t("nodes.mcp.form.dataMigrationFailed"), error);
    }
  }, [form, t]);

  return (
    <div>
      <Collapse
        expandIconPosition="left"
        defaultActiveKey={activeKeys}
        onChange={setActiveKeys}
        keepDOM
      >
        {/* 基本设置部分 */}
        <Collapse.Panel
          header={<Typography.Text strong>{t("nodes.mcp.form.basicSettings")}</Typography.Text>}
          itemKey={t("nodes.mcp.form.basicSettings")}
        >
          {/* 使用新组件替换原来的MCP服务器地址输入 */}
          <MCPServerInput form={form} />

          {/* 操作类型选择 */}
          <Field<string> name="inputsValues.operation">
            {({ field }) => (
              <div style={{ marginBottom: "16px" }}>
                <Text strong style={{ display: "block", marginBottom: "8px" }}>
                  {t("nodes.mcp.inputs.operation")}
                </Text>
                <Select
                  value={field.value || "sse"}
                  onChange={(value) => field.onChange(value)}
                  style={{ width: "100%" }}
                  optionList={getOperationTypes(t)}
                />
              </div>
            )}
          </Field>
        </Collapse.Panel>

        {/* 请求头部分 */}
        <Collapse.Panel
          header={
            <div
              style={{
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                fontWeight: "bold",
              }}
            >
              <span>{t("nodes.mcp.inputs.headers")}</span>
              <Tooltip content={t("nodes.mcp.form.headersTooltip")} position="right">
                <IconHelpCircle
                  style={{ marginLeft: 4, color: "#888", cursor: "help" }}
                />
              </Tooltip>
            </div>
          }
          itemKey={t("nodes.mcp.inputs.headers")}
        >
          {/* 使用请求头编辑器 */}
          <ParamsArrayEditor 
            arrayName="customParams" 
            disabled={false} 
            emptyText={t("nodes.mcp.form.noCustomParams")}
          />
        </Collapse.Panel>

        {/* 鉴权部分 */}
        <Collapse.Panel
          header={
            <div
              style={{
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                fontWeight: "bold",
              }}
            >
              <span>{t("nodes.mcp.simplifiedView.auth")}</span>
              <Tooltip content={t("nodes.mcp.form.authTooltip")} position="right">
                <IconHelpCircle
                  style={{ marginLeft: 4, color: "#888", cursor: "help" }}
                />
              </Tooltip>
            </div>
          }
          itemKey={t("nodes.mcp.simplifiedView.auth")}
        >
          <AuthSettings />
        </Collapse.Panel>

        {/* 输出参数部分 */}
        <Collapse.Panel
          header={
            <div
              style={{
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                fontWeight: "bold",
              }}
            >
              <span>{t("nodes.mcp.form.outputParams")}</span>
              <Tooltip
                content={t("components.outputParamsEditor.tooltip")}
                position="right"
              >
                <IconHelpCircle
                  style={{ marginLeft: 4, color: "#888", cursor: "help" }}
                />
              </Tooltip>
            </div>
          }
          itemKey={t("nodes.mcp.form.outputParams")}
        >
          <div style={{ padding: "8px 0" }}>
            {/* 使用通用的OutputParamsEditor组件 */}
            <Field name="outputs">
              {({ field }) => <OutputParamsEditor paramPath="outputs" />}
            </Field>
          </div>
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};
