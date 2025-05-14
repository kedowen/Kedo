import React, { useState, useCallback, useEffect } from "react";
import { Button, Input, Typography, Space, Tooltip, Select } from "@douyinfe/semi-ui";
import { IconPlus, IconMinus, IconHelpCircle } from "@douyinfe/semi-icons";
import { Field, useForm } from "@flowgram.ai/free-layout-editor";
import { TypeSelect } from "../../form-components/type-select";
import { BasicType } from "../../typings/json-schema";
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

// 定义JsonSchema类型
interface JsonSchema {
  type?: string;
  description?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  [key: string]: any;
}

// 参数容器样式
const ParamContainer = {
  padding: "12px",
  border: "1px solid #e0e0e0",
  borderRadius: "4px",
  marginBottom: "16px",
  background: "#fafafa",
};

// 空状态样式
const EmptyStateStyle = {
  padding: "20px",
  textAlign: "center" as const,
  border: "1px dashed #ccc",
  borderRadius: "4px",
  marginBottom: "16px",
};

// 递归输出参数项组件
interface OutputParamItemProps {
  paramKey: string;
  paramDef: JsonSchema;
  path: string; // e.g., "outputs.properties.key1" or "outputs.properties.objKey.properties.childKey"
  onChange: (path: string, value: JsonSchema) => void;
  onDelete: (path: string, key: string) => void;
  onAddChild: (path: string) => void;
  onRenameKey?: (path: string, oldKey: string, newKey: string) => void;
  level?: number; // 用于缩进
}

export const OutputParamItem: React.FC<OutputParamItemProps> = ({
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
      newDef.properties = {}; // 初始化对象类型的属性
    } else if (newType !== "object") {
      delete newDef.properties; // 如果不是对象类型，则删除属性
    }
    onChange(currentPath, newDef);
  };

  // 处理删除
  const handleDelete = () => {
    onDelete(path, paramKey); // 传递父路径和要删除的键
  };

  // 添加子项
  const handleAddSubItem = () => {
    onAddChild(currentPath); // 传递当前项的路径来添加子项
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
        {/* 键输入 */}
        <Input
          value={editingKey}
          onChange={handleKeyChange}
          onBlur={handleKeyBlur}
          onEnterPress={handleKeyBlur}
          style={{
            width: "40%",
            borderColor: isObjectType ? "#4a80ff40" : "#e0e0e0",
          }}
          placeholder={t('components.outputParamsEditor.paramName')}
          size="small"
        />

        {/* 类型选择 */}
        <div style={{ flex: 1 }}>
          <Field name={typePath}>
            {({ field }) => (
              <TypeSelect
                value={(field.value as BasicType) || "string"}
                onChange={(val: string) => handleTypeChange(val)}
                style={{ width: "100%" }}
              />
            )}
          </Field>
        </div>

        {/* 操作按钮 */}
        <div style={{ display: "flex", gap: "4px" }}>
          {isObjectType && (
            <Button
              icon={<IconPlus />}
              theme="light"
              type="primary"
              size="small"
              onClick={handleAddSubItem}
              title={t('components.outputParamsEditor.addSubParam')}
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

      {/* 如果是对象类型，渲染子属性 */}
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
                path={currentPath} // 父项的路径成为子项的基础
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

// 输出参数编辑器组件属性
export interface OutputParamsEditorProps {
  // 是否禁用编辑
  disabled?: boolean;
  // 参数路径，默认为outputs
  paramPath?: string;
  // 是否应该排除系统预设的输出参数
  excludeBuiltInOutputs?: boolean;
  // 是否显示内置参数但设为只读
  showBuiltInsAsReadOnly?: boolean;
  // 系统预设的输出参数
  builtInOutputs?: string[];
  // 提示信息
  tooltipContent?: string;
  // 面板标题
  headerTitle?: string;
  // 空状态文本
  emptyText?: string;
  // 添加按钮文本
  addButtonText?: string;
  // 允许编辑内置系统参数
  allowEditBuiltIns?: boolean;
}

// 输出参数编辑器组件
export const OutputParamsEditor: React.FC<OutputParamsEditorProps> = ({
  disabled = false,
  paramPath = "outputs",
  excludeBuiltInOutputs = false,
  showBuiltInsAsReadOnly = false,
  builtInOutputs = [],
  tooltipContent,
  headerTitle,
  emptyText,
  addButtonText,
  allowEditBuiltIns = false
}) => {
  const { t } = useTranslation();
  
  // 使用国际化翻译替代默认值
  const tooltipContentValue = tooltipContent || t('components.outputParamsEditor.tooltip');
  const headerTitleValue = headerTitle || t('components.outputParamsEditor.headerTitle');
  const emptyTextValue = emptyText || t('components.outputParamsEditor.emptyText');
  const addButtonTextValue = addButtonText || t('components.outputParamsEditor.addButtonText');

  const form = useForm();
  
  // 安全提交表单
  const safeSubmitForm = useCallback(() => {
    try {
      if (form && typeof (form as any).submit === 'function') {
        setTimeout(() => (form as any).submit(), 0);
      }
    } catch (error) {
      console.error(t('components.outputParamsEditor.warning.syncError'), error);
    }
  }, [form, t]);

  // 检查参数是否是内置参数
  const isBuiltInOutput = useCallback((key: string) => {
    return builtInOutputs.includes(key);
  }, [builtInOutputs]);

  // 处理输出参数变更，防止修改内置参数
  const handleOutputChange = useCallback((path: string, value: JsonSchema) => {
    // 提取参数名称，检查是否为内置参数
    const pathParts = path.split('.');
    const paramKey = pathParts[pathParts.length - 1];
    
    // 如果是内置参数并且设置了保护，则不允许修改
    if (isBuiltInOutput(paramKey) && showBuiltInsAsReadOnly && !allowEditBuiltIns) {
      console.warn(t('components.outputParamsEditor.warning.builtInModifyBlocked', { paramKey }));
      return;
    }
    
    form?.setValueIn(path, value);
    safeSubmitForm();
  }, [form, safeSubmitForm, isBuiltInOutput, showBuiltInsAsReadOnly, allowEditBuiltIns, t]);
  
  // 处理删除输出参数，防止删除内置参数
  const handleDeleteOutput = useCallback((path: string, key: string) => {
    // 检查是否为内置参数
    if (isBuiltInOutput(key) && showBuiltInsAsReadOnly && !allowEditBuiltIns) {
      console.warn(t('components.outputParamsEditor.warning.builtInDeleteBlocked', { paramKey: key }));
      return;
    }
    
    // 获取当前路径的所有属性
    const propertiesPath = `${path}.properties`;
    const properties = form?.getValueIn(propertiesPath) || {};
    
    // 删除指定的属性
    const { [key]: deleted, ...rest } = properties;
    
    // 更新回表单
    form?.setValueIn(propertiesPath, rest);
    
    // 提交表单
    safeSubmitForm();
  }, [form, safeSubmitForm, isBuiltInOutput, showBuiltInsAsReadOnly, allowEditBuiltIns, t]);

  // 处理添加子输出参数
  const handleAddChildOutput = useCallback((parentPath: string) => {
    // 检查父路径是否对应内置参数
    const pathParts = parentPath.split('.');
    const paramKey = pathParts[pathParts.length - 1];
    
    // 如果父路径是内置参数并且设置了保护，则不允许添加子参数
    if (isBuiltInOutput(paramKey) && showBuiltInsAsReadOnly && !allowEditBuiltIns) {
      console.warn(t('components.outputParamsEditor.warning.builtInAddChildBlocked', { paramKey }));
      return;
    }
    
    // 获取父节点下的所有属性
    const propertiesPath = `${parentPath}.properties`;
    const properties = form?.getValueIn(propertiesPath) || {};
    
    // 生成新属性名
    let newName = t('components.outputParamsEditor.newProperty');
    let index = 1;
    while (properties[newName]) {
      newName = `${t('components.outputParamsEditor.newProperty')}${index++}`;
    }
    
    // 确保新名称不是内置参数名
    if (isBuiltInOutput(newName)) {
      console.warn(`新参数名 ${newName} 与内置参数冲突，生成新的名称`);
      while (isBuiltInOutput(newName)) {
        newName = `customProperty${index++}`;
      }
    }
    
    // 更新属性
    form?.setValueIn(`${propertiesPath}.${newName}`, {
      type: 'string',
      title: newName,
      description: t('components.outputParamsEditor.newProperty')
    });
    
    // 提交表单
    safeSubmitForm();
  }, [form, safeSubmitForm, isBuiltInOutput, showBuiltInsAsReadOnly, allowEditBuiltIns, t]);

  // 处理输出参数重命名
  const handleRenameKey = useCallback((path: string, oldKey: string, newKey: string) => {
    // 检查原名称是否为内置参数
    if (isBuiltInOutput(oldKey) && showBuiltInsAsReadOnly && !allowEditBuiltIns) {
      console.warn(t('components.outputParamsEditor.warning.builtInRenameBlocked', { paramKey: oldKey }));
      return;
    }
    
    if (oldKey === newKey) return;
    
    // 获取当前路径的所有属性
    const propertiesPath = `${path}.properties`;
    const properties = form?.getValueIn(propertiesPath) || {};
    
    // 确保新键名不存在
    if (properties[newKey]) {
      console.warn(t('components.outputParamsEditor.warning.keyExists', { newKey }));
      return;
    }
    
    // 确保新键名不是内置参数名
    if (isBuiltInOutput(newKey) && !allowEditBuiltIns) {
      console.warn(t('components.outputParamsEditor.warning.renameToBuiltIn', { newKey }));
      return;
    }
    
    // 提取要重命名的属性值
    const valueToMove = properties[oldKey];
    
    // 创建新的属性集合
    const newProperties = { ...properties };
    delete newProperties[oldKey];
    newProperties[newKey] = valueToMove;
    
    // 更新属性
    form?.setValueIn(propertiesPath, newProperties);
    
    // 提交表单
    safeSubmitForm();
  }, [form, safeSubmitForm, isBuiltInOutput, showBuiltInsAsReadOnly, allowEditBuiltIns, t]);
  
  // 添加顶级输出参数
  const addTopLevelOutput = useCallback(() => {
    try {
      // 获取现有的输出属性
      const propertiesPath = `${paramPath}.properties`;
      const outputProps = form?.getValueIn(propertiesPath) || {};
      
      // 生成新参数名
      let newOutputName = t('components.outputParamsEditor.newOutput');
      let index = 1;
      while (outputProps[newOutputName]) {
        newOutputName = `${t('components.outputParamsEditor.newOutput')}${index++}`;
      }
      
      // 确保新名称不是内置参数名
      if (isBuiltInOutput(newOutputName) && !allowEditBuiltIns) {
        console.warn(`新参数名 ${newOutputName} 与内置参数冲突，生成新的名称`);
        while (isBuiltInOutput(newOutputName)) {
          newOutputName = `customOutput${index++}`;
        }
      }
      
      // 创建新的输出参数
      const newOutputParameter = {
        type: 'string',
        title: newOutputName,
        description: t('components.outputParamsEditor.newOutput')
      };
      
      // 更新outputs.properties
      const updatedOutputProps = {
        ...outputProps,
        [newOutputName]: newOutputParameter
      };
      
      form?.setValueIn(propertiesPath, updatedOutputProps);
      
      // 提交表单
      safeSubmitForm();
    } catch (error) {
      console.error('添加输出参数失败', error);
    }
  }, [form, paramPath, isBuiltInOutput, safeSubmitForm, allowEditBuiltIns, t]);

  return (
    <div style={{ width: "100%" }}>
      {/* <div style={{ 
        fontSize: '14px', 
        display: 'flex', 
        alignItems: 'center',
        fontWeight: 'bold',
        marginBottom: '12px'
      }}>
        <span>{headerTitleValue}</span>
        {tooltipContentValue && (
          <Tooltip content={tooltipContentValue} position="right">
            <IconHelpCircle style={{ marginLeft: 4, color: '#888', cursor: 'help' }} />
          </Tooltip>
        )}
      </div> */}
      
      <Space vertical align="start" style={{ width: '100%' }}>
        {/* 使用Field监听outputs.properties的变化 */}
        <Field name={`${paramPath}.properties`}>
          {({ field }) => {
            const outputProps = field.value as Record<string, JsonSchema> || {};
            
            // 处理显示逻辑
            let displayItems: JSX.Element[] = [];
            
            if (showBuiltInsAsReadOnly && !allowEditBuiltIns) {
              // 先添加内置参数（只读）
              const builtInItems = Object.entries(outputProps)
                .filter(([key]) => isBuiltInOutput(key))
                .map(([key, def]) => (
                  <OutputParamItem
                    key={key}
                    paramKey={key}
                    paramDef={def}
                    path={paramPath}
                    onChange={handleOutputChange}
                    onDelete={handleDeleteOutput}
                    onAddChild={handleAddChildOutput}
                    onRenameKey={handleRenameKey}
                  />
                ));
                
              // 再添加自定义参数
              const customItems = Object.entries(outputProps)
                .filter(([key]) => !isBuiltInOutput(key))
                .map(([key, def]) => (
                  <OutputParamItem
                    key={key}
                    paramKey={key}
                    paramDef={def}
                    path={paramPath}
                    onChange={handleOutputChange}
                    onDelete={handleDeleteOutput}
                    onAddChild={handleAddChildOutput}
                    onRenameKey={handleRenameKey}
                  />
                ));
                
              displayItems = [...builtInItems, ...customItems];
            } else if (excludeBuiltInOutputs && !allowEditBuiltIns) {
              // 仅显示非内置参数
              displayItems = Object.entries(outputProps)
                .filter(([key]) => !isBuiltInOutput(key))
                .map(([key, def]) => (
                  <OutputParamItem
                    key={key}
                    paramKey={key}
                    paramDef={def}
                    path={paramPath}
                    onChange={handleOutputChange}
                    onDelete={handleDeleteOutput}
                    onAddChild={handleAddChildOutput}
                    onRenameKey={handleRenameKey}
                  />
                ));
            } else {
              // 显示所有参数
              displayItems = Object.entries(outputProps)
                .map(([key, def]) => (
                  <OutputParamItem
                    key={key}
                    paramKey={key}
                    paramDef={def}
                    path={paramPath}
                    onChange={handleOutputChange}
                    onDelete={handleDeleteOutput}
                    onAddChild={handleAddChildOutput}
                    onRenameKey={handleRenameKey}
                  />
                ));
            }
                
            return (
              <>
                {displayItems.length > 0 ? (
                  displayItems
                ) : (
                  <div style={EmptyStateStyle}>
                    <Text type="tertiary">{emptyTextValue}</Text>
                  </div>
                )}
              </>
            );
          }}
        </Field>
        
        {/* 添加新输出参数的按钮 */}
        {!disabled && (
          <Button 
            type="primary"
            theme="light"
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '8px'
            }}
            onClick={addTopLevelOutput}
          >
            <IconPlus style={{ marginRight: '4px' }} />
            {addButtonTextValue}
          </Button>
        )}
      </Space>
    </div>
  );
}; 