import { nanoid } from 'nanoid';
import i18n from '../../utils/i18n';

import { FlowNodeRegistry } from '../../typings';
// 使用专用的邮箱图标
import iconEmail from '../../assets/icon-email.svg';
import { formMeta } from './form-meta';

let index = 0;
export const EmailNodeRegistry: FlowNodeRegistry = {
  type: 'email',
  info: {
    get label() {
      return i18n.t('nodes.email.label');
    },
    icon: iconEmail,
    description: i18n.t('nodes.email.description'),
  },
  meta: {
    size: {
      width: 360,
      height: 260,
    },
    defaultPorts: [
      { type: 'input', name: i18n.t('nodes.email.ports.input') },
      { type: 'output', name: i18n.t('nodes.email.ports.output') }
    ],
    expandable: false,
    expanded: false,
  },
  formMeta,
  onAdd() {
    return {
      id: `email_${nanoid(5)}`,
      type: 'email',
      data: {
        title: `${i18n.t('nodes.email.label')}_${++index}`,
        inputsValues: {
          email: {
            type: 'string',
            content: '',
          },
          subject: {
            type: 'string',
            content: '',
          },
          content: {
            type: 'string',
            content: '',
          },
        },
        inputs: {
          type: 'object',
          required: ['email', 'subject', 'content'],
          properties: {
            email: {
              type: 'object',
              title: i18n.t('nodes.email.inputs.email.title'),
              description: i18n.t('nodes.email.inputs.email.description'),
              properties: {
                type: {
                  type: 'string',
                  enum: ['expression', 'string'],
                  description: i18n.t('nodes.email.inputs.email.type'),
                },
                content: {
                  type: 'string',
                  description: i18n.t('nodes.email.inputs.email.content'),
                }
              },
            },
            subject: {
              type: 'object',
              title: i18n.t('nodes.email.inputs.subject.title'),
              description: i18n.t('nodes.email.inputs.subject.description'),
              properties: {
                type: {
                  type: 'string',
                  enum: ['expression', 'string'],
                  description: i18n.t('nodes.email.inputs.subject.type'),
                },
                content: {
                  type: 'string',
                  description: i18n.t('nodes.email.inputs.subject.content'),
                }
              },
            },
            content: {
              type: 'object',
              title: i18n.t('nodes.email.inputs.content.title'),
              description: i18n.t('nodes.email.inputs.content.description'),
              properties: {
                type: {
                  type: 'string',
                  enum: ['expression', 'string'],
                  description: i18n.t('nodes.email.inputs.content.type'),
                },
                content: {
                  type: 'string',
                  description: i18n.t('nodes.email.inputs.content.content'),
                }
              }
            },
          },
        },
        outputs: {
          type: 'object',
          properties: {
            result: {
              type: 'string',
              description: i18n.t('nodes.email.outputs.result')
            },
            success: {
              type: 'boolean',
              description: i18n.t('nodes.email.outputs.success')
            }
          },
        },
      },
    };
  },
}; 