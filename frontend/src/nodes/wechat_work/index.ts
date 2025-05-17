import { nanoid } from 'nanoid';
import i18n from '../../utils/i18n';

import { FlowNodeRegistry } from '../../typings';
// 使用专用的企业微信图标
import iconWechatWork from '../../assets/icon-wechatWork.svg';
import { formMeta } from './form-meta';

let index = 0;
export const WechatWorkNodeRegistry: FlowNodeRegistry = {
  type: 'wechat_work',
  info: {
    get label() {
      return i18n.t('nodes.wechat_work.label');
    },
    icon: iconWechatWork,
    get description() {
      return i18n.t('nodes.wechat_work.description')
    }
  },
  meta: {
    size: {
      width: 360,
      height: 260,
    },
    defaultPorts: [
      { type: 'input', name: i18n.t('nodes.wechat_work.ports.input') },
      { type: 'output', name: i18n.t('nodes.wechat_work.ports.output') }
    ],
    expandable: false,
    expanded: false,
  },
  formMeta,
  onAdd() {
    return {
      id: `wechat_work_${nanoid(5)}`,
      type: 'wechat_work',
      data: {
        title: `${i18n.t('nodes.wechat_work.label')}_${++index}`,
        inputsValues: {
          recipient: {
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
          } // 使用空字符串作为初始值，而不是表达式对象
        },
        inputs: {
          type: 'object',
          required: ['recipient', 'subject', 'content'],
          properties: {
            recipient: {
              type: 'object',
              title: i18n.t('nodes.wechat_work.inputs.recipient.title'),
              description: i18n.t('nodes.wechat_work.inputs.recipient.description'),
              properties: {
                type: {
                  type: 'string',
                  enum: ['expression', 'string'],
                  description: i18n.t('nodes.wechat_work.inputs.recipient.type'),
                },
                content: {
                  type: 'string',
                  description: i18n.t('nodes.wechat_work.inputs.recipient.content'),
                }
              },
            },
            subject: {
              type: 'object',
              title: i18n.t('nodes.wechat_work.inputs.subject.title'),
              description: i18n.t('nodes.wechat_work.inputs.subject.description'),
              properties: {
                type: {
                  type: 'string',
                  enum: ['expression', 'string'],
                  description: i18n.t('nodes.wechat_work.inputs.subject.type'),
                },
                content: {
                  type: 'string',
                  description: i18n.t('nodes.wechat_work.inputs.subject.content'),
                }
              },
            },
            content: {
              type: 'object',
              title: i18n.t('nodes.wechat_work.inputs.content.title'),
              description: i18n.t('nodes.wechat_work.inputs.content.description'),
              properties: {
                type: {
                  type: 'string',
                  enum: ['expression', 'string'],
                  description: i18n.t('nodes.wechat_work.inputs.content.type'),
                },
                content: {
                  type: 'string',
                  description: i18n.t('nodes.wechat_work.inputs.content.content'),
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
              description: i18n.t('nodes.wechat_work.outputs.result')
            },
            success: {
              type: 'boolean',
              description: i18n.t('nodes.wechat_work.outputs.success')
            }
          },
        },
      },
    };
  },
};