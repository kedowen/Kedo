import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import {
  Input,
  Button,
  Typography,
  TextArea,
  Tooltip,
  Switch,
} from "@douyinfe/semi-ui";
import {
  IconDelete,
  IconEdit,
  IconRefresh,
  IconPlus,
} from "@douyinfe/semi-icons";
import { Field, FieldState, useForm } from "@flowgram.ai/free-layout-editor";

import { TypeSelect } from "../../form-components/type-select";
import { TypeDefault } from "../../form-components/type-default";
import { FxExpression, FxIcon } from "../../form-components/fx-expression";
import { ErrorContainer } from "../../form-components/error-container";
import { VariableSelector } from "../../plugins/sync-variable-plugin/variable-selector";
import {
  FlowLiteralValueSchema,
  FlowRefValueSchema,
  BasicType,
} from "../../typings";

const { Text } = Typography;

// 自定义参数项接口
interface ParamItem {
  title: string;
  type: string;
  value?: any;
}

// 样式定义
const ParamContainer = {
  padding: "12px",
  border: "1px solid #e0e0e0",
  borderRadius: "4px",
  marginBottom: "16px",
  background: "#fafafa",
};

const RowStyle = {
  display: "flex",
  alignItems: "center",
  marginBottom: "12px",
};

const LabelStyle = {
  fontSize: "12px",
  color: "#666",
  marginBottom: "4px",
  display: "block",
};

const EmptyStateStyle = {
  padding: "20px",
  textAlign: "center" as const,
  border: "1px dashed #ccc",
  borderRadius: "4px",
  marginBottom: "16px",
};

const ActionButton = {
  marginRight: "4px",
};

interface ParamItemProps {
  param: ParamItem;
  index: number;
  fieldState?: FieldState;
  onUpdate: (index: number, param: ParamItem) => void;
  onDelete: (index: number) => void;
  disabled?: boolean;
  allParams: ParamItem[];
}

// 单个参数项编辑器
const ParamItemEditor: React.FC<ParamItemProps> = ({
  param,
  index,
  onUpdate,
  onDelete,
  disabled,
  fieldState,
  allParams
}) => {
  const { t } = useTranslation();
  // 本地状态
  const [editingName, setEditingName] = useState(param.title);
  const isExpression = param.type === "expression";

  // 当参数名称变化时更新编辑状态
  useEffect(() => {
    setEditingName(param.title);
  }, [param.title]);

  // 处理名称变更
  const handleNameChange = (value: string) => {
    setEditingName(value);
  };

  // 处理名称变更提交
  const handleNameBlur = () => {
    if (editingName.trim()) {
      onUpdate(index, {
        ...param,
        title: editingName.trim(),
      });
    } else {
      setEditingName(param.title);
    }
  };

  // 处理类型变更
  const handleTypeChange = (type: string) => {
    // 如果是表达式模式，不允许更改类型
    if (isExpression) return;

    // 根据类型设置默认值
    let defaultValue: any = "";
    switch (type) {
      case "object":
        defaultValue = {};
        break;
      case "array":
        defaultValue = [];
        break;
      case "number":
        defaultValue = 0;
        break;
      case "boolean":
        defaultValue = false;
        break;
      case "string":
      default:
        defaultValue = "";
        break;
    }

    // 更新参数
    onUpdate(index, {
      ...param,
      type,
      value: defaultValue,
    });
  };

  // 处理值变更
  const handleValueChange = (value: any) => {
    onUpdate(index, {
      ...param,
      value,
    });
  };

  // 切换表达式模式
  const toggleExpressionMode = () => {
    if (isExpression) {
      // 从表达式切换回普通模式，直接使用字符串类型
      onUpdate(index, {
        ...param,
        type: "string",
        value: String(param.value || ""),
      });
    } else {
      // 从普通模式切换到表达式模式
      onUpdate(index, {
        ...param,
        type: "expression",
        value: String(param.value || ""),
      });
    }
  };

  return (
    <div style={ParamContainer}>
      <div style={RowStyle}>
        <div style={{ flex: 1, marginRight: "8px" }}>
          <Text style={LabelStyle}>{t('formComponents.formOutputs.name')}</Text>
          <ErrorContainer 
            fieldState={fieldState as FieldState} 
            style={{ width: "100%" }}
          >
            <Input
              value={editingName}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              onEnterPress={handleNameBlur}
              disabled={disabled}
              placeholder={t('formComponents.propertiesEdit.inputVariableName')}
              style={{ width: "100%" }}
            />
          </ErrorContainer>
        </div>
        {/* 参数类型选择器，表达式模式不显示 */}
        {!isExpression && (
          <div style={{ width: "140px", marginRight: "8px" }}>
            <Text style={LabelStyle}>{t('formComponents.formOutputs.type')}</Text>
            <TypeSelect
              value={param.type as any}
              onChange={handleTypeChange as any}
              disabled={disabled}
              style={{ width: "100%" }}
            />
          </div>
        )}

        {/* 操作按钮 */}
        <div style={{ marginTop: "20px", display: "flex" }}>
          {!disabled && (
            <>
              <Button
                theme="borderless"
                icon={<FxIcon />}
                onClick={toggleExpressionMode}
              />
              <Button
                type="danger"
                theme="borderless"
                icon={<IconDelete />}
                onClick={() => onDelete(index)}
                style={ActionButton}
              />
            </>
          )}
        </div>
      </div>

      {/* 参数值编辑器 */}
      <div>
        <Text style={LabelStyle}>{t('formComponents.formOutputs.default')}</Text>
        {isExpression ? (
          <VariableSelector
            value={String(param.value || "")}
            onChange={handleValueChange}
            style={{ width: "100%" }}
            readonly={disabled}
          />
        ) : (
          <TypeDefault
            type={param.type as any}
            value={{
              type: param.type as any,
              default: param.value,
            }}
            disabled={disabled}
            onChange={(updatedValue) => {
              if (updatedValue && "default" in updatedValue) {
                handleValueChange(updatedValue.default);
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

// 参数数组编辑器属性接口
export interface ParamsArrayEditorProps {
  // 数组名称 - 用于指定表单中对应的字段名
  arrayName: string;
  // 是否禁用编辑
  disabled?: boolean;
  // 空状态文本
  emptyText?: string;
  // 同步表单回调 - 可选，如果提供，将在数据变更后调用
  onSync?: () => void;
}

// 参数数组编辑器组件
export const ParamsArrayEditor: React.FC<ParamsArrayEditorProps> = ({
  arrayName,
  disabled = false,
  emptyText = "还没有自定义参数，点击下方按钮添加",
  onSync,
}) => {
  const { t } = useTranslation();
  const form = useForm();
  const [localParams, setLocalParams] = useState<ParamItem[]>([]);
  const [localErrors, setLocalErrors] = useState<Record<string, { name: string; message: string }[]>>({});

  // 同步表单
  const handleFormSync = useCallback(() => {
    if (!form) return;

    // 调用表单提交
    const formAny = form as any;
    try {
      if (typeof formAny.submit === "function") {
        formAny.submit();
      } else if (typeof formAny.handleSubmit === "function") {
        formAny.handleSubmit();
      }

      // 调用自定义同步回调
      if (onSync) {
        onSync();
      }
    } catch (err) {
      console.error("表单同步出错:", err);
    }
  }, [form, onSync]);

  // 更新输入类型定义
  const updateInputDefinition = useCallback(() => {
    if (!form) return;

    // 创建输入定义
    const inputDefinition = {
      type: "array",
      description: t('formComponents.propertiesEdit.description'),
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: t('formComponents.formOutputs.name'),
          },
          type: {
            type: "string",
            description: t('formComponents.formOutputs.type'),
          },
          value: {
            type: "any",
            description: t('formComponents.formOutputs.default'),
          },
        },
      },
    };

    // 更新inputs定义
    form.setValueIn(`inputs.properties.${arrayName}`, inputDefinition);

    // 如果inputValues中没有此数组，初始化为空数组
    if (!form.values?.inputsValues?.[arrayName]) {
      form.setValueIn(`inputsValues.${arrayName}`, []);
    }
  }, [form, arrayName, t]);

  // 初始化输入定义
  useEffect(() => {
    updateInputDefinition();
  }, [updateInputDefinition]);

  // 验证参数名称
  const validateParams = useCallback((params: ParamItem[]) => {
    const errors: Record<string, { name: string; message: string }[]> = {};
    
    // 检查每个参数
    params.forEach((param, index) => {
      const paramPath = `inputsValues.${arrayName}[${index}].title`;
      const currentErrors = [];
      
      // 检查参数名称是否为空
      if (!param.title || param.title.trim() === '') {
        currentErrors.push({
          name: paramPath,
          message: t('components.paramsArrayEditor.emptyNameError')
        });
      }
      
      // 检查参数名称是否重复
      const duplicates = params.filter(
        (p, i) => p.title === param.title && i !== index && p.title.trim() !== ''
      );
      
      if (duplicates.length > 0) {
        currentErrors.push({
          name: paramPath,
          message: t('components.paramsArrayEditor.duplicateNameError')
        });
      }
      
      if (currentErrors.length > 0) {
        errors[paramPath] = currentErrors;
      }
    });
    
    setLocalErrors(errors);
    return errors;
  }, [arrayName, t]);

  return (
    <Field
      name={`inputsValues.${arrayName}`}
      deps={[arrayName]}
      render={({ field: { value, onChange } }) => {
        // 确保value始终是数组
        const params: ParamItem[] = Array.isArray(value) ? value : [];
        
        // 当参数列表变化时更新本地状态并触发验证
        useEffect(() => {
          setLocalParams(params);
          validateParams(params);
        }, [params]);

        // 更新单个参数
        const handleUpdateParam = (index: number, updatedParam: ParamItem) => {
          const newParams = [...params];
          newParams[index] = updatedParam;
          onChange(newParams);
          setLocalParams(newParams);
          validateParams(newParams);

          // 同步表单
          setTimeout(handleFormSync, 0);
        };

        // 删除参数
        const handleDeleteParam = (index: number) => {
          const newParams = params.filter((_, i) => i !== index);
          onChange(newParams);
          setLocalParams(newParams);
          validateParams(newParams);

          // 同步表单
          setTimeout(handleFormSync, 0);
        };

        // 添加新参数
        const handleAddParam = () => {
          // 下一个参数编号
          const nextNum = params.length + 1;

          // 创建新参数
          const newParam: ParamItem = {
            title: `${arrayName}${nextNum}`,
            type: "string",
            value: "",
          };

          // 更新参数列表
          const newParams = [...params, newParam];
          onChange(newParams);
          setLocalParams(newParams);
          validateParams(newParams);

          // 同步表单
          setTimeout(handleFormSync, 0);
        };

        // 获取特定参数项的fieldState
        const getParamFieldState = (index: number) => {
          const paramPath = `inputsValues.${arrayName}[${index}].title`;
          const pathErrors = localErrors[paramPath] || [];
          
          return {
            errors: pathErrors,
            invalid: Boolean(pathErrors.length),
            isTouched: true,
            isDirty: true,
            isValidating: false
          } as FieldState;
        };

        // 如果没有参数，显示空状态
        if (params.length === 0) {
          return (
            <div style={EmptyStateStyle}>
              <Text type="tertiary">{emptyText}</Text>
              {!disabled && (
                <div style={{ marginTop: "12px" }}>
                  <Button
                    theme="light"
                    type="primary"
                    icon={<IconPlus />}
                    onClick={handleAddParam}
                  >
                    {t('formComponents.formOutputs.add')}
                  </Button>
                </div>
              )}
            </div>
          );
        }

        // 渲染参数列表
        return (
          <div className="array-params-container">
            {params.map((param, index) => (
              <ParamItemEditor
                key={index}
                param={param}
                index={index}
                onUpdate={handleUpdateParam}
                onDelete={handleDeleteParam}
                disabled={disabled}
                fieldState={getParamFieldState(index)}
                allParams={params}
              />
            ))}

            {!disabled && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "12px",
                }}
              >
                <Button
                  theme="light"
                  type="primary"
                  icon={<IconPlus />}
                  onClick={handleAddParam}
                >
                  {t('formComponents.formOutputs.add')}
                </Button>
              </div>
            )}
          </div>
        );
      }}
    />
  );
};
