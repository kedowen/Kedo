// 导入必要的库
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Input, Select, IconButton, PlusIcon, DeleteIcon } from 'some-ui-library'; // 请替换为实际使用的UI库
import { useTranslation } from 'react-i18next';

// 引入JsonSchema类型和ParamContainer样式 
import { JsonSchema, ParamContainer } from './types';

// 输出参数条目组件
const OutputParamItem: React.FC<{
  paramKey: string;
  paramDef: JsonSchema;
  path: string;
  onChange: (path: string, value: JsonSchema) => void;
  onDelete?: (path: string, key: string) => void; // 使删除操作可选，对内置参数禁用删除
  onAddChild: (path: string) => void;
  onRenameKey?: (path: string, oldKey: string, newKey: string) => void; // 使重命名操作可选，对内置参数禁用重命名
}> = ({ paramKey, paramDef, path, onChange, onDelete, onAddChild, onRenameKey }) => {
  const { t } = useTranslation();
  const [newParamKey, setNewParamKey] = useState(paramKey);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isBuiltIn = !onDelete || !onRenameKey; // 如果没有提供删除或重命名功能，则视为内置参数

  // 处理重命名完成
  const handleRenameComplete = useCallback(() => {
    if (isEditing && newParamKey && newParamKey !== paramKey && onRenameKey) {
      onRenameKey(path, paramKey, newParamKey);
    }
    setIsEditing(false);
  }, [isEditing, newParamKey, paramKey, path, onRenameKey]);

  // 处理键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameComplete();
    } else if (e.key === 'Escape') {
      setNewParamKey(paramKey);
      setIsEditing(false);
    }
  }, [handleRenameComplete, paramKey]);

  // 更新参数类型
  const updateParamType = useCallback((type: string) => {
    const newDef = { ...paramDef, type };
    onChange(`${path}.properties.${paramKey}`, newDef);
  }, [onChange, paramDef, paramKey, path]);

  // 获取子属性处理路径
  const childPropsPath = `${path}.properties.${paramKey}`;

  // 自动聚焦输入框
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div key={paramKey} style={ParamContainer}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '4px', gap: '8px' }}>
        {isEditing ? (
          <Input
            ref={inputRef}
            value={newParamKey}
            onChange={e => setNewParamKey(e.target.value)}
            onBlur={handleRenameComplete}
            onKeyDown={handleKeyDown}
            style={{ width: '40%' }}
            size="small"
          />
        ) : (
          <div
            style={{
              width: '40%',
              padding: '4px 8px',
              border: '1px solid #e0e0e0',
              borderRadius: '3px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              cursor: onRenameKey ? 'pointer' : 'default',
              backgroundColor: isBuiltIn ? '#f5f5f5' : 'white'
            }}
            onClick={() => onRenameKey && setIsEditing(true)}
            title={onRenameKey ? t('components.outputParamsEditor.params.renameKey') : isBuiltIn ? t('components.outputParamsEditor.params.system') : ""}
          >
            {paramKey}
            {isBuiltIn && <span style={{ marginLeft: '4px', color: '#999', fontSize: '12px' }}>({t('components.outputParamsEditor.params.system')})</span>}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <Select
            value={paramDef.type || 'string'}
            onChange={updateParamType}
            style={{ width: '100%' }}
            optionList={[
              { value: 'string', label: t('formComponents.typeTag.string') },
              { value: 'number', label: t('formComponents.typeTag.number') },
              { value: 'boolean', label: t('formComponents.typeTag.boolean') },
              { value: 'object', label: t('formComponents.typeTag.object') },
              { value: 'array', label: t('formComponents.typeTag.array') },
            ]}
            disabled={isBuiltIn} // 系统参数不允许修改类型
          />
        </div>
        <div>
          {paramDef.type === 'object' && (
            <IconButton onClick={() => onAddChild(childPropsPath)} disabled={isBuiltIn} title={t('components.outputParamsEditor.addSubParam')}>
              <PlusIcon />
            </IconButton>
          )}
          {onDelete && (
            <IconButton onClick={() => onDelete(path, paramKey)} title={t('components.outputParamsEditor.params.delete')}>
              <DeleteIcon />
            </IconButton>
          )}
        </div>
      </div>
      {/* 描述文本输入 */}
      <div style={{ marginTop: '8px' }}>
        <Input
          value={paramDef.description || ''}
          onChange={e => {
            const newDef = { ...paramDef, description: e.target.value };
            onChange(`${path}.properties.${paramKey}`, newDef);
          }}
          placeholder={t('components.outputParamsEditor.params.addDescription')}
          size="small"
          style={{ width: '100%' }}
          disabled={isBuiltIn} // 系统参数不允许修改描述
        />
      </div>
      {/* 子属性 */}
      {paramDef.type === 'object' && paramDef.properties && (
        <div style={{ marginLeft: '20px', marginTop: '8px' }}>
          {Object.entries(paramDef.properties).map(([key, def]) => (
            <OutputParamItem
              key={key}
              paramKey={key}
              paramDef={def as JsonSchema}
              path={childPropsPath}
              onChange={onChange}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onRenameKey={onRenameKey}
            />
          ))}
        </div>
      )}
    </div>
  );
}; 