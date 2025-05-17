import { nanoid } from 'nanoid';

import { FlowNodeRegistry } from '../../typings';
import { formMeta } from './form-meta';
import iconCode from '../../assets/icon-code.svg';
import i18n from 'i18next';

let index = 0;
export const CodeNodeRegistry: FlowNodeRegistry = {
  type: 'code',
  info: {
    get label() {
      return i18n.t('nodes.code.label');
    },
    icon: iconCode,
    get description() {
      return i18n.t('nodes.code.description');
    }
  },
  meta: {
    size: {
      width: 360,
      height: 305,
    },
    defaultPorts: [{ type: 'input' }, { type: 'output' }],
  },
  formMeta,
  onAdd() {
    return {
      id: `code_${nanoid(5)}`,
      type: 'code',
      data: {
        title: i18n.t('nodes.code.defaults.title', { index: ++index }),
        inputsValues: {
          codeContent: i18n.t('nodes.code.defaults.defaultCode'),
          language: 'javascript',
          ignoreErrors: false,
          input: [
            {
              title: i18n.t('nodes.code.defaults.param'),
              type: "string",
              value: i18n.t('nodes.code.defaults.defaultValue')
            }
          ]
        },
        inputs: {
          type: 'object',
          required: ['codeContent'],
          properties: {
            codeContent: {
              type: 'string',
              description: i18n.t('nodes.code.inputs.codeContent')
            },
            language: {
              type: 'string',
              description: i18n.t('nodes.code.inputs.language'),
              enum: ['javascript', 'python', 'csharp', 'bat', 'vb', 'powershell']
            },
            ignoreErrors: {
              type: 'boolean',
              description: i18n.t('nodes.code.inputs.ignoreErrors')
            },
            input: {
              type: 'array',
              description: i18n.t('nodes.code.inputs.input'),
              items: {
                type: 'object',
                properties: {
                  title: {
                    type: 'string',
                    description: i18n.t('nodes.code.params.paramName'),
                  },
                  type: {
                    type: 'string',
                    description: i18n.t('nodes.code.params.paramType'),
                  },
                  value: {
                    type: 'string',
                    description: i18n.t('nodes.code.params.paramValue'),
                  },
                },
              },
            }
          },
        },
        outputs: {
          type: 'object',
          properties: {
            key0: {
              type: 'string',
              description: i18n.t('nodes.code.outputs.key0')
            },
            key1: {
              type: 'array',
              description: i18n.t('nodes.code.outputs.key1')
            },
            key2: {
              type: 'object',
              description: i18n.t('nodes.code.outputs.key2')
            }
          },
        },
      },
    };
  },
}; 