import React, { useState, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Input, Button, Checkbox, Tooltip, JsonViewer, Typography, Switch } from '@douyinfe/semi-ui';
import { IconCrossCircleStroked, IconHelpCircle, IconChevronDown, IconChevronUp } from '@douyinfe/semi-icons';

import { JsonSchema } from '../../typings';
import { VariableSelector } from '../../plugins/sync-variable-plugin/variable-selector';
import { LeftColumn, Row, RequiredBadge } from './styles';
import { TypeSelect } from '../type-select';
import { TypeDefault } from '../type-default';

const { Text } = Typography;

// 定义额外属性的类型接口
interface ExtraProps {
  literal?: boolean;
  formComponent?: string;
  required?: boolean;
  [key: string]: any; // 添加索引签名
}

export interface PropertyEditProps {
  propertyKey: string;
  value: JsonSchema;
  useFx?: boolean;
  disabled?: boolean;
  hideRequired?: boolean;
  nodeType?: 'start' | 'end' | string;
  onChange: (value: JsonSchema, propertyKey: string, newPropertyKey?: string) => void;
  onDelete?: () => void;
}

export const PropertyEdit: React.FC<PropertyEditProps> = (props) => {
  const { t } = useTranslation();
  const { value, disabled, hideRequired } = props;
  const [inputKey, updateKey] = useState(props.propertyKey);
  const isRequired = value.extra?.required || false;
  const [expanded, setExpanded] = useState(props.nodeType === 'end' ? true : false);

  const updateProperty = (key: keyof JsonSchema, val: any) => {
    value[key] = val;
    props.onChange(value, props.propertyKey);
  };

  const updateExtraProperty = (key: string, val: any) => {
    if (!value.extra) {
      value.extra = {} as ExtraProps;
    }
    (value.extra as ExtraProps)[key] = val;
    props.onChange(value, props.propertyKey);
  };

  const handleRequiredChange = (checked: boolean) => {
    updateExtraProperty('required', checked);
  };

  useLayoutEffect(() => {
    updateKey(props.propertyKey);
  }, [props.propertyKey]);

  // 切换展开/收缩状态
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // 渲染参数名和类型行
  const renderFirstRow = () => (
    <Row>
      <LeftColumn>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Input
            value={inputKey}
            disabled={disabled}
            placeholder={t('formComponents.propertiesEdit.inputVariableName')}
            onChange={(v) => updateKey(v.trim())}
            onBlur={() => {
              if (inputKey !== '') {
                props.onChange(value, props.propertyKey, inputKey);
              } else {
                updateKey(props.propertyKey);
              }
            }}
            style={{ width: '100%' }}
          />
        </div>
      </LeftColumn>
      <div style={{ width: '140px', marginLeft: '8px' }}>
        <TypeSelect
          value={value.type}
          disabled={disabled}
          onChange={(val) => {
            // 先保存旧类型
            const oldType = value.type;
            
            // 更新类型
            updateProperty('type', val);
            
            // 当类型变更时，清空默认值并设置适当的初始值
            if (oldType !== val) {
              let initialValue: any = '';
              
              // 如果是End节点，对象和数组类型应该保持默认值为字符串
              if (props.nodeType === 'end' && (val === 'object' || val === 'array')) {
                // 对于End节点，确保默认值是字符串
                initialValue = '';
              } else {
                switch(val) {
                  case 'object':
                    initialValue = {};
                    break;
                  case 'array':
                    initialValue = [];
                    break;
                  case 'number':
                  case 'integer':
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
              }
              
              // 更新默认值
              updateProperty('default', initialValue);
            }
          }}
          style={{ width: '100%' }}
        />
      </div>
      {!disabled && !hideRequired && props.nodeType !== 'end' && (
        <Checkbox
          checked={isRequired}
          onChange={(e) => handleRequiredChange(e.target.checked || false)}
          style={{ marginLeft: 8, marginRight: 8 }}
        />
      )}
      {props.nodeType === 'end' ? (
        <div style={{ width: 50 }}></div>  // 当是end节点时，添加空白div保持布局
      ) : (
        <Tooltip content={expanded ? t('formComponents.propertiesEdit.collapse') : t('formComponents.propertiesEdit.expand')}>
          <Button
            theme="borderless"
            type="tertiary"
            icon={expanded ? <IconChevronUp /> : <IconChevronDown />}
            onClick={toggleExpanded}
            style={{ marginRight: 4 }}
          />
        </Tooltip>
      )}
      {props.onDelete && !disabled && (
        <Button theme="borderless" icon={<IconCrossCircleStroked />} onClick={props.onDelete} />
      )}
    </Row>
  );

  // 渲染默认值行 - 结束节点特殊处理
  const renderDefaultValueRow = () => {
    // 如果是结束节点，始终显示默认值区域（不受expanded状态影响）
    // 如果是其他节点，仅在展开状态显示

    if (expanded) {
      // 对于End节点，当类型是object或array时，确保default值是字符串
      if (props.nodeType === 'end' && (value.type === 'object' || value.type === 'array')) {
        // 确保default值为字符串类型
        if (typeof value.default === 'object') {
          updateProperty('default', '');
        }
      }

      return (
        <Row style={{ marginTop: '8px' }}>
          <div style={{ width: '100%' }}>
            <div style={{ marginBottom: '4px', fontSize: '12px', color: '#666' }}>
              {props.nodeType === 'end' ? t('formComponents.propertiesEdit.referenceData') : t('formComponents.propertiesEdit.defaultValue')}
            </div>
            {props.useFx || props.nodeType === 'end' ? (
              <VariableSelector
                value={typeof value.default === 'object' ? '' : value.default}
                onChange={(val) => updateProperty('default', val)}
                style={{ width: '100%', height: 32 }}
                options={props.nodeType === 'end' ? {
                  size: 'default',
                  emptyContent: <div>{t('formComponents.propertiesEdit.selectReferenceParam')}</div>
                } : undefined}
              />
            ) : (
              <TypeDefault 
                type={value.type || 'string'} 
                value={value} 
                disabled={disabled}
                onChange={(updatedValue) => {
                  // 更新整个value对象
                  props.onChange(updatedValue, props.propertyKey);
                }}
              />
            )}
          </div>
        </Row>
      );
    }
    return null;
  };

  // 渲染描述行
  const renderDescriptionRow = () => {
    // 结束节点不显示描述，其他节点在展开状态才显示
    if (props.nodeType !== 'end' && expanded) {
      return (
        <Row style={{ marginTop: '8px' }}>
          <div style={{ width: '100%' }}>
            <div style={{ marginBottom: '4px', fontSize: '12px', color: '#666' }}>{t('formComponents.propertiesEdit.description')}</div>
            <Input
              disabled={disabled}
              value={value.description || ''}
              placeholder={t('formComponents.propertiesEdit.parameterHelpText')}
              onChange={(val) => updateProperty('description', val)}
              style={{ width: '100%' }}
            />
          </div>
        </Row>
      );
    }
    return null;
  };

  return (
    <div style={{ marginBottom: '16px', padding: '8px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
      {renderFirstRow()}
      {renderDefaultValueRow()}
      {renderDescriptionRow()}
    </div>
  );
};
