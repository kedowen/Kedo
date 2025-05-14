import { nanoid } from 'nanoid';
import i18n from 'i18next';

import { FlowNodeRegistry, FxTypesEnum } from '@/typings';
import iconCondition from '@/assets/icon-condition.svg';
import { formMeta } from './form-meta';

export enum ConditionTypeEnum {
  IF = 'if',
  ELSE = 'else',
  ELSEIF = 'elseif',
}

export const ConditionRelationEnum = {
  EQ: '==',
  NE: '!=',
  GT: '>',
  LT: '<',
  GE: '>=',
  LE: '<=',
}

export const RelationOption = [
  {
    label: "=",
    value: ConditionRelationEnum["EQ"],
  },
  {
    label: "≠",
    value: ConditionRelationEnum["NE"],
  },
  {
    label: ">",
    value: ConditionRelationEnum["GT"],
  },
  {
    label: "<",
    value: ConditionRelationEnum["LT"],
  },
  {
    label: "≥",
    value: ConditionRelationEnum["GE"],
  },
  {
    label: "≤",
    value: ConditionRelationEnum["LE"],
  },
];


export const RelationEnum = {
  AND: '&&',
  OR: '||',
}

export const AndOrOption = [
  {
    label: i18n.t('nodes.condition.form.logical.and'),
    value: RelationEnum["AND"],
  },
  {
    label: i18n.t('nodes.condition.form.logical.or'),
    value: RelationEnum["OR"],
  },
];


export const defaultConditionValue = {
  key: `condition_${nanoid(5)}`,
  conationLeft: '',// 表达式条件
  conationRelation: ConditionRelationEnum.EQ,// 关系
  conationRight: {
    type: 'string',
    content: '',
  },// 表达式条件
}

export const defaultConditionValueWithRelation = {
  key: `condition_${nanoid(5)}`,
  relation: RelationEnum.AND,
  conationLeft: '',// 表达式条件
  conationRelation: ConditionRelationEnum.EQ,// 关系
  conationRight: {
    type: 'string',
    content: '',
  },// 表达式条件
}

let index = 0;
export const ConditionNodeRegistry: FlowNodeRegistry = {
  type: 'condition',
  info: {
    get label() {
      return i18n.t('nodes.condition.label');
    },
    icon: iconCondition,
    description: i18n.t('nodes.condition.description'),
  },
  meta: {
    defaultPorts: [{ type: 'input' }],
    // Condition Outputs use dynamic port
    useDynamicPort: true,
    expandable: false, // disable expanded
  },
  formMeta,
  onAdd() {
    return {
      id: `condition_${nanoid(5)}`,
      type: 'condition',
      data: {
        title: `${i18n.t('nodes.condition.label')}_${++index}`,
        inputsValues: {
          conditions: [
            {
              type: 'if', // if节点
              key: `if_${nanoid(5)}`,
              value: [
                defaultConditionValue,
                defaultConditionValueWithRelation,
              ],
            },
            {
              type: 'else', // else节点
              key: `else_${nanoid(5)}`,
            },
          ],
        },
        inputs: {
          type: 'object',
          properties: {
            conditions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    enum: Object.values(ConditionTypeEnum),
                    description: i18n.t('nodes.condition.inputs.expressionType'),
                  },
                  key: {
                    type: 'string',
                    description: i18n.t('nodes.condition.inputs.branchKey'),
                  },
                  values: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        key: { type: 'string' },
                        relation: {
                          type: 'string',
                          description: i18n.t('nodes.condition.inputs.relation'),
                          enum: Object.values(RelationEnum),
                        },
                        conationLeft: { 
                          type: 'expression', 
                          description: i18n.t('nodes.condition.inputs.leftExpression') 
                        },
                        conationRelation: {
                          type: 'string',
                          enum: Object.values(ConditionRelationEnum),
                          description: i18n.t('nodes.condition.inputs.relationOperator')
                        },
                        conationRight: {
                          type: 'object', properties: {
                            type: {
                              type: 'string',
                              enum: FxTypesEnum,
                              description: i18n.t('nodes.condition.inputs.contentType')
                            },
                            content: {
                              type: FxTypesEnum,
                              description: i18n.t('nodes.condition.inputs.rightExpression')
                            }
                          }
                        },
                      }
                    }
                  },
                }
              },
            },
          },
        },
      },
    };
  },
};
