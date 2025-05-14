import React, { useEffect, useState, useCallback } from 'react';
import { Field, useForm } from '@flowgram.ai/free-layout-editor';
import { FlowLiteralValueSchema, FlowRefValueSchema } from '../../typings';
import { Typography, Tag, Space, Badge, Tooltip } from '@douyinfe/semi-ui';
import { IconCode, IconInfoCircle } from '@douyinfe/semi-icons';
import { FormArrayOutputs, FormOutputs } from '@/form-components';
import { useTranslation } from 'react-i18next';

// 用于安全显示可能是对象的值
const safeRenderValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '--';
  }
  
  if (typeof value === 'object') {
    // 检查是否是FX表达式对象
    if (value.type === 'fx' || value.type === 'expression') {
      return `{{${value.content}}}`;
    }
    // 对象类型截断显示
    return JSON.stringify(value).length > 30 
      ? JSON.stringify(value).substring(0, 27) + '...'
      : JSON.stringify(value);
  }
  
  // 对长字符串进行截断
  if (typeof value === 'string' && value.length > 30) {
    return value.substring(0, 27) + '...';
  }
  
  return String(value);
};

// 简化的代码视图组件
export const SimplifiedCodeView = () => {
  const { t } = useTranslation();
  const form = useForm();
  const BUILT_IN_PARAMS = ['codeContent', 'language', 'ignoreErrors'];
  const [customInputParams, setCustomInputParams] = useState<Array<{key: string, value: any}>>([]);
  const [inputArrayParams, setInputArrayParams] = useState<Array<{title: string, type: string, value: any}>>([]);
  const [customOutputParams, setCustomOutputParams] = useState<string[]>([]);
  
  // 表单同步函数，确保变更被提交
  const handleFormSync = useCallback(() => {
    if (!form) return;
    
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

  // 更新参数函数
  const updateParams = useCallback(() => {
    if (!form?.values) return;
    
    // 更新输入参数列表
    if (form.values.inputs?.properties) {
      const allParams = Object.keys(form.values.inputs.properties);
      const filteredParams = allParams.filter(param => !BUILT_IN_PARAMS.includes(param));
      
      // 获取参数值
      const paramValues = filteredParams.map(key => ({
        key,
        value: form.values.inputsValues ? form.values.inputsValues[key] : undefined
      }));
      
      // 检查是否有变化，避免不必要的更新
      const currentParamsStr = JSON.stringify(paramValues);
      const prevParamsStr = JSON.stringify(customInputParams);
      
      if (currentParamsStr !== prevParamsStr) {
        setCustomInputParams(paramValues);
      }

      // 检查并处理input数组参数
      if (form.values.inputsValues && form.values.inputsValues.input && Array.isArray(form.values.inputsValues.input)) {
        const inputParams = form.values.inputsValues.input;
        setInputArrayParams(inputParams);
      }
    }
    
    // 更新输出参数列表
    if (form.values.outputs?.properties) {
      const outputParams = Object.keys(form.values.outputs.properties);
      const currentOutputsStr = JSON.stringify(outputParams);
      const prevOutputsStr = JSON.stringify(customOutputParams);
      
      if (currentOutputsStr !== prevOutputsStr) {
        setCustomOutputParams(outputParams);
      }
    }
  }, [form?.values, customInputParams, customOutputParams, BUILT_IN_PARAMS]);
  
  // 监听表单变更
  useEffect(() => {
    // 初始更新
    updateParams();
    
    // 设置更新间隔
    const interval = setInterval(() => {
      if (form?.values) {
        updateParams();
        handleFormSync();
      }
    }, 300);
    return () => clearInterval(interval);
  }, [form, updateParams, handleFormSync]);

  // 获取错误忽略设置
  const ignoreErrors = form?.values?.inputsValues?.ignoreErrors === true;

  // 获取代码语言
  const codeLanguage = safeRenderValue(form?.values?.inputsValues?.language || 'javascript');
  
  // 获取语言标识
  const getLanguageTag = () => {
    const lang = String(codeLanguage).toLowerCase();
    if (lang.includes('python')) return 'PY';
    if (lang.includes('typescript')) return 'TS';
    return 'JS';
  };

  // 输入参数展示逻辑
  const renderInputParams = () => {
    if (inputArrayParams.length === 0) {
      return <InputTag type="primary">input</InputTag>;
    }

    // 只显示前两个参数
    const visibleParams = inputArrayParams.slice(0, 2);
    const hiddenCount = inputArrayParams.length - 2;

    return (
      <>
        {visibleParams.map((param, index) => (
          <Tooltip key={index} content={
            <div style={{ maxWidth: '200px', wordBreak: 'break-all' }}>
              <Typography.Text>
                {param.title}: {safeRenderValue(param.value)}
                <br />
                <small>{t('formComponents.typeTag.' + param.type)}</small>
              </Typography.Text>
            </div>
          }>
            <div>
              <InputTag type="primary">
                {param.title}
              </InputTag>
            </div>
          </Tooltip>
        ))}

        {/* 显示额外参数数量 */}
        {hiddenCount > 0 && (
          <Tooltip content={
            <div style={{ maxWidth: '200px' }}>
              {inputArrayParams.slice(2).map((param, index) => (
                <div key={index} style={{ marginBottom: '4px' }}>
                  <Typography.Text>
                    {param.title}: {safeRenderValue(param.value)}
                    <br />
                    <small>{t('formComponents.typeTag.' + param.type)}</small>
                  </Typography.Text>
                </div>
              ))}
            </div>
          }>
            <div>
              <InputTag type="primary" style={{ cursor: 'pointer' }}>+{hiddenCount}</InputTag>
            </div>
          </Tooltip>
        )}
      </>
    );
  };

  // 输出参数展示逻辑
  const renderOutputParams = () => {
    if (customOutputParams.length === 0) {
      return <Typography.Text type="tertiary" size="small">{t('nodes.code.form.noOutputParams')}</Typography.Text>;
    }

    // 只显示前两个参数
    const visibleParams = customOutputParams.slice(0, 2);
    const hiddenCount = customOutputParams.length - 2;

    return (
      <>
        {visibleParams.map((param) => (
          <InputTag key={param} type="tertiary">{param}</InputTag>
        ))}

        {/* 显示额外参数数量 */}
        {hiddenCount > 0 && (
          <Tooltip content={
            <div style={{ maxWidth: '200px' }}>
              {customOutputParams.slice(2).map((param, index) => (
                <div key={index} style={{ marginBottom: '4px' }}>
                  <Typography.Text>{param}</Typography.Text>
                </div>
              ))}
            </div>
          }>
            <div>
              <InputTag type="tertiary" style={{ cursor: 'pointer' }}>+{hiddenCount}</InputTag>
            </div>
          </Tooltip>
        )}
      </>
    );
  };

  return (
    <>
      {/* 代码语言和类型显示 */}
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 10px 4px 10px',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          marginRight: '12px'
        }}>
          <IconCode size="small" style={{ color: '#2080f0', marginRight: '6px' }} />
          <Typography.Text strong style={{ fontSize: '13px' }}>
            {codeLanguage}
          </Typography.Text>
        </div>
        
        {/* 错误处理状态 */}
        {ignoreErrors && (
          <Badge 
            count={
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                padding: '0 6px'
              }}>
                <IconInfoCircle size="extra-small" style={{ color: '#ff8800' }} />
                <Typography.Text size="small" type="warning" style={{ marginLeft: '4px' }}>
                  {t('nodes.code.simplifiedView.ignoreErrors')}
                </Typography.Text>
              </div>
            }
            theme="light"
          />
        )}
      </div>
      
      <FormArrayOutputs name="inputsValues.customParams" label={t('nodes.code.simplifiedView.inputLabel')}/>
      <FormOutputs/>
    </>
  );
};

// 输入标签组件
const InputTag = ({ children, type, style }: { children: React.ReactNode, type: 'primary' | 'warning' | 'tertiary', style?: React.CSSProperties }) => {
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
      fontWeight: type !== 'tertiary' ? 'bold' : 'normal',
      ...style
    }}>
      {children}
    </div>
  );
}; 