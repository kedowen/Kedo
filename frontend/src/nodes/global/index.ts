import { FlowNodeRegistry } from '../../typings';
import iconStart from '../../assets/icon-global.svg';
import { formMeta } from './form-meta';

export const GlobalNodeRegistry: FlowNodeRegistry = {
  type: 'global',
  meta: {
    deleteDisable: false,
    copyDisable: true,
    expandable: false,
    size: {
      width: 360,
      height: 211,
    },
  },
  info: {
    label: '全局变量',
    icon: iconStart,
    description:
      '全局变量',
  },
  /**
   * Render node via formMeta
   */
  formMeta,
  /**
   * Start Node cannot be added
   */
  onAdd() {
    return {
      id: 'global_0',
      type: 'global',
      data: {
        title: '全局变量',
        outputs: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              default: 'Hello Flow.',
            },
          },
        },
      },

    };
  },
};
