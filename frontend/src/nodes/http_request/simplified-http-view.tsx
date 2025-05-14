import React from 'react';
import { useTranslation } from 'react-i18next';
import { Field } from '@flowgram.ai/free-layout-editor';
import { FlowLiteralValueSchema, FlowRefValueSchema } from '../../typings';
import { Typography } from '@douyinfe/semi-ui';
import { FormArrayOutputs, FormOutputs } from '@/form-components';

// 用于安全显示可能是对象的值
const safeRenderValue = (value: any): string => {
  if (value === null || value === undefined) {
    return 'http://www.baidu.com';
  }
  
  if (typeof value === 'object') {
    // 检查是否是FX表达式对象
    if (value.type === 'expression' && value.content) {
      return `{{${value.content}}}`;
    }
    // 其他对象类型转为JSON字符串
    return String(value.content);
  }
  
  return String(value);
};

// 简化的HTTP请求视图组件
export const SimplifiedHttpView = () => {
  const { t } = useTranslation();
  
  return (
    <>
      <Field<string> name="inputsValues.method">
        {({ field: methodField }) => (
          <Field<string | FlowLiteralValueSchema | FlowRefValueSchema> name="inputsValues.url">
            {({ field: urlField }) => (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                padding: '6px 8px',
                fontSize: '14px',
                width: '100%' 
              }}>
                <div style={{ 
                  backgroundColor: methodField.value === 'POST' ? '#f8bbbb' : '#ecf4ff',
                  color: methodField.value === 'POST' ? '#d32f2f' : '#1976d2',
                  fontWeight: 'bold',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  marginRight: '8px',
                  minWidth: '45px',
                  textAlign: 'center'
                }}>
                  {methodField.value || 'GET'}
                </div>
                <div style={{ 
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: '#333',
                  fontSize: '13px'
                }}>
                  {safeRenderValue(urlField.value)}
                </div>
              </div>
            )}
          </Field>
        )}
      </Field>
      
      {/* 输出参数显示 */}
      {/* <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: '6px',
        marginLeft: '8px',
        paddingBottom: '4px'
      }}>
        <Typography.Text type="tertiary" style={{ fontSize: '12px', marginRight: '8px' }}>
          {t('formComponents.formOutputs.title')}:
        </Typography.Text>
        <OutputItem label={t('nodes.http_request.outputs.body')} />
        <OutputItem label={t('nodes.http_request.outputs.statusCode')} />
        <OutputItem label={t('nodes.http_request.outputs.headers')} />
      </div> */}
      {/* <FormArrayOutputs name="inputsValues.customParams" label='请求参数' />
      <FormArrayOutputs name="inputsValues.headers" label='请求头'/> */}
      <FormOutputs />
    </>
  );
};

// 输出项组件
const OutputItem = ({ label }: { label: string }) => (
  <div style={{
    backgroundColor: '#f0f0f0',
    color: '#666',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '11px',
    marginRight: '6px',
    display: 'inline-block'
  }}>
    {label}
  </div>
); 