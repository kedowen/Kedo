import { useCallback, useMemo, useContext } from 'react';

import {
  ArrayType,
  ASTFactory,
  ASTKind,
  type BaseType,
  CustomType,
  isMatchAST,
  ObjectType,
  type UnionJSON,
  useScopeAvailable,
} from '@flowgram.ai/free-layout-editor';

import { createASTFromJSONSchema } from '../utils';
import { ArrayIcons, VariableTypeIcons } from '../icons';
import { type JsonSchema } from '../../../typings';
import { StoreContext, VariableTypesEnum } from '@/store';
import { isBoolean, isNumber } from 'lodash-es';

type VariableField = any;

interface HooksParams<TreeData> {
  // filter target type
  targetSchemas?: JsonSchema[];
  // Is it strongly type-checked?
  strongEqual?: boolean;
  // ignore global Config
  ignoreReadonly?: boolean;
  // render tree node
  getTreeData: (props: {
    key: string;
    icon: JSX.Element | undefined;
    variable: VariableField;
    parentFields: VariableField[];
    disabled?: boolean;
    children?: TreeData[];
  }) => TreeData;
}

export function useVariableTree<TreeData>({
  targetSchemas = [],
  strongEqual = false,
  ignoreReadonly = false,
  getTreeData,
}: HooksParams<TreeData>): TreeData[] {
  const available = useScopeAvailable();
  const { state } = useContext(StoreContext);

  const getVariableTypeIcon = useCallback((variable: VariableField) => {
    const _type = variable.type;

    if (isMatchAST(_type, ArrayType)) {
      return (
        (ArrayIcons as any)[_type.items?.kind.toLowerCase()] ||
        VariableTypeIcons[ASTKind.Array.toLowerCase()]
      );
    }

    if (isMatchAST(_type, CustomType)) {
      return VariableTypeIcons[_type.typeName.toLowerCase()];
    }
    // return variable.scope.meta.node._registerCache.info.icon;
    return (VariableTypeIcons as any)[variable.type?.kind.toLowerCase()];
  }, []);

  const targetTypeAST: UnionJSON = useMemo(
    () =>
      ASTFactory.createUnion({
        types: targetSchemas.map((_targetSchema) => {
          const typeAst = createASTFromJSONSchema(_targetSchema)!;
          return strongEqual ? typeAst : { ...typeAst, weak: true };
        }),
      }),
    [strongEqual, ...targetSchemas]
  );

  const checkTypeFiltered = useCallback(
    (type?: BaseType) => {
      if (!type) {
        return true;
      }

      if (targetTypeAST.types?.length) {
        return !type.isTypeEqual(targetTypeAST);
      }

      return false;
    },
    [strongEqual, targetTypeAST]
  );

  const renderVariable = (
    variable: VariableField,
    parentFields: VariableField[] = []
  ): TreeData | null => {
    let type = variable?.type;

    const isTypeFiltered = checkTypeFiltered(type);

    let children: TreeData[] | undefined;
    if (isMatchAST(type, ObjectType)) {
      children = (type.properties || [])
        .map((_property) => renderVariable(_property as VariableField, [...parentFields, variable]))
        .filter(Boolean) as TreeData[];
    }

    if (isTypeFiltered && !children?.length) {
      return null;
    }

    // 构建路径
    let path;
    // 只对variableList特殊处理，其他变量保持原始路径格式
    if (parentFields.length > 0 && parentFields[0].key.startsWith('variableList.')) {
      // 状态变量路径: variableList.变量名
      path = `variableList.${variable.key}`;
    } else {
      // 普通变量保持原始路径格式
      path = [
        ...parentFields.map((_field) => _field.meta?.titleKey || _field.key),
        variable.meta?.titleKey || variable.key,
      ].join('.');
    }

    return getTreeData({
      key: path,
      icon: getVariableTypeIcon(variable),
      variable,
      parentFields,
      children,
      disabled: isTypeFiltered,
    });
  };
  // 构建系统变量和用户变量节点
  const createStateVariablesGroup = (type: VariableTypesEnum, title: string): TreeData | null => {
    const stateVars = state.variableList.filter(v => v.type === type);

    if (stateVars.length === 0) {
      return null;
    }

    // 创建分组节点作为父节点
    const groupVariable = {
      key: `variableList.${type}`,
      meta: {
        title,  // 在树中显示的名称
      },
      type: ASTFactory.createObject({
        properties: [],
      }),
    };

    // 创建子节点时，将组变量作为父字段传递
    const children = stateVars
      .map(v => {
        const typeAst = ASTFactory.createString();
        const stateVariable = {
          key: `${type}.${v.title}`,  // 只用变量名作为键
          meta: {
            title: v.title,  // 在树中只显示变量名
            readonly: v.type === VariableTypesEnum.SYSTEM,
          },
          type: typeAst,
        };

        // 将组变量作为父字段，这样在渲染时会自动构建正确的路径
        return renderVariable(stateVariable, [groupVariable]);
      })
      .filter(Boolean) as TreeData[];

    if (children.length === 0) {
      return null;
    }

    // 创建并返回分组节点
    return getTreeData({
      key: `variableList.${type}`,
      icon: VariableTypeIcons.string as JSX.Element,
      variable: groupVariable,
      parentFields: [],
      children,
    });
  };

  // 构建普通变量列表
  const normalVariables = [
    ...available.variables
      .filter((_v) => {
        if (ignoreReadonly) {
          return !_v.meta?.readonly;
        }
        return true;
      })
      .slice(0)
      .reverse(),
  ]
    .map((_variable) => renderVariable(_variable as VariableField))
    .filter(Boolean) as TreeData[];

  // 构建状态变量组
  const systemVarsGroup = createStateVariablesGroup(VariableTypesEnum.SYSTEM, '系统变量');
  const userVarsGroup = createStateVariablesGroup(VariableTypesEnum.USER, '用户变量');

  // 合并结果
  const result: TreeData[] = [...normalVariables];

  if (systemVarsGroup) {
    result.unshift(systemVarsGroup);
  }

  if (userVarsGroup) {
    result.unshift(userVarsGroup);
  }
  return result;
}
