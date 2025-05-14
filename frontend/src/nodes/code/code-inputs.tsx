import React, { useState, useCallback, useEffect, useRef } from "react";
import { Field, useForm } from "@flowgram.ai/free-layout-editor";
import {
  Button,
  Collapse,
  Input,
  Space,
  Typography,
  Select,
  Modal,
  Switch,
} from "@douyinfe/semi-ui";
import {
  IconPlus,
  IconMinus,
  IconEdit,
  IconDelete,
} from "@douyinfe/semi-icons";
import { FlowNodeJSON } from "../../typings";
import Editor from "@monaco-editor/react";
import { TypeSelect } from "../../form-components/type-select";
import { TypeDefault } from "../../form-components/type-default";
import { FxExpression, FxIcon } from "../../form-components/fx-expression";
import { VariableSelector } from "../../plugins/sync-variable-plugin/variable-selector";
import { BasicType } from "../../typings/json-schema";
import { ParamsArrayEditor, OutputParamsEditor } from '@/components';
import {
  FlowLiteralValueSchema,
  FlowRefValueSchema,
  JsonSchemaType,
  basicTypes,
} from "../../typings";
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';

// 定义缺少的类型
interface JsonSchema {
  type?: string;
  description?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema; // For array type
  [key: string]: any;
}

// 代码编辑器的编程语言选项
const languageOptions = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "csharp", label: "C#" },
  { value: "bat", label: "DOS" },
  { value: "vb", label: "VBS" },
  { value: "powershell", label: "PowerShell" },
];

// 样式定义
const ParamContainer = {
  padding: "12px",
  border: "1px solid #e0e0e0",
  borderRadius: "4px",
  marginBottom: "16px",
  background: "#fafafa",
  width: "100%",
};

const NestedParamContainer = {
  ...ParamContainer,
  marginLeft: "20px",
  borderLeft: "2px solid #d9d9d9",
  paddingLeft: "10px",
  background: "#fdfdfd",
};

const LabelStyle = {
  fontSize: "12px",
  color: "#666",
  marginBottom: "4px",
  display: "block",
};

const RowStyle = {
  display: "flex",
  alignItems: "flex-start",
  marginBottom: "12px",
  gap: "12px",
};

const ButtonContainerStyle = {
  display: "flex",
  justifyContent: "flex-end",
  marginTop: "16px",
  marginBottom: "24px",
};

const { Text } = Typography;

// 递归输出参数项组件
interface OutputParamItemProps {
  paramKey: string;
  paramDef: JsonSchema;
  path: string; // e.g., "outputs.properties.key1" or "outputs.properties.objKey.properties.childKey"
  onChange: (path: string, value: JsonSchema) => void;
  onDelete: (path: string, key: string) => void;
  onAddChild: (path: string) => void;
  onRenameKey?: (path: string, oldKey: string, newKey: string) => void;
  level?: number; // For indentation
}

const OutputParamItem: React.FC<OutputParamItemProps> = ({
  paramKey,
  paramDef,
  path,
  onChange,
  onDelete,
  onAddChild,
  onRenameKey,
  level = 0,
}) => {
  const { t } = useTranslation();
  const isObjectType = paramDef.type === "object";
  const currentPath = `${path}.properties.${paramKey}`;
  const typePath = `${currentPath}.type`;
  const [editingKey, setEditingKey] = useState(paramKey);

  // 处理参数名称变更
  const handleKeyChange = (value: string) => {
    setEditingKey(value);
  };

  // 处理名称变更提交
  const handleKeyBlur = () => {
    if (editingKey !== paramKey && editingKey.trim() && onRenameKey) {
      onRenameKey(path, paramKey, editingKey.trim());
    } else {
      setEditingKey(paramKey);
    }
  };

  // 处理类型变更
  const handleTypeChange = (newType: string) => {
    const newDef: JsonSchema = {
      ...paramDef,
      type: newType as JsonSchema["type"],
    };
    if (newType === "object" && !newDef.properties) {
      newDef.properties = {}; // Initialize properties for object type
    } else if (newType !== "object") {
      delete newDef.properties; // Remove properties if not object
    }
    onChange(currentPath, newDef);
  };

  // 处理删除
  const handleDelete = () => {
    onDelete(path, paramKey); // Pass parent path and key to delete
  };

  // 添加子项
  const handleAddSubItem = () => {
    onAddChild(currentPath); // Pass current item's path to add child
  };

  return (
    <div
      style={{
        ...ParamContainer,
        ...(level > 0
          ? {
              marginLeft: "20px",
              borderLeft: "2px solid #4a80ff30",
              paddingLeft: "12px",
              background: "#f9fbff",
            }
          : {}),
        transition: "all 0.2s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "4px",
          gap: "8px",
        }}
      >
        {/* Key Input */}
        <Input
          value={editingKey}
          onChange={handleKeyChange}
          onBlur={handleKeyBlur}
          onEnterPress={handleKeyBlur}
          style={{
            width: "40%",
            borderColor: isObjectType ? "#4a80ff40" : "#e0e0e0",
          }}
          placeholder={t('nodes.code.params.paramName')}
          size="small"
        />

        {/* Type Select */}
        <div style={{ flex: 1 }}>
          <Field name={typePath}>
            {({ field }) => (
              <TypeSelect
                value={(field.value as string) || "string"}
                onChange={(val: string) => handleTypeChange(val)}
                style={{ width: "100%" }}
              />
            )}
          </Field>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "4px" }}>
          {isObjectType && (
            <Button
              icon={<IconPlus />}
              theme="light"
              type="primary"
              size="small"
              onClick={handleAddSubItem}
              title={t('nodes.code.params.addSubParam')}
              style={{ padding: "4px 8px" }}
            />
          )}
          <Button
            icon={<IconMinus />}
            type="danger"
            theme="borderless"
            size="small"
            onClick={handleDelete}
            style={{ padding: "4px 8px" }}
          />
        </div>
      </div>

      {/* Render Child Properties if Object Type */}
      {isObjectType &&
        paramDef.properties &&
        Object.keys(paramDef.properties).length > 0 && (
          <div
            style={{
              marginLeft: "12px",
              marginTop: "8px",
              paddingLeft: "8px",
              borderLeft: "1px dashed #4a80ff30",
            }}
          >
            {Object.entries(paramDef.properties).map(([childKey, childDef]) => (
              <OutputParamItem
                key={childKey}
                paramKey={childKey}
                paramDef={childDef}
                path={currentPath} // Parent's path becomes the base for children
                onChange={onChange}
                onDelete={onDelete}
                onAddChild={onAddChild}
                onRenameKey={onRenameKey}
                level={level + 1}
              />
            ))}
          </div>
        )}
    </div>
  );
};

// 单个输入参数编辑器组件 (CodeParamItem)
interface CodeParamItemProps {
  paramKey: string;
  paramDef: JsonSchema;
  onChange: (key: string, value: JsonSchema, newKey?: string) => void;
  onDelete: (key: string) => void;
  disabled?: boolean;
  form: any;
}

const CodeParamItem: React.FC<CodeParamItemProps> = ({
  paramKey,
  paramDef,
  onChange,
  onDelete,
  disabled,
  form,
}) => {
  const { t } = useTranslation();
  const [editingName, setEditingName] = useState(paramKey);

  // 直接从 paramDef 判断是否为表达式模式
  const isExpressionMode = paramDef.type === "expression";

  // 当参数名称变化时更新编辑状态
  useEffect(() => {
    setEditingName(paramKey);
  }, [paramKey]);

  // 处理名称变更
  const handleNameChange = (value: string) => {
    setEditingName(value);
  };

  // 处理名称变更提交
  const handleNameBlur = () => {
    if (editingName !== paramKey && editingName.trim()) {
      onChange(paramKey, paramDef, editingName.trim());
    } else {
      setEditingName(paramKey); // Reset if name hasn't changed or is empty
    }
  };

  // 处理类型变更
  const handleTypeChange = (type: string) => {
    // 更新参数定义中的类型
    onChange(paramKey, {
      ...paramDef,
      type: type as JsonSchema["type"],
    });

    // 清空当前值并设置适当的初始值
    if (form && form.values && form.values.inputsValues) {
      let initialValue: any = "";
      switch (type) {
        case "object":
          initialValue = {};
          break;
        case "array":
          initialValue = [];
          break;
        case "number":
        case "integer":
          initialValue = 0;
          break;
        case "boolean":
          initialValue = false;
          break;
        case "string":
        default:
          initialValue = "";
          break;
      }
      form.setValueIn(`inputsValues.${paramKey}`, initialValue);

      // Trigger form submission to ensure state update
      const formAny = form as any;
      if (typeof formAny.submit === "function") {
        setTimeout(() => {
          formAny.submit();
        }, 0);
      }
    }
  };

  // 切换到表达式模式
  const switchToExpressionMode = () => {
    if (form?.values?.inputs?.properties) {
      const originalType = paramDef.type;
      const originalDesc = paramDef.description || `自定义参数: ${paramKey}`;

      // 1. Update inputs.properties type to 'expression'
      onChange(paramKey, {
        ...paramDef,
        type: "expression" as any,
        _originalType: originalType,
        _originalDesc: originalDesc,
      });

      // 2. Convert current value to string for expression content
      const currentValue = form.values.inputsValues[paramKey];
      const stringValue =
        currentValue !== undefined ? String(currentValue) : "";

      // 3. Set inputsValues to the string value
      form.setValueIn(`inputsValues.${paramKey}`, stringValue);

      // 4. Submit form
      const formAny = form as any;
      if (typeof formAny.submit === "function") {
        setTimeout(() => {
          formAny.submit();
        }, 0);
      }
    }
  };

  // 切换回普通模式
  const switchToNormalMode = () => {
    if (form?.values?.inputs?.properties) {
      const originalType =
        (paramDef._originalType as JsonSchema["type"]) || "string";
      const originalDesc = paramDef._originalDesc || `自定义参数: ${paramKey}`;

      // 1. Restore original type in inputs.properties
      onChange(paramKey, {
        ...paramDef,
        type: originalType,
        description: originalDesc,
        _originalType: undefined,
        _originalDesc: undefined,
      });

      // 2. Get current expression string value
      const contentValue = form.values.inputsValues[paramKey] || "";

      // 3. Convert back to original type
      let typedValue: any = contentValue;
      switch (originalType) {
        case "object":
          try {
            typedValue = JSON.parse(contentValue || "{}");
          } catch {
            typedValue = {};
          }
          break;
        case "array":
          try {
            typedValue = JSON.parse(contentValue || "[]");
          } catch {
            typedValue = [];
          }
          break;
        case "number":
        case "integer":
          typedValue = parseFloat(contentValue) || 0;
          break;
        case "boolean":
          typedValue = contentValue === "true";
          break;
        case "string":
        default:
          typedValue = contentValue;
          break;
      }

      // 4. Set inputsValues back to the typed value
      form.setValueIn(`inputsValues.${paramKey}`, typedValue);

      // 5. Submit form
      const formAny = form as any;
      if (typeof formAny.submit === "function") {
        setTimeout(() => {
          formAny.submit();
        }, 0);
      }
    }
  };

  return (
    <div style={ParamContainer}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px',
        alignItems: 'flex-end'
      }}>
        {/* Parameter Name Input */}
        <div style={{ flex: '1 1 220px', minWidth: '180px', maxWidth: '300px' }}>
          <Text style={LabelStyle}>{t('nodes.code.params.paramName')}</Text>
          <Input
            value={editingName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onEnterPress={handleNameBlur}
            disabled={disabled}
            placeholder={t('nodes.code.params.enterParamName')}
            style={{ width: "100%" }}
          />
        </div>

        {/* Parameter Type Select (Hidden in Expression Mode) */}
        {!isExpressionMode && (
          <div style={{ flex: '1 1 180px', minWidth: '140px', maxWidth: '240px' }}>
            <Text style={LabelStyle}>{t('nodes.code.params.paramType')}</Text>
            <TypeSelect
              value={paramDef.type as any}
              onChange={handleTypeChange as any}
              disabled={disabled}
              style={{ width: "100%" }}
            />
          </div>
        )}

        {/* Action Buttons (Delete, Fx Toggle) */}
        <div style={{ 
          display: 'flex',
          alignItems: 'flex-end',
          marginLeft: 'auto',
          paddingBottom: '4px'
        }}>
          {!disabled && (
            <>
              <Button
                type="danger"
                theme="borderless"
                icon={<IconDelete />}
                onClick={() => onDelete(paramKey)}
                style={{ marginRight: '8px' }}
              />
              <Button
                theme="borderless"
                icon={<FxIcon />}
                onClick={() => {
                  if (isExpressionMode) {
                    switchToNormalMode();
                  } else {
                    switchToExpressionMode();
                  }
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* Parameter Value Input */}
      <div>
        <Text style={LabelStyle}>{t('nodes.code.params.paramValue')}</Text>
        <Field
          name={`inputsValues.${paramKey}`}
          render={({ field }) => {
            // Show VariableSelector in Expression Mode
            if (isExpressionMode) {
              return (
                <VariableSelector
                  value={field.value as string}
                  onChange={(val) => {
                    field.onChange(val);
                  }}
                  style={{ width: "100%" }}
                  readonly={disabled}
                />
              );
            }

            // Show TypeDefault in Normal Mode
            return (
              <TypeDefault
                type={paramDef.type as any}
                value={{
                  type: paramDef.type as any,
                  default: field.value,
                }}
                disabled={disabled}
                onChange={(updatedValue: any) => {
                  if (updatedValue && "default" in updatedValue) {
                    field.onChange(updatedValue.default);
                  }
                }}
              />
            );
          }}
        />
      </div>
    </div>
  );
};

// 参数编辑器组件属性接口 (CodeParamsEditorProps)
interface CodeParamsEditorProps {
  properties: Record<string, JsonSchema>;
  onChange: (properties: Record<string, JsonSchema>) => void;
  onDelete: (key: string) => void;
  disabled?: boolean;
  form: any;
}

// 代码参数编辑器组件 (CodeParamsEditor)
const CodeParamsEditor: React.FC<CodeParamsEditorProps> = ({
  properties,
  onChange,
  onDelete,
  disabled,
  form,
}) => {
  const { t } = useTranslation();
  
  // 处理参数变更
  const handleParamChange = useCallback(
    (key: string, value: JsonSchema, newKey?: string) => {
      console.log(`[参数变更] 开始处理, key=${key}, newKey=${newKey || "无"}`);

      if (newKey && newKey !== key) {
        // 先检查新键是否已存在
        if (properties[newKey]) {
          console.warn(`[参数变更] 参数名 ${newKey} 已存在，无法重命名`);
          return;
        }

        console.log(`[参数变更] 创建新属性对象，保持键顺序`);
        // 创建一个新对象，使用Object.entries和reduce确保保持精确的键顺序
        const updatedProps = Object.entries(properties).reduce(
          (acc, [propKey, propValue]) => {
            if (propKey === key) {
              // 使用新键替换旧键，但保持在完全相同的位置
              console.log(`[参数变更] 替换键 ${propKey} -> ${newKey}`);
              acc[newKey] = value;
            } else {
              // 保持其他键不变
              acc[propKey] = propValue;
            }
            return acc;
          },
          {} as Record<string, JsonSchema>
        );

        // 处理表单值的重命名 - 使用同步方式
        if (form && form.values && form.values.inputsValues) {
          console.log(`[参数变更] 处理表单值重命名 ${key} -> ${newKey}`);
          // 创建一个新的表单值对象，同样使用reduce保持顺序
          const newInputsValues = Object.entries(
            form.values.inputsValues
          ).reduce((acc, [inputKey, inputValue]) => {
            if (inputKey === key) {
              // 将旧值复制到新键，保持顺序
              console.log(`[参数变更] 复制值 ${inputKey} -> ${newKey}`);
              acc[newKey] = inputValue;
            } else {
              // 保持其他键不变
              acc[inputKey] = inputValue;
            }
            return acc;
          }, {} as Record<string, any>);

          // 一次性更新表单值
          console.log(`[参数变更] 更新表单值`, newInputsValues);
          form.setValueIn("inputsValues", newInputsValues);
        }

        // 直接传递更新后的对象
        console.log(`[参数变更] 调用onChange更新属性`, updatedProps);
        onChange(updatedProps);

        // 提交表单以确保变更同步到节点
        console.log(`[参数变更] 准备提交表单`);
        setTimeout(() => {
          if (form && typeof form.submit === "function") {
            console.log(`[参数变更] 执行表单提交`);
            form.submit();
          } else {
            console.warn(`[参数变更] 表单没有submit方法`);
          }
        }, 10);
      } else {
        // 如果只是更新值而不重命名
        console.log(`[参数变更] 只更新值，不重命名`);
        const updatedProps = { ...properties, [key]: value };
        onChange(updatedProps);

        // 提交表单以确保变更同步
        console.log(`[参数变更] 准备提交表单`);
        setTimeout(() => {
          if (form && typeof form.submit === "function") {
            console.log(`[参数变更] 执行表单提交`);
            form.submit();
          } else {
            console.warn(`[参数变更] 表单没有submit方法`);
          }
        }, 10);
      }
    },
    [properties, onChange, form]
  );

  // 处理参数删除
  const handleParamDelete = useCallback(
    (key: string) => {
      console.log(`[参数删除] 删除参数 ${key}`);
      onDelete(key);
    },
    [onDelete]
  );

  // 获取参数键列表
  const paramKeys = Object.keys(properties);

  // 判断是否有参数
  const hasParams = paramKeys.length > 0;

  return (
    <div className="code-params-container" style={{ width: "100%" }}>
      {hasParams ? (
        paramKeys.map((key) => (
          <CodeParamItem
            key={key}
            paramKey={key}
            paramDef={properties[key]}
            onChange={handleParamChange}
            onDelete={handleParamDelete}
            disabled={disabled}
            form={form}
          />
        ))
      ) : (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            border: "1px dashed #ccc",
            borderRadius: "4px",
            marginBottom: "16px",
            width: "100%",
          }}
        >
          <Text type="tertiary">{t('nodes.code.form.noCustomParams')}</Text>
        </div>
      )}
    </div>
  );
};

// 系统预设参数列表
const BUILT_IN_PARAMS = ["codeContent", "language", "ignoreErrors", "input"];

// 辅助函数：验证并确保返回有效的BasicType
const ensureValidBasicType = (type: any): BasicType => {
  // 检查是否是有效的BasicType
  if (type && basicTypes.includes(type as any)) {
    return type as BasicType;
  }
  // 默认返回string类型
  return "string";
};

// 代码编辑器模态框组件
const CodeEditorModal = ({
  visible,
  onCancel,
  onOk,
  codeContent,
  setCodeContent,
  language,
}: {
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
  codeContent: string;
  setCodeContent: (content: string) => void;
  language: string;
}) => {
  const { t } = useTranslation();
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 重置状态
  useEffect(() => {
    if (visible) {
      // 模态框显示时，尝试加载编辑器
      setLoading(true);
      // 延迟一点时间再加载编辑器
      const timer = setTimeout(() => {
        setEditorLoaded(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      // 模态框隐藏时，重置状态
      setEditorLoaded(false);
      setLoading(false);
      setRetryCount(0);
    }
  }, [visible]);

  // 处理编辑器加载完成事件
  const handleEditorDidMount = (editor: any) => {
    console.log("编辑器加载完成");
    setLoading(false);
    editorRef.current = editor;

    // 滚动到顶部并确保显示第一行
    setTimeout(() => {
      if (editorRef.current) {
        // 聚焦编辑器
        editorRef.current.focus();

        // 滚动到顶部
        editorRef.current.setScrollPosition({ scrollTop: 0 });

        // 确保显示第一行 (使用编辑器内部方法)
        editorRef.current.revealLine(1);

        console.log("编辑器已滚动到顶部");
      }
    }, 100);
  };

  // 处理编辑器加载失败事件
  const handleEditorWillMount = () => {
    console.log("编辑器即将加载");
  };

  // 如果加载失败，提供重试按钮
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    setEditorLoaded(false);
    setTimeout(() => {
      setEditorLoaded(true);
    }, 300);
  };

  // 获取语言显示名称
  const getLanguageDisplayName = () => {
    const langOption = languageOptions.find(
      (option) => option.value === language
    );
    return langOption ? langOption.label : t('nodes.code.editor.unknownLanguage');
  };

  return (
    <Modal
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <Text strong style={{ marginRight: "10px" }}>
              {t('nodes.code.editor.title')}
            </Text>
            <Text type="secondary">({getLanguageDisplayName()})</Text>
          </div>
        </div>
      }
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      width={1200}
      height={800}
      style={{ top: 10 }}
      bodyStyle={{ padding: "12px" }}
      centered
      maskClosable={false}
      closeOnEsc
      keepDOM
      fullScreen
    >
      <div
        ref={containerRef}
        style={{
          height: "calc(90vh - 120px)",
          position: "relative",
          border: "1px solid #e8e8e8",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        {loading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#f9f9f9",
              zIndex: 1,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <Text>{t('nodes.code.editor.loading')}</Text>
              {retryCount > 0 && (
                <div style={{ marginTop: "10px" }}>{t('nodes.code.editor.retryCount')}: {retryCount}</div>
              )}
            </div>
          </div>
        )}

        {editorLoaded && (
          <div style={{ height: "100%", width: "100%", overflow: "hidden" }}>
            <Editor
              height="100%"
              width="100%"
              language={language || "javascript"}
              value={codeContent}
              onChange={(value) => setCodeContent(value || "")}
              onMount={handleEditorDidMount}
              beforeMount={handleEditorWillMount}
              options={{
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                minimap: { enabled: true },
                scrollbar: {
                  vertical: "visible",
                  horizontal: "visible",
                  verticalScrollbarSize: 12,
                  horizontalScrollbarSize: 12,
                },
                wordWrap: "on",
              }}
              key={`editor-${retryCount}`} // 强制重新创建编辑器组件
            />
          </div>
        )}

        {!loading && !editorRef.current && retryCount < 5 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#f9f9f9",
              zIndex: 1,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <Text type="danger">{t('nodes.code.editor.loadFailed')}</Text>
              <div style={{ marginTop: "10px" }}>
                <Button onClick={handleRetry} type="primary">
                  {t('nodes.code.editor.retryLoading')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

// 语言执行按钮渲染组件
const LanguageExecutionButton = ({ language }: { language: string }) => {
  const { t } = useTranslation();
  
  // 根据语言返回对应的执行按钮标签
  const getExecutionLabel = () => {
    switch (language) {
      case "javascript":
        return t('nodes.code.execution.executeJS');
      case "python":
        return t('nodes.code.execution.executePY');
      case "csharp":
        return t('nodes.code.execution.executeCS');
      case "bat":
        return t('nodes.code.execution.executeDOS');
      case "vb":
        return t('nodes.code.execution.executeVBS');
      case "powershell":
        return t('nodes.code.execution.executePS');
      default:
        return t('nodes.code.execution.execute');
    }
  };

  // 执行代码的函数
  const executeCode = () => {
    console.log(`执行${getExecutionLabel()}代码`);
    // 这里只是一个模拟，实际执行需要在后端实现
    alert(
      t('nodes.code.execution.executionMessage', { language: getExecutionLabel() })
    );
  };

  return (
    <Button
      type="primary"
      theme="solid"
      onClick={executeCode}
      style={{
        marginRight: "8px",
        backgroundColor:
          language === "javascript"
            ? "#f0db4f"
            : language === "python"
            ? "#306998"
            : language === "csharp"
            ? "#178600"
            : language === "bat"
            ? "#4d4d4d"
            : language === "vb"
            ? "#945db7"
            : language === "powershell"
            ? "#012456"
            : "#1890ff",
        color: language === "javascript" ? "#323330" : "#ffffff",
      }}
    >
      {getExecutionLabel()}
    </Button>
  );
};

// 主要代码输入组件
export const CodeInputs = () => {
  const { t } = useTranslation();
  const form = useForm();
  const [activeKeys, setActiveKeys] = useState([
    t('nodes.code.form.inputParams'),
    t('nodes.code.form.codeConfig'),
    t('nodes.code.form.outputParams'),
  ]);
  const [editorModalVisible, setEditorModalVisible] = useState(false);
  const [currentCodeContent, setCurrentCodeContent] = useState("");

  // -- 输出参数处理 --
  const handleOutputChange = useCallback(
    (path: string, value: JsonSchema) => {
      form.setValueIn(path, value);
    },
    [form]
  );

  const handleDeleteOutput = useCallback(
    (path: string, key: string) => {
      // Construct the path to the parent's properties object
      const parentPropertiesPath = `${path}.properties`;
      const parentProps = form.getValueIn(parentPropertiesPath) as
        | Record<string, JsonSchema>
        | undefined;

      if (parentProps) {
        const newProps = { ...parentProps };
        delete newProps[key];
        form.setValueIn(parentPropertiesPath, newProps);
      } else {
        console.warn(
          "Could not find parent properties to delete from:",
          parentPropertiesPath
        );
      }
    },
    [form]
  );

  const handleRenameKey = useCallback(
    (path: string, oldKey: string, newKey: string) => {
      // 处理键名重命名
      const propertiesPath = `${path}.properties`;
      const currentProps = form.getValueIn(propertiesPath) as
        | Record<string, JsonSchema>
        | undefined;

      if (!currentProps) {
        console.warn(
          "Could not find properties to rename key in:",
          propertiesPath
        );
        return;
      }

      // 检查新键名是否已存在
      if (currentProps[newKey]) {
        console.warn(t('nodes.code.params.keyExists'));
        return;
      }

      // 创建一个新对象，使用Object.entries和reduce确保保持精确的键顺序
      const updatedProps = Object.entries(currentProps).reduce(
        (acc, [propKey, propValue]) => {
          if (propKey === oldKey) {
            // 使用新键替换旧键，但保持在完全相同的位置
            acc[newKey] = propValue;
          } else {
            // 保持其他键不变
            acc[propKey] = propValue;
          }
          return acc;
        },
        {} as Record<string, JsonSchema>
      );

      // 更新对象
      form.setValueIn(propertiesPath, updatedProps);
    },
    [form, t]
  );

  const handleAddChildOutput = useCallback(
    (path: string) => {
      // path points to the parent object definition (e.g., outputs.properties.objKey)
      const propertiesPath = `${path}.properties`;
      const currentProps =
        (form.getValueIn(propertiesPath) as Record<string, JsonSchema>) || {};

      let newKey = `child${Object.keys(currentProps).length}`;
      while (currentProps[newKey]) {
        newKey = `child${parseInt(newKey.replace("child", ""), 10) + 1}`;
      }

      const newProps = {
        ...currentProps,
        [newKey]: { type: "string", description: t('nodes.code.params.childParam') + ` ${newKey}` },
      };
      form.setValueIn(propertiesPath, newProps);
    },
    [form, t]
  );

  const addTopLevelOutput = useCallback(() => {
    const propertiesPath = "outputs.properties";
    const currentProps =
      (form.getValueIn(propertiesPath) as Record<string, JsonSchema>) || {};

    let newKey = `key${Object.keys(currentProps).length}`;
    while (currentProps[newKey]) {
      newKey = `key${parseInt(newKey.replace("key", ""), 10) + 1}`;
    }

    const newProps = {
      ...currentProps,
      [newKey]: { type: "string", description: t('nodes.code.params.outputParam') + ` ${newKey}` },
    };
    form.setValueIn(propertiesPath, newProps);
  }, [form, t]);

  // -- 代码编辑器弹窗 --
  const openCodeEditor = useCallback(() => {
    setCurrentCodeContent(form.values?.inputsValues?.codeContent || "");
    setEditorModalVisible(true);
  }, [form.values?.inputsValues?.codeContent]);

  const saveCodeContent = useCallback(() => {
    form.setValueIn("inputsValues.codeContent", currentCodeContent);
    setEditorModalVisible(false);
  }, [currentCodeContent, form]);

  const handleCancelModal = useCallback(() => {
    setEditorModalVisible(false);
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      <Collapse
         expandIconPosition="left"
        accordion={false}
        activeKey={activeKeys}
        onChange={(keys) => setActiveKeys(keys as string[])}
        style={{ width: '100%' }}
      >
        {/* 输入参数配置部分 */}
        <Collapse.Panel 
          header={t('nodes.code.form.inputParams')}
          itemKey={t('nodes.code.form.inputParams')}
        >
          <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
            {/* 使用ParamsArrayEditor组件替代原有的输入参数编辑器 */}
            <div style={{ width: "100%" }}>
            <ParamsArrayEditor
              arrayName="customParams"
              disabled={false}
              emptyText={t('nodes.code.form.noCustomParams')}
            />
            </div>
          </div>
        </Collapse.Panel>

        {/* 代码配置部分 */}
        <Collapse.Panel header={t('nodes.code.form.codeConfig')} itemKey={t('nodes.code.form.codeConfig')}>
          <Space vertical align="start" style={{ width: "100%" }}>
            {/* 编程语言选择 */}
            <div style={{ width: "100%" }}>
              <Typography.Text>{t('nodes.code.form.programmingLanguage')}</Typography.Text>
              <Field name="inputsValues.language">
                {({ field }) => (
                  <Select
                    style={{ width: "100%" }}
                    value={field.value as string}
                    onChange={(val) => field.onChange(val)}
                    optionList={languageOptions}
                    insetLabel={t('nodes.code.inputs.language') + ":"}
                  />
                )}
              </Field>
            </div>

            {/* 代码编辑器 */}
            <div style={{ width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <Typography.Text>{t('nodes.code.form.codeContent')}</Typography.Text>
                <Button
                  icon={<IconEdit />}
                  onClick={openCodeEditor}
                  theme="light"
                  type="primary"
                  size="small"
                >
                  {t('nodes.code.form.editInLargeWindow')}
                </Button>
              </div>
              <Field name="inputsValues.codeContent">
                {({ field }) => (
                  <div
                    style={{
                      height: 200,
                      border: "1px solid #e0e0e0",
                      borderRadius: "4px",
                      width: "100%",
                    }}
                  >
                    <Editor
                      height="200px"
                      width="100%"
                      language={
                        form.values?.inputsValues?.language || "javascript"
                      }
                      value={(field.value as string) || ""}
                      onChange={(val) => field.onChange(val)}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        readOnly: false,
                      }}
                    />
                  </div>
                )}
              </Field>
            </div>

            {/* 异常忽略开关 */}
            <div style={{ width: "100%", marginTop: "16px" }}>
              <Typography.Text>{t('nodes.code.form.exceptionHandling')}</Typography.Text>
              <div
                style={{
                  marginTop: "8px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Field name="inputsValues.ignoreErrors">
                  {({ field }) => (
                    <Switch
                      checked={field.value === true}
                      onChange={(checked) => field.onChange(checked)}
                      aria-label={t('nodes.code.inputs.ignoreErrors')}
                    />
                  )}
                </Field>
                <Typography.Text style={{ marginLeft: "8px" }}>
                  {t('nodes.code.form.ignoreErrors')}
                </Typography.Text>
              </div>
            </div>
          </Space>
        </Collapse.Panel>

        {/* 输出参数配置部分 */}
        <Collapse.Panel header={t('nodes.code.form.outputParams')} itemKey={t('nodes.code.form.outputParams')}>
          <Space vertical align="start" style={{ width: "100%" }}>
            {/* 使用OutputParamsEditor组件替代当前的输出参数编辑实现 */}
            <Field name="outputs">
              {({ field }) => (
                <OutputParamsEditor
                  paramPath="outputs"
                />
              )}
            </Field>
          </Space>
        </Collapse.Panel>
      </Collapse>

      {/* 代码编辑器弹窗 */}
      <CodeEditorModal
        visible={editorModalVisible}
        onCancel={handleCancelModal}
        onOk={saveCodeContent}
        codeContent={currentCodeContent}
        setCodeContent={setCurrentCodeContent}
        language={form.values?.inputsValues?.language || "javascript"}
      />
    </div>
  );
};

// 导出子组件以供其他节点复用
export { OutputParamItem, CodeParamItem, CodeParamsEditor };
