import { nanoid } from 'nanoid';

import { FlowNodeRegistry,FxTypesEnum } from '@/typings';
import iconLLM from '../../assets/icon-llm.svg';
import { formMeta } from './form-meta';
import i18n from 'i18next';

let index = 0;
export const LLMNodeRegistry: FlowNodeRegistry = {
  type: 'llm',
  info: {
    get label() {
      return i18n.t('nodes.llm.label');
    },
    icon: iconLLM,
    get description() {
      return i18n.t('nodes.llm.description');
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
      id: `llm_${nanoid(5)}`,
      type: 'llm',
      data: {
        title: `${i18n.t('nodes.llm.label')}_${++index}`,
        inputsValues: {
          modelType: {
            label: '',
            value: '',
          },
          temperature: 0.7,
          systemPrompt: '',
          prompt: '',
          params: []
        },
        inputs: {
          type: 'object',
          required: ['modelType', 'temperature', 'prompt'],
          properties: {
            modelType: {
              type: 'object',
              description: i18n.t('nodes.llm.inputs.modelType'),
              properties: {
                type: {
                  type: 'string',
                  enum: ['expression', 'string'],
                  description: '模型类型值类型',
                },
                content: {
                  type: 'string',
                  description: '模型类型值内容',
                },
              },
            },
            temperature: {
              type: 'number',
              description: i18n.t('nodes.llm.inputs.temperature')
            },
            systemPrompt: {
              type: 'string',
              description: i18n.t('nodes.llm.inputs.systemPrompt')
            },
            prompt: {
              type: 'string',
              description: i18n.t('nodes.llm.inputs.prompt')
            },
            customParams: {
              type: 'array',
              description: i18n.t('nodes.llm.inputs.customParams'),
              items: {
                type: 'object',
                properties: {
                  key: {
                    type: 'string',
                    description: i18n.t('nodes.llm.inputs.key')
                  },
                  value: {
                    type: 'object',
                    description: i18n.t('nodes.llm.inputs.value'),
                    properties: {
                      type: {
                        type: 'string',
                        description: '参数类型',
                        enum: FxTypesEnum
                      },
                      content: {
                        type: FxTypesEnum,
                        description: '参数值'
                      }
                    }
                  }
                }
              }
            }
          },
        },
        outputs: {
          type: 'object',
          properties: {
            result: {
              type: 'string',
              description: i18n.t('nodes.llm.outputs.result')
            },
            tokens: {
              type: 'number',
              description: i18n.t('nodes.llm.outputs.tokens')
            }
          },
        },
      },
    };
  },
};
