import { nanoid } from 'nanoid';
import i18next from 'i18next';

import { FlowNodeRegistry } from '../../typings';
import iconHttp from '@/assets/icon-mcp.svg'; // 使用一个已有的图标来替代可能不存在的MCP图标
import { formMeta } from './form-meta';

let index = 0;
export const MCPNodeRegistry: FlowNodeRegistry = {
  type: 'mcp',
  info: {
    get label() {
      return i18next.t('nodes.mcp.label');
    },
    icon: iconHttp, // 使用HTTP请求的图标作为替代
    get description() {
      return i18next.t('nodes.mcp.description');
    }
  },
  meta: {
    size: {
      width: 360,
      height: 260,
    },
    defaultPorts: [{ type: 'input' }, { type: 'output' }],
    expandable: true,
    expanded: false,
  },
  formMeta,
  onAdd() {
    return {
      id: `mcp_${nanoid(5)}`,
      type: 'mcp',
      data: {
        title: `${i18next.t('nodes.mcp.label')}_${++index}`,
        inputs: {
          type: 'object',
          properties: {
            mcpServer: {
              type: 'string',
              title: i18next.t('nodes.mcp.inputs.mcpServer'),
              description: i18next.t('nodes.mcp.description'),
            },
            operation: {
              type: 'string',
              title: i18next.t('nodes.mcp.inputs.operation'),
              description: i18next.t('nodes.mcp.inputs.operation'),
              enum: ['sse', 'streamableHttp'],
              enumNames: [
                i18next.t('nodes.mcp.inputs.operationTypes.sse'),
                i18next.t('nodes.mcp.inputs.operationTypes.streamableHttp')
              ]
            },
            headers: {
              type: 'object',
              title: i18next.t('nodes.mcp.inputs.headers'),
              description: i18next.t('nodes.mcp.form.headersDescription'),
              additionalProperties: {
                type: 'string'
              }
            },
            enableAuth: {
              type: 'boolean',
              title: i18next.t('nodes.mcp.inputs.enableAuth'),
              description: i18next.t('nodes.mcp.inputs.enableAuth')
            },
            authType: {
              type: 'string',
              title: i18next.t('nodes.mcp.inputs.authType'),
              description: i18next.t('nodes.mcp.inputs.authType'),
              enum: ['Bearer Token', '自定义'],
              default: 'Bearer Token'
            },
            authValue: {
              type: 'string',
              title: i18next.t('nodes.mcp.inputs.authValue'),
              description: i18next.t('nodes.mcp.inputs.authValue')
            },
            authKey: {
              type: 'string',
              title: i18next.t('nodes.mcp.inputs.authKey'),
              description: i18next.t('nodes.mcp.inputs.authKey')
            },
            tokenValue: {
              type: 'string',
              title: i18next.t('nodes.mcp.inputs.tokenValue'),
              description: i18next.t('nodes.mcp.inputs.tokenValue')
            },
            authAddTo: {
              type: 'string',
              title: i18next.t('nodes.mcp.inputs.authAddTo'),
              description: i18next.t('nodes.mcp.inputs.authAddTo'),
              enum: ['Header', 'Query'],
              default: 'Header'
            }
          }
        },
        outputs: {
          type: 'object',
          properties: {
            outputList: {
              type: 'array',
              title: i18next.t('nodes.mcp.outputs.outputList'),
              description: i18next.t('nodes.mcp.description'),
              items: {
                type: 'object'
              }
            },
            rowNum: {
              type: 'integer',
              title: i18next.t('nodes.mcp.outputs.rowNum'),
              description: i18next.t('nodes.mcp.outputs.rowNum')
            }
          }
        },
        inputsValues: {
          mcpServer: '',
          operation: 'sse',
          headers: [],
          enableAuth: false,
          authType: 'Bearer Token',
          authValue: '',
          authKey: '',
          tokenValue: '',
          authAddTo: 'Header'
        },
      },
    };
  },
}; 