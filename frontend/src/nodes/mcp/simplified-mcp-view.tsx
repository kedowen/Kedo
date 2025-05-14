import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Space, Tooltip } from '@douyinfe/semi-ui';
import { useTranslation } from 'react-i18next';

import { FormRenderProps } from '@flowgram.ai/free-layout-editor';
import { FlowNodeJSON } from '../../typings';
import { FormArrayOutputs, FormHeader, FormOutputs } from '@/form-components';

// 系统预设的MCP输入参数
const MCP_BUILT_IN_INPUTS = ['mcpServer', 'operation', 'enableAuth', 'authType', 'authValue', 'authKey', 'tokenValue', 'authAddTo'];
// 系统预设的MCP输出参数
const MCP_BUILT_IN_OUTPUTS = ['outputList', 'rowNum'];

// 输入标签组件
const InputTag = ({ children, type }: { children: React.ReactNode, type: 'primary' | 'warning' | 'tertiary' }) => {
  // 根据类型设置不同的颜色
  const getColor = () => {
    switch (type) {
      case 'primary':
        return { bg: '#e6f7ff', text: '#1890ff' }; // 蓝色
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
export const SimplifiedMCPView = (props: FormRenderProps<FlowNodeJSON>) => {
  const { form } = props;
  const { t } = useTranslation();
  const [mcpServer, setMcpServer] = useState<string>('');
  const [operation, setOperation] = useState<string>('');
  const [enableAuth, setEnableAuth] = useState<boolean>(false);
  const [authType, setAuthType] = useState<string>('');
  const [authValue, setAuthValue] = useState<any>('');
  const [customInputParams, setCustomInputParams] = useState<Array<{key: string, value: any}>>([]);
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
        return `{{${value.content || ''}}}`;
      }
      // 对象类型截断显示
      try {
        const jsonStr = JSON.stringify(value);
        return jsonStr.length > 30 
          ? jsonStr.substring(0, 27) + '...'
          : jsonStr;
      } catch (err) {
        return t('nodes.mcp.simplifiedView.complexObject');
      }
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
    
    try {
      // 直接从form.values获取数据（更可靠）
      const formValues = form.values as any;
      
      // 更新MCP服务器状态
      const serverValue = formValues.inputsValues?.mcpServer || '';
      setMcpServer(serverValue);
      
      // 更新操作类型状态
      const opValue = formValues.inputsValues?.operation || '';
      setOperation(opValue);
      
      // 更新鉴权相关状态
      setEnableAuth(!!formValues.inputsValues?.enableAuth);
      setAuthType(formValues.inputsValues?.authType || 'Bearer Token');
      setAuthValue(formValues.inputsValues?.authValue || '');
      
      // 更新输入参数列表
      if (formValues.inputs?.properties) {
        const allParams = Object.keys(formValues.inputs.properties);
        const filteredParams = allParams.filter(param => !MCP_BUILT_IN_INPUTS.includes(param));
        
        // 获取参数值
        const paramValues = filteredParams.map(key => ({
          key,
          value: formValues.inputsValues?.[key] !== undefined ? formValues.inputsValues[key] : null
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
    } catch (error) {
      console.error('更新状态失败', error);
    }
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
  
  // 判断服务器是否已设置
  const isMcpServerSet = mcpServer && 
    (typeof mcpServer === 'string' ? mcpServer.trim() !== '' : 
     (typeof mcpServer === 'object' && mcpServer && mcpServer.content));
  
  // 获取操作类型显示名称
  const getOperationDisplayName = () => {
    if (!operation) return 'SSE';
    
    if (operation === 'sse') {
      return t('nodes.mcp.simplifiedView.operationTypes.sse');
    } else if (operation === 'streamableHttp') {
      return t('nodes.mcp.simplifiedView.operationTypes.streamableHttp');
    }
    
    return String(operation);
  };
  
  // 获取操作类型的背景色
  const getOperationBgColor = () => {
    if (operation === 'sse') {
      return '#f0f7ff'; // 蓝色背景
    } else if (operation === 'streamableHttp') {
      return '#f9f0ff'; // 紫色背景
    }
    return '#f0f7ff';
  };
  
  // 获取操作类型的文字颜色
  const getOperationTextColor = () => {
    if (operation === 'sse') {
      return '#1890ff'; // 蓝色文字
    } else if (operation === 'streamableHttp') {
      return '#722ed1'; // 紫色文字
    }
    return '#1890ff';
  };
  
  // 获取鉴权状态信息
  const getAuthStatusInfo = () => {
    if (!enableAuth) {
      return { text: t('nodes.mcp.simplifiedView.authStatus.disabled'), color: '#999' };
    }

    if (authType === 'Bearer Token') {
      return { 
        text: authValue ? t('nodes.mcp.simplifiedView.authStatus.bearerSet') : t('nodes.mcp.simplifiedView.authStatus.bearerNotSet'), 
        color: authValue ? '#18a058' : '#ff4d4f' 
      };
    } else {
      return { 
        text: t('nodes.mcp.simplifiedView.authStatus.custom'), 
        color: '#1890ff' 
      };
    }
  };

  // 获取鉴权状态显示
  const authStatusInfo = getAuthStatusInfo();
  
  return (
    <>
      {/* <FormHeader /> */}
      <div key={`mcp-view-${updateKey}`} style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* MCP信息 */}
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
            <Typography.Text strong style={{ fontSize: '13px', color: isMcpServerSet ? '#18a058' : '#ff4d4f' }}>
              {t('nodes.mcp.simplifiedView.server')}: {isMcpServerSet ? safeRenderValue(mcpServer) : t('nodes.mcp.simplifiedView.serverNotSet')}
            </Typography.Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              padding: '2px 6px',
              backgroundColor: '#f0f7ff',
              borderRadius: '4px',
              fontSize: '12px',
              color: authStatusInfo.color,
              fontWeight: 'bold'
            }}>
              {t('nodes.mcp.simplifiedView.auth')}: {authStatusInfo.text}
            </div>
            <div style={{ 
              padding: '2px 6px',
              backgroundColor: getOperationBgColor(),
              borderRadius: '4px',
              fontSize: '12px',
              color: getOperationTextColor(),
              fontWeight: 'bold'
            }}>
              {getOperationDisplayName()}
            </div>
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
                  customInputParams.map(param => (
                    <Tooltip key={param.key} content={
                      <div style={{ maxWidth: '200px', wordBreak: 'break-all' }}>
                        <Typography.Text>{param.key}: {safeRenderValue(param.value)}</Typography.Text>
                      </div>
                    }>
                      <div>
                        <InputTag type="primary">{param.key}</InputTag>
                      </div>
                    </Tooltip>
                  ))
                ) : (
                  <Typography.Text type="tertiary" size="small">{t('nodes.mcp.simplifiedView.noCustomInputParams')}</Typography.Text>
                )}
              </Space>
            </div>
          </div> */}
          
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
                <Typography.Text style={{ color: 'white', fontSize: '9px', fontWeight: 'bold' }}>M</Typography.Text>
              </div>
              <Typography.Text type="secondary" size="small">
                MCP · {getOperationDisplayName()}
              </Typography.Text>
            </div>
          </div>
        </div> */}
        <FormArrayOutputs name="inputsValues.customParams" label={t('nodes.mcp.simplifiedView.input')}/>
        <FormOutputs />
      </div>
    </>
  );
}; 