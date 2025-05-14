import { nanoid } from 'nanoid';
import i18next from 'i18next';

import { FlowNodeRegistry } from '../../typings';
import { formMeta } from './form-meta';
import iconKnowledge from '../../assets/icon-knowledge.svg';

let index = 0;
export const KnowledgeBaseNodeRegistry: FlowNodeRegistry = {
  type: 'knowledge_base',
  info: {
    get label() {
      return i18next.t('nodes.knowledge_base.label');
    },
    icon: iconKnowledge,
    description: i18next.t('nodes.knowledge_base.description'),
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
      id: `knowledge_base_${nanoid(5)}`,
      type: 'knowledge_base',
      data: {
        title: `${i18next.t('nodes.knowledge_base.label')}_${++index}`,
        inputs: {
          type: 'object',
          properties: {
            knowledgeBase: {
              type: 'object',
              format: 'knowledge-base-selector',
              title: i18next.t('nodes.knowledge_base.inputs.knowledgeBase'),
            },
            customParams: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  type: { type: 'string' },
                  value: { type: 'any' },
                },
                required: ['name', 'type', 'value'],
              },
              default: [],
            },
          },
          required: ['knowledgeBase'],
        },
        outputs: {
          type: 'object',
          properties: {
            outputList: {
              type: 'array',
              title: i18next.t('nodes.knowledge_base.outputs.outputList'),
              description: i18next.t('nodes.knowledge_base.description'),
              items: {
                type: 'object'
              }
            },
            rowNum: {
              type: 'integer',
              title: i18next.t('nodes.knowledge_base.outputs.rowNum'),
              description: i18next.t('nodes.knowledge_base.outputs.rowNum')
            }
          }
        },
        inputsValues: {
          knowledgeBase: ''
        },
      },
    };
  },
}; 