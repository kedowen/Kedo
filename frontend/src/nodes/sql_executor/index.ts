import { nanoid } from 'nanoid';
import i18n from '../../utils/i18n';

import { FlowNodeRegistry } from '../../typings';
// 使用数据库图标
import iconDatabase from '../../assets/icon-database.svg';

let index = 0;
export const sqlExecutorNode: FlowNodeRegistry = {
  type: 'sql_executor',
  info: {
    get label() {
      return i18n.t('nodes.sql_executor.label');
    },
    icon: iconDatabase,
    description: i18n.t('nodes.sql_executor.description'),
  },
  meta: {
    size: {
      width: 360,
      height: 260,
    },
    defaultPorts: [
      { type: 'input' },
      { type: 'output' }
    ],
    expandable: true,
    expanded: false,
  },
  // 此处不直接导入formMeta，而是在组件加载时动态解析
  get formMeta() {
    // 动态导入防止循环依赖
    return require('./form-meta').formMeta;
  },
  onAdd(ctx) {
    return {
      id: `sql_executor_${nanoid(5)}`,
      type: 'sql_executor',
      data: {
        title: `${i18n.t('nodes.sql_executor.label')}_${++index}`,
        inputs: {
          type: 'object',
          properties: {
            sqlQuery: {
              type: 'string',
              title: i18n.t('nodes.sql_executor.inputs.sqlQuery'),
              description: i18n.t('nodes.sql_executor.inputs.sqlQuery'),
            },
            customParams: {
              type: 'array',
              description: i18n.t('nodes.sql_executor.form.inputParams'),
              items: {
                type: 'object',
                properties: {
                  title: {
                    type: 'string',
                    description: i18n.t('formComponents.formOutputs.name'),
                  },
                  type: {
                    type: 'string',
                    description: i18n.t('formComponents.formOutputs.type'),
                  },
                  value: {
                    type: 'string',
                    description: i18n.t('formComponents.formOutputs.default'),
                  },
                },
              },
            }
          }
        },
        outputs: {
          type: 'object',
          properties: {
            outputList: {
              type: 'array',
              title: i18n.t('nodes.sql_executor.outputs.outputList'),
              items: {
                type: 'object'
              }
            },
            rowNum: {
              type: 'integer',
              title: i18n.t('nodes.sql_executor.outputs.rowNum'),
            }
          }
        },
        inputsValues: {
          sqlQuery: '',
          dataTable: '',
          customParams: []
        },
      },
    };
  },
};
