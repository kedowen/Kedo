import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { type TreeNodeData } from '@douyinfe/semi-ui/lib/es/tree';
import { TreeSelect } from '@douyinfe/semi-ui';
import { IconEdit, IconPlus } from '@douyinfe/semi-icons';
import { NodeIntoContainerService } from '@flowgram.ai/free-container-plugin';

import { type JsonSchema } from '../../../typings';
import { ValueDisplay } from '../../../form-components';
import { useVariableTree } from './use-variable-tree';
import { useClientContext, useService } from '@flowgram.ai/free-layout-editor';
import { log } from 'console';

export interface VariableSelectorProps {
  value?: string;
  onChange: (value?: string) => void;
  options?: {
    size?: 'small' | 'large' | 'default';
    emptyContent?: JSX.Element;
    targetSchemas?: JsonSchema[];
    strongEqualToTargetSchema?: boolean;
  };
  hasError?: boolean;
  style?: React.CSSProperties;
  readonly?: boolean;
}

export const VariableSelector = ({
  value,
  onChange,
  options,
  readonly,
  style,
  hasError,
}: VariableSelectorProps) => {
  const { t } = useTranslation();
  const { size = 'small', emptyContent, targetSchemas, strongEqualToTargetSchema } = options || {};
  const context = useClientContext();
  const containerService = useService<NodeIntoContainerService>(NodeIntoContainerService);
  
  if (readonly) {
    return <ValueDisplay value={value as string} hasError={hasError} />;
  }

  const treeData = useVariableTree<TreeNodeData>({
    targetSchemas,
    strongEqual: strongEqualToTargetSchema,
    ignoreReadonly: true,
    getTreeData: ({ variable, key, icon, children, disabled, parentFields }) => {
      // 构建树节点
      const node: TreeNodeData = {
        key,
        value: key, // 选中的值包含完整路径
        icon: (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 4,
            }}
          >
            {icon}
          </span>
        ),
        // 在树中只显示变量的标题
        label: variable.meta?.title || variable.key || '',
        disabled,
        // 但选中后显示的是完整路径
        labelPath: variable.meta?.expressionTitle || 
                  [...parentFields, variable]
                    .map((_field) => _field.meta?.title || _field.key || '')
                    .join('.'),
        children,
      };
      
      return node;
    },
  });
  
  // 检查当前节点是否在循环内部
  const isInLoop = useMemo(() => {
    // 尝试使用containerService
    if (containerService && context && context.document) {
      try {
        // 尝试获取当前选中的节点
        const document = context.document;
        
        // 获取可能的当前节点ID
        let currentNodeId = null;
        
        // 从playground尝试获取选中的节点
        if (context.playground && context.playground.selectionService) {
          const selectionService = context.playground.selectionService;
          if (selectionService.selection && selectionService.selection.length > 0) {
            currentNodeId = selectionService.selection[0];
            console.log("从selection获取节点ID:", currentNodeId);
            
            // 尝试安全获取节点
            try {
              // 使用as any暂时绕过类型检查
              const id = (currentNodeId as any).id;
              if (id) {
                const node = document.getNode(id);
                if (node) {
                  // 检查节点是否在容器内（可以被移出）
                  try {
                    const canMoveOut = containerService.canMoveOutContainer(node);
                    if (canMoveOut) {
                      console.log("节点在容器内部，可以被移出");
                      return true;
                    }
                  } catch (e) {
                    console.log("检查节点是否可移出时出错:", e);
                  }
                }
              }
            } catch (error) {
              console.log("访问节点ID时出错:", error);
            }
          }
        }
      } catch (e) {
        console.log("访问文档或选中节点时出错:", e);
      }
    }
    
    // 默认为假
    return false;
  }, [containerService, context]);
  
  // 添加循环变量到树数据
  const finalTreeData = useMemo(() => {
    // 只有在循环内部才添加循环变量
    if (isInLoop) {
      const loopGroup: TreeNodeData = {
        key: '__loop__',
        value: '__loop__',
        label: t('plugins.variableSelector.loopVariables'),
        children: [
          {
            key: 'index',
            value: 'index',
            label: t('plugins.variableSelector.indexLoopVariable'),
            icon: (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 4 }}>
                <IconEdit size="small" />
              </span>
            ),
            labelPath: t('plugins.variableSelector.indexLoopVariable'),
          },
          {
            key: 'item',
            value: 'item',
            label: t('plugins.variableSelector.itemLoopVariable'),
            icon: (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 4 }}>
                <IconPlus size="small" />
              </span>
            ),
            labelPath: t('plugins.variableSelector.itemLoopVariable'),
          },
        ],
      };  
      return [loopGroup, ...treeData];
    }
    
    // 非循环内部，返回原始树数据
    return treeData;
  }, [isInLoop, treeData, t]);

  const renderEmpty = () => {
    if (emptyContent) {
      return emptyContent;
    }
    return t('plugins.variableSelector.noData');
  };

  return (
    <>
      <TreeSelect
        dropdownMatchSelectWidth={false}
        treeData={finalTreeData}
        size={size}
        value={value}
        style={{
          ...style,
          outline: hasError ? '1px solid red' : undefined,
        }}
        validateStatus={hasError ? 'error' : undefined}
        onChange={(option) => {
          // 查找选中节点
          const findNode = (nodes: TreeNodeData[], value: string): TreeNodeData | undefined => {
            for (const node of nodes) {
              if (node.value === value) {
                return node;
              }
              if (node.children && node.children.length > 0) {
                const foundNode = findNode(node.children, value);
                if (foundNode) return foundNode;
              }
            }
            return undefined;
          };
          
          const selectedNode = option ? findNode(finalTreeData, option as string) : undefined;
          
          // 只有当选中的是叶子节点时才触发onChange
          if (!selectedNode || !selectedNode.children || selectedNode.children.length === 0) {
            onChange(option as string);
          }
          // 如果是父节点，不执行任何操作，保持原来的选中状态
        }}
        showClear
        placeholder={t('plugins.variableSelector.selectVariable')}
        emptyContent={renderEmpty()}
        renderSelectedItem={(item: TreeNodeData) => {
          return (
            <span style={{ display: 'flex', alignItems: 'center' }}>
              {item.icon}
              {item.labelPath}
            </span>
          );
        }}
        leafOnly
        expandAction="click"

      />
    </>
  );
};
