import React, { useState, useEffect, useCallback } from 'react';
import { Input, Button, Typography, TextArea, Tooltip, Switch, JsonViewer } from '@douyinfe/semi-ui';
import { IconDelete, IconEdit, IconRefresh, IconArrowUp, IconArrowDown, IconPlus } from '@douyinfe/semi-icons';
import { Field, useForm } from '@flowgram.ai/free-layout-editor';

import { TypeSelect } from '../../../form-components/type-select';
import { TypeDefault } from '../../../form-components/type-default';
import { FxExpression, FxIcon } from '../../../form-components/fx-expression';
import { VariableSelector } from '../../../plugins/sync-variable-plugin/variable-selector';
import { FlowLiteralValueSchema, FlowRefValueSchema, JsonSchema, BasicType, FxValueTypeEnum } from '../../../typings';

const { Text } = Typography;

// 自定义参数项接口
interface ParamItem {
  title?: string;
  type?: string; // 使用字符串类型，包括BasicType和'expression'
  description?: string;
  _originalType?: string;
  _originalDesc?: string;
}

// 样式定义
const ParamContainer = {
  padding: '12px',
  border: '1px solid #e0e0e0',
  borderRadius: '4px',
  marginBottom: '16px',
  background: '#fafafa'
};

const RowStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '12px',
};

const LabelStyle = {
  fontSize: '12px',
  color: '#666',
  marginBottom: '4px',
  display: 'block'
};

const EmptyStateStyle = {
  padding: '20px',
  textAlign: 'center' as const,
  border: '1px dashed #ccc',
  borderRadius: '4px',
  marginBottom: '16px'
};

const ActionButton = {
  marginRight: '4px'
};

// JSON编辑器组件
const JsonEditor: React.FC<{
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  isArray?: boolean;
}> = ({ value, onChange, disabled, isArray = false }) => {
  // 确保value是预期的类型
  useEffect(() => {
    // 如果值不是预期类型，则设置为默认值
    const isValueValid = isArray ? Array.isArray(value) : (typeof value === 'object' && value !== null && !Array.isArray(value));
    
    if (!isValueValid) {
      const defaultValue = isArray ? [] : {};
      onChange(defaultValue);
    }
  }, [value, isArray, onChange]);

  // 格式化JSON字符串，确保显示美观
  const formatJsonString = (val: any): string => {
    if (val === undefined || val === null) {
      return isArray ? '[]' : '{}';
    }
    
    try {
      // 检查类型是否匹配
      if (isArray && !Array.isArray(val)) {
        return '[]';
      } else if (!isArray && (typeof val !== 'object' || Array.isArray(val))) {
        return '{}';
      }
      
      return JSON.stringify(val, null, 2);
    } catch (e) {
      console.warn('JSON格式化错误:', e);
      return isArray ? '[]' : '{}';
    }
  };
  
  // 解析JSON字符串
  const parseJsonString = (str: string): any => {
    if (!str || str.trim() === '') {
      return isArray ? [] : {};
    }
    
    try {
      const parsed = JSON.parse(str);
      
      // 验证解析后的值类型是否正确
      if (isArray && !Array.isArray(parsed)) {
        console.warn('期望数组类型，但解析结果不是数组');
        return [];
      } else if (!isArray && (typeof parsed !== 'object' || Array.isArray(parsed))) {
        console.warn('期望对象类型，但解析结果不是对象');
        return {};
      }
      
      return parsed;
    } catch (e) {
      console.error('JSON解析错误:', e);
      return isArray ? [] : {};
    }
  };
  
  // 处理输入变化
  const handleChange = (val: string) => {
    try {
      const parsed = parseJsonString(val);
      onChange(parsed);
    } catch (e) {
      // 如果解析失败，使用空对象/数组
      console.error('JSON变更处理错误:', e);
      onChange(isArray ? [] : {});
    }
  };
  
  return (
    <TextArea
      value={formatJsonString(value)}
      onChange={handleChange}
      disabled={disabled}
      placeholder={`请输入JSON ${isArray ? '数组' : '对象'}`}
      style={{ width: '100%', minHeight: '80px' }}
      autosize={{ minRows: 3, maxRows: 6 }}
    />
  );
};

interface LLMParamItemProps {
  param: ParamItem;
  onUpdate: (updatedParam: ParamItem) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  disabled?: boolean;
  form: any;
  index: number;
}

// 单个参数编辑器组件
const LLMParamItem: React.FC<LLMParamItemProps> = ({
  param,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  disabled,
  form,
  index
}) => {
  const [editingName, setEditingName] = useState(param.title || `参数${index+1}`);
  // 添加状态跟踪参数是否为表达式类型
  const [isExpression, setIsExpression] = useState(param.type === 'expression');
  
  // 当参数名称变化时更新编辑状态
  useEffect(() => {
    setEditingName(param.title || `参数${index+1}`);
  }, [param.title, index]);
  
  // 检查是否为表达式模式
  useEffect(() => {
    setIsExpression(param.type === 'expression');
  }, [param.type]);
  
  // 判断是否是JSON类型
  const isJsonType = param.type === 'object' || param.type === 'array';
  const isArrayType = param.type === 'array';
  
  // 处理名称变更
  const handleNameChange = (value: string) => {
    setEditingName(value);
  };
  
  // 处理名称变更提交
  const handleNameBlur = () => {
    if (editingName.trim()) {
      onUpdate({
        ...param,
        title: editingName.trim()
      });
    } else {
      setEditingName(param.title || `参数${index+1}`);
    }
  };
  
  // 处理类型变更
  const handleTypeChange = (type: string) => {
    // 如果当前是表达式模式，不允许更改类型
    if (isExpression) {
      return;
    }
    
    // 更新参数定义中的类型
    onUpdate({ 
      ...param, 
      type
    });
    
    // 更新表单中的值
    if (form && form.values && form.values.inputsValues && Array.isArray(form.values.inputsValues)) {
      // 根据新类型设置适当的初始值
      let initialValue: any = '';
      
      switch(type) {
        case 'object':
          initialValue = {};
          break;
        case 'array':
          initialValue = [];
          break;
        case 'number':
          initialValue = 0;
          break;
        case 'boolean':
          initialValue = false;
          break;
        case 'string':
        default:
          initialValue = '';
          break;
      }
      
      // 更新数组中指定索引位置的值
      const newInputsValues = [...form.values.inputsValues];
      newInputsValues[index] = initialValue;
      
      // 设置新值
      form.setValueIn('inputsValues', newInputsValues);
      
      // 如果表单有提交方法，则提交更新
      const formAny = form as any;
      if (typeof formAny.submit === 'function') {
        setTimeout(() => {
          formAny.submit();
        }, 0);
      }
    }
  };
  
  // 切换到表达式模式
  const switchToExpressionMode = () => {
    // 保存原始类型，用于切换回来
    const originalType = param.type || 'string';
    const originalDesc = param.description || `自定义参数 ${index+1}`;
    
    // 更新参数定义
    onUpdate({
      ...param,
      type: 'expression',
      _originalType: originalType,
      _originalDesc: originalDesc
    });
    
    // 如果是数组模式，更新值为字符串
    if (form?.values?.inputsValues && Array.isArray(form.values.inputsValues)) {
      const currentValue = form.values.inputsValues[index];
      const stringValue = currentValue !== undefined ? String(currentValue) : '';
      
      // 创建新数组并更新
      const newInputsValues = [...form.values.inputsValues];
      newInputsValues[index] = stringValue;
      form.setValueIn('inputsValues', newInputsValues);
    }
    
    // 更新组件状态
    setIsExpression(true);
    
    // 提交表单
    const formAny = form as any;
    if (typeof formAny.submit === 'function') {
      setTimeout(() => {
        formAny.submit();
      }, 0);
    }
  };
  
  // 切换回普通模式
  const switchToNormalMode = () => {
    // 获取原始类型信息
    const originalType = param._originalType || 'string';
    const originalDesc = param._originalDesc || `自定义参数 ${index+1}`;
    
    // 更新参数定义
    onUpdate({
      ...param,
      type: originalType,
      description: originalDesc,
      _originalType: undefined,
      _originalDesc: undefined
    });
    
    // 如果是数组模式，更新值为相应类型
    if (form?.values?.inputsValues && Array.isArray(form.values.inputsValues)) {
      const contentValue = form.values.inputsValues[index] || '';
      
      // 根据原始类型转换值
      let typedValue: any = contentValue;
      switch(originalType) {
        case 'object':
          try {
            typedValue = JSON.parse(contentValue || '{}');
          } catch {
            typedValue = {};
          }
          break;
        case 'array':
          try {
            typedValue = JSON.parse(contentValue || '[]');
          } catch {
            typedValue = [];
          }
          break;
        case 'number':
          typedValue = parseFloat(contentValue) || 0;
          break;
        case 'boolean':
          typedValue = contentValue === 'true';
          break;
        case 'string':
        default:
          typedValue = contentValue;
          break;
      }
      
      // 创建新数组并更新
      const newInputsValues = [...form.values.inputsValues];
      newInputsValues[index] = typedValue;
      form.setValueIn('inputsValues', newInputsValues);
    }
    
    // 更新组件状态
    setIsExpression(false);
    
    // 提交表单
    const formAny = form as any;
    if (typeof formAny.submit === 'function') {
      setTimeout(() => {
        formAny.submit();
      }, 0);
    }
  };
  
  return (
    <div style={ParamContainer}>
      <div style={RowStyle}>
        <div style={{ flex: 1, marginRight: '8px' }}>
          <Text style={LabelStyle}>参数名称</Text>
          <Input
            value={editingName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onEnterPress={handleNameBlur}
            disabled={disabled}
            placeholder="输入参数名称"
            style={{ width: '100%' }}
          />
        </div>
        
        {/* 参数类型选择器，只有在非表达式模式下才显示 */}
        {!isExpression && (
          <div style={{ width: '140px', marginRight: '8px' }}>
            <Text style={LabelStyle}>参数类型</Text>
            <TypeSelect
              value={param.type || 'string'}
              onChange={handleTypeChange}
              disabled={disabled}
              style={{ width: '100%' }}
            />
          </div>
        )}
        
        <div style={{ marginTop: '20px', display: 'flex' }}>
          {!disabled && (
            <>
              {onMoveUp && !isFirst && (
                <Button
                  theme="borderless"
                  icon={<IconArrowUp />}
                  onClick={onMoveUp}
                  style={ActionButton}
                />
              )}
              {onMoveDown && !isLast && (
                <Button
                  theme="borderless"
                  icon={<IconArrowDown />}
                  onClick={onMoveDown}
                  style={ActionButton}
                />
              )}
              <Button
                type="danger"
                theme="borderless"
                icon={<IconDelete />}
                onClick={onDelete}
                style={ActionButton}
              />
              <Button
                theme="borderless"
                icon={<FxIcon />}
                onClick={() => {
                  // 处理Fx表达式切换 - 支持来回切换
                  if (isExpression) {
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
      
      <div>
        <Text style={LabelStyle}>参数值</Text>
        <Field
          name={`inputsValues.${index}`}
          render={({ field }) => {
            // 表达式模式下，使用变量选择器
            if (isExpression) {
              return (
                <VariableSelector
                  value={String(field.value || '')}
                  onChange={(val) => {
                    // 直接设置为字符串
                    field.onChange(val);
                  }}
                  style={{ width: '100%' }}
                  readonly={disabled}
                />
              );
            }
            
            // 普通模式下，使用TypeDefault组件
            return (
              <TypeDefault
                type={param.type as any || 'string'}
                value={{ 
                  type: param.type,
                  default: field.value 
                }}
                disabled={disabled}
                onChange={(updatedValue) => {
                  // TypeDefault组件会更新整个值对象，但我们只需要其default属性
                  if (updatedValue && 'default' in updatedValue) {
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

// LLM参数编辑器组件属性接口
export interface LLMParamsEditorProps {
  items?: ParamItem[];
  onChange: (items: ParamItem[]) => void;
  disabled?: boolean;
  form: any;
}

// LLM参数编辑器组件
export const LLMParamsEditor: React.FC<LLMParamsEditorProps> = ({
  items = [],
  onChange,
  disabled,
  form
}) => {
  // 处理参数更新
  const handleParamUpdate = useCallback((index: number, updatedParam: ParamItem) => {
    const newItems = [...items];
    newItems[index] = updatedParam;
    onChange(newItems);
    
    // 提交表单以确保变更同步到节点
    setTimeout(() => {
      if (form && typeof form.submit === 'function') {
        form.submit();
      }
    }, 10);
  }, [items, onChange, form]);
  
  // 处理参数删除
  const handleParamDelete = useCallback((index: number) => {
    // 创建新数组，排除要删除的项
    const newItems = items.filter((_: ParamItem, i: number) => i !== index);
    onChange(newItems);
    
    // 同时更新表单中的值
    if (form?.values?.inputsValues && Array.isArray(form.values.inputsValues)) {
      const newInputsValues = form.values.inputsValues.filter((_: any, i: number) => i !== index);
      form.setValueIn('inputsValues', newInputsValues);
    }
    
    // 提交表单以确保变更同步到节点
    setTimeout(() => {
      if (form && typeof form.submit === 'function') {
        form.submit();
      }
    }, 10);
  }, [items, onChange, form]);
  
  // 处理参数位置移动
  const handleMoveParam = useCallback((fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length) return;
    
    // 创建新数组并移动项
    const newItems = [...items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    onChange(newItems);
    
    // 同时更新表单中的值
    if (form?.values?.inputsValues && Array.isArray(form.values.inputsValues)) {
      const newInputsValues = [...form.values.inputsValues];
      const [movedValue] = newInputsValues.splice(fromIndex, 1);
      newInputsValues.splice(toIndex, 0, movedValue);
      form.setValueIn('inputsValues', newInputsValues);
    }
    
    // 提交表单以确保变更同步到节点
    setTimeout(() => {
      if (form && typeof form.submit === 'function') {
        form.submit();
      }
    }, 10);
  }, [items, onChange, form]);
  
  // 处理添加参数
  const handleAddParam = useCallback(() => {
    // 创建新参数
    const newParam: ParamItem = {
      type: 'string',
      title: `参数${items.length + 1}`,
      description: `自定义参数 ${items.length + 1}`
    };
    
    // 添加到数组
    const newItems = [...items, newParam];
    onChange(newItems);
    
    // 初始化表单中的值
    if (form?.values?.inputsValues) {
      const inputsValues = Array.isArray(form.values.inputsValues) 
        ? [...form.values.inputsValues, ''] 
        : [''];
      form.setValueIn('inputsValues', inputsValues);
    }
    
    // 提交表单以确保变更同步到节点
    setTimeout(() => {
      if (form && typeof form.submit === 'function') {
        form.submit();
      }
    }, 10);
  }, [items, onChange, form]);
  
  // 如果没有参数，显示空状态
  if (items.length === 0) {
    return (
      <div style={EmptyStateStyle}>
        <Text type="tertiary">还没有自定义参数，点击下方按钮添加</Text>
        {!disabled && (
          <div style={{ marginTop: '12px' }}>
            <Button
              theme="light"
              type="primary"
              icon={<IconPlus />}
              onClick={handleAddParam}
            >
              添加参数
            </Button>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="llm-params-container">
      {items.map((param, index) => (
        <LLMParamItem
          key={index}
          param={param}
          index={index}
          onUpdate={(updatedParam) => handleParamUpdate(index, updatedParam)}
          onDelete={() => handleParamDelete(index)}
          onMoveUp={() => handleMoveParam(index, index - 1)}
          onMoveDown={() => handleMoveParam(index, index + 1)}
          isFirst={index === 0}
          isLast={index === items.length - 1}
          disabled={disabled}
          form={form}
        />
      ))}
      
      {!disabled && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <Button
            theme="light"
            type="primary"
            icon={<IconPlus />}
            onClick={handleAddParam}
          >
            添加参数
          </Button>
        </div>
      )}
    </div>
  );
};