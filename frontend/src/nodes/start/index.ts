import { FlowNodeRegistry } from '../../typings';
import iconStart from '../../assets/icon-start.svg';
import { formMeta } from './form-meta';
import i18n from 'i18next';

export const StartNodeRegistry: FlowNodeRegistry = {
  type: 'start',
  meta: {
    isStart: true,
    deleteDisable: true,
    copyDisable: true,
    expandable: false,
    renameDisable: true,
    defaultPorts: [{ type: 'output' }],
    size: {
      width: 360,
      height: 211,
    },
  },
  info: {
    get label() {
      return i18n.t('nodes.start.label');
    },
    icon: iconStart,
    get description() {
      return i18n.t('nodes.start.description');
    }
  },
  /**
   * Render node via formMeta
   */
  formMeta,
  /**
   * Start Node cannot be added
   */
  canAdd() {
    return false;
  },
};
