import React, { useEffect, useState, useCallback } from 'react';
import { Field, useForm } from '@flowgram.ai/free-layout-editor';
import { useTranslation } from 'react-i18next';
import { FlowLiteralValueSchema, FlowRefValueSchema } from '../../typings';
import { Typography, Tag, Space } from '@douyinfe/semi-ui';
import { IconCode } from '@douyinfe/semi-icons';
import { FormArrayOutputs, FormOutputs } from '@/form-components';

// 用于安全显示可能是对象的值
const safeRenderValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '--';
  }
  
  if (typeof value === 'object') {
    // 检查是否是FX表达式对象
    if (value.type === 'fx' && value.content) {
      return `{{${value.content}}}`;
    }
    // 其他对象类型转为JSON字符串
    return JSON.stringify(value);
  }
  
  return String(value);
};

// 简化的大模型视图组件
export const SimplifiedLLMView = () => {
  const { t } = useTranslation();
  const form = useForm();
  const [customInputParams, setCustomInputParams] = useState<string[]>([]);
  
  // 系统预设参数列表 - 这些是不会显示在输入标签中的参数
  const SYSTEM_PARAMS = ['modelType', 'temperature', 'systemPrompt', 'prompt'];
  
  // 表单同步函数，确保变更被提交
  const handleFormSync = useCallback(() => {
    if (!form) {
      console.error('表单实例不存在，无法同步');
      return;
    }
    
    const formAny = form as any;
    
    try {
      if (typeof formAny.submit === 'function') {
        formAny.submit();
      } else if (typeof formAny.handleSubmit === 'function') {
        formAny.handleSubmit();
      }
    } catch (err) {
      console.error('表单同步出错:', err);
    }
  }, [form]);

  // 更新自定义参数函数
  const updateCustomParams = useCallback(() => {
    if (!form?.values?.inputs?.properties) return;
    
    const allParams = Object.keys(form.values.inputs.properties);
    // 过滤出非系统参数的自定义参数
    const filteredParams = allParams.filter(param => !SYSTEM_PARAMS.includes(param));
    
    // 检查是否有变化，避免不必要的更新
    const currentParamsStr = JSON.stringify(filteredParams);
    const prevParamsStr = JSON.stringify(customInputParams);
    
    if (currentParamsStr !== prevParamsStr) {
      console.log('自定义参数已更新:', filteredParams);
      setCustomInputParams(filteredParams);
    }
  }, [form?.values?.inputs?.properties, customInputParams, SYSTEM_PARAMS]);
  
  // 监听表单变更
  useEffect(() => {
    // 初始更新
    updateCustomParams();
    
    // 设置更新间隔
    const interval = setInterval(() => {
      if (form?.values) {
        updateCustomParams();
        handleFormSync();
      }
    }, 500);
    return () => clearInterval(interval);
  }, [form, updateCustomParams, handleFormSync]);

  return (
    <>
      {/* 模型类型和温度显示 */}
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        padding: '8px 10px 4px 10px',
      }}>
        <Field<string | FlowLiteralValueSchema | FlowRefValueSchema> name="inputsValues.modelType">
          {({ field: modelField }) => (
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              marginRight: '12px'
            }}>
              <IconCode size="small" style={{ color: '#2080f0', marginRight: '6px' }} />
              <Typography.Text strong style={{ fontSize: '13px' }}>
                {safeRenderValue(modelField.value.label)}
              </Typography.Text>
            </div>
          )}
        </Field>
        
        <Field<string | number | FlowLiteralValueSchema | FlowRefValueSchema> name="inputsValues.temperature">
          {({ field: tempField }) => (
            <Tag color='blue' size='small' type='light'>
              {t('nodes.llm.form.temperature')}: {safeRenderValue(tempField.value)}
            </Tag>
          )}
        </Field>
      </div>
      <FormArrayOutputs name='inputsValues.customParams' label={t('nodes.llm.form.input')}/>
      <FormOutputs />
    </>
  );
};

// 输入标签组件
const InputTag = ({ children, type }: { children: React.ReactNode, type: 'primary' | 'warning' | 'tertiary' }) => {
  // 根据类型设置不同的颜色
  const getColor = () => {
    switch (type) {
      case 'primary':
        return { bg: '#ffe8cc', text: '#ff9500' };
      case 'warning':
        return { bg: '#fff0f0', text: '#ff4d4f' };
      case 'tertiary':
        return { bg: '#f0f0f0', text: '#666' };
      default:
        return { bg: '#f0f0f0', text: '#666' };
    }
  };
  
  const colors = getColor();
  
  return (
    <div style={{
      backgroundColor: colors.bg,
      color: colors.text,
      padding: '1px 6px',
      borderRadius: '10px',
      fontSize: '11px',
      fontWeight: type !== 'tertiary' ? 'bold' : 'normal'
    }}>
      {children}
    </div>
  );
}; 