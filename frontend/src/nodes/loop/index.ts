import { nanoid } from 'nanoid';
import {
  WorkflowNodeEntity,
  PositionSchema,
  FlowNodeTransformData,
} from '@flowgram.ai/free-layout-editor';
import i18n from 'i18next';

import { defaultFormMeta } from '../default-form-meta';
import { FlowNodeRegistry } from '../../typings';
import iconLoop from '@/assets/icon-loop.svg';
import { formMeta } from './form-meta';

let index = 0;
export const LoopNodeRegistry: FlowNodeRegistry = {
  type: 'loop',
  info: {
    get label() {
      return i18n.t('nodes.loop.label');
    },
    icon: iconLoop,
    get description() {
      return i18n.t('nodes.loop.description');
    }
  },
  meta: {
    isContainer: true,
    size: {
      width: 560,
      height: 400,
    },
    padding: () => ({
      top: 150,
      bottom: 100,
      left: 100,
      right: 100,
    }),
    selectable(node: WorkflowNodeEntity, mousePos?: PositionSchema): boolean {
      if (!mousePos) {
        return true;
      }
      const transform = node.getData<FlowNodeTransformData>(FlowNodeTransformData);
      // 鼠标开始时所在位置不包括当前节点时才可选中
      return !transform.bounds.contains(mousePos.x, mousePos.y);
    },
    expandable: false, // disable expanded
  },
  onAdd() {
    return {
      id: `loop_${nanoid(5)}`,
      type: 'loop',
      data: {
        title: `${i18n.t('nodes.loop.label')}_${++index}`,
        inputsValues: {
          loopTimes: {
            type: 'number',
            content: 2,
          },
        },
        inputs: {
          type: 'object',
          required: ['loopTimes'],
          properties: {
            loopTimes: {
              type: 'object',
              description: i18n.t('nodes.loop.inputs.loopTimes'),
              properties: {
                type: {
                  type: 'string',
                  enum: ['expression', 'number'],
                  description: '循环次数值类型',
                },
                content: {
                  type: 'number',
                  description: '循环次数内容',
                },
              },
            },
          },
        },
        outputs: {
          type: 'object',
          properties: {
            result: { type: 'string' },
          },
        },
      },
    };
  },
  formMeta,
  onCreate() {
    // NOTICE: 这个函数是为了避免触发固定布局 flowDocument.addBlocksAsChildren
  },
};
