import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Space, Tooltip } from '@douyinfe/semi-ui';
import { useTranslation } from 'react-i18next';

import { Form, FormRenderProps } from '@flowgram.ai/free-layout-editor';
import { FlowNodeJSON } from '../../typings';
import { FormArrayOutputs, FormHeader, FormOutputs } from '@/form-components';

// 系统预设的知识库输入参数
const KB_BUILT_IN_INPUTS = ['knowledgeBase'];

// 输入标签组件
const InputTag = ({ children, type }: { children: React.ReactNode, type: 'primary' | 'warning' | 'tertiary' }) => {
  // 根据类型设置不同的颜色
  const getColor = () => {
    switch (type) {
      case 'primary':
        return { bg: '#e6f7ff', text: '#1890ff' }; // 使用知识库节点的蓝色
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

// 简化视图组件
export const SimplifiedKnowledgeBaseView = (props: FormRenderProps<FlowNodeJSON>) => {
  const { form } = props;
  const { t } = useTranslation();
  const [knowledgeBase, setKnowledgeBase] = useState<string>('');
  const [customInputParams, setCustomInputParams] = useState<Array<{key: string, type: string, value: any}>>([]);
  const [outputParams, setOutputParams] = useState<Array<string>>([]);
  const [updateKey, setUpdateKey] = useState(0); // 强制更新的key
  
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
  
  // 更新所有状态的函数
  const updateAllStates = useCallback(() => {
    if (!form || !form.values) return;
    
    // 直接从form.values获取数据（更可靠）
    const formValues = form.values as any;
    
    // 更新知识库状态
    const kbValue = formValues.inputsValues?.knowledgeBase || '';
    setKnowledgeBase(kbValue);
    
    // 更新输入参数列表 - 从customParams数组中获取参数
    const customParams = formValues.inputsValues?.customParams || [];
    if (Array.isArray(customParams)) {
      // 将参数数组转换为我们需要的格式，包括类型信息
      const paramValues = customParams.map(param => ({
        key: param.title, // 参数对象的title属性作为key
        type: param.type, // 参数类型
        value: param.value // 参数值
      }));
      
      setCustomInputParams(paramValues);
    } else {
      setCustomInputParams([]);
    }
    
    // 更新输出参数列表
    if (formValues.outputs?.properties) {
      const allOutputParams = Object.keys(formValues.outputs.properties);
      setOutputParams(allOutputParams);
    } else {
      setOutputParams([]);
    }
    
    // 强制触发重新渲染
    setUpdateKey(prev => prev + 1);
  }, [form]);
  
  // 首次加载和form变化时更新状态
  useEffect(() => {
    updateAllStates();
    
    // 自动更新状态、确保响应配置面板变化
    const interval = setInterval(updateAllStates, 500);
    
    return () => {
      clearInterval(interval);
    };
  }, [updateAllStates]);
  
  // 判断知识库是否已选择
  const isKnowledgeBaseSelected = knowledgeBase && knowledgeBase.trim() !== '';
  
  return (
    <>
      <div key={`kb-view-${updateKey}`} style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* 知识库信息 */}
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
            <Typography.Text strong style={{ fontSize: '13px', color: isKnowledgeBaseSelected ? '#18a058' : '#ff4d4f' }}>
              {t('nodes.knowledge_base.simplifiedView.knowledgeBase')}: {isKnowledgeBaseSelected ? knowledgeBase : t('nodes.knowledge_base.simplifiedView.unselected')}
            </Typography.Text>
          </div>
        </div>
        
        {/* 参数展示 */}
        {/* <div style={{ padding: '8px 10px', flex: '1' }}> */}
          {/* 输入参数 */}
          {/* <div style={{ 
            display: 'flex',
            alignItems: 'flex-start',
            marginBottom: '6px'
          }}>
            <Typography.Text type="secondary" size="small" style={{ width: '36px', paddingTop: '2px' }}>
              输入
            </Typography.Text>
            <div>
              <Space spacing={4} wrap style={{ flexWrap: 'wrap', gap: '4px' }}>
                {customInputParams.length > 0 ? (
                  <>
                    {/* 只显示前两个参数 */}
                    {/* {customInputParams.slice(0, 2).map(param => (
                      <Tooltip key={param.key} content={
                        <div style={{ maxWidth: '200px', wordBreak: 'break-all' }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{param.key}</div>
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>类型: {param.type}</div>
                          <div>{safeRenderValue(param.value)}</div>
                        </div>
                      }> */}
                        {/* <div>
                          <InputTag type="primary">{param.key}</InputTag>
                        </div>
                      </Tooltip>
                    ))}
                     */}
                    {/* 如果超过2个参数，显示+n */}
                    {/* {customInputParams.length > 2 && (
                      <Tooltip content={
                        <div style={{ maxWidth: '200px' }}>
                          {customInputParams.slice(2).map(param => (
                            <div key={param.key} style={{ marginBottom: '8px', wordBreak: 'break-all' }}>
                              <div style={{ fontWeight: 'bold' }}>{param.key}</div>
                              <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>类型: {param.type}</div>
                              <div>{safeRenderValue(param.value)}</div>
                            </div>
                          ))}
                        </div>
                      }>
                        <div>
                          <InputTag type="warning">+{customInputParams.length - 2}</InputTag>
                        </div>
                      </Tooltip>
                    )}
                  </>
                ) : (
                  <Typography.Text type="tertiary" size="small">{t('nodes.knowledge_base.simplifiedView.noCustomInputParams')}</Typography.Text>
                )}
              </Space>
            </div> */}
          {/* </div> */}
          
          {/* 输出参数 */}
          {/* <div style={{ 
            display: 'flex',
            alignItems: 'center'
          }}>
            <Typography.Text type="secondary" size="small" style={{ width: '36px' }}>
              输出
            </Typography.Text>
            <Space spacing={4}>
              {outputParams.length > 0 ? (
                outputParams.map(param => (
                  <InputTag key={param} type="tertiary">{param}</InputTag>
                ))
              ) : (
                <Typography.Text type="tertiary" size="small">无输出参数</Typography.Text>
              )}
            </Space>
          </div> */}
        {/* </div> */}
        
        <FormArrayOutputs  name="inputsValues.customParams" label={t('nodes.knowledge_base.simplifiedView.input')}/>
        <FormOutputs />
        
        {/* 底部标签信息 */}
        {/* <div style={{ 
          borderTop: '1px solid #f0f0f0',
          padding: '6px 10px',
          marginTop: 'auto'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#4299E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '6px'
              }}>
                <Typography.Text style={{ color: 'white', fontSize: '9px', fontWeight: 'bold' }}>KB</Typography.Text>
              </div>
              <Typography.Text type="secondary" size="small">
                知识库 · 检索
              </Typography.Text>
            </div>
          </div>
        </div> */}
      </div>
    </>
  );
}; 