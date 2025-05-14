import { FlowNodeRegistry } from '../../typings';
import iconEnd from '../../assets/icon-end.svg';
import { formMeta } from './form-meta';
import i18n from '../../utils/i18n';

export const EndNodeRegistry: FlowNodeRegistry = {
  type: 'end',
  meta: {
    deleteDisable: true,
    copyDisable: true,
    renameDisable: true,
    expandable: false,
    defaultPorts: [{ type: 'input' }],
    size: {
      width: 360,
      height: 211,
    },
  },
  info: {
    get label() {
      return i18n.t('nodes.end.label');
    },
    icon: iconEnd,
    get description() {
      return i18n.t('nodes.end.description');
    }
  },
  /**
   * Render node via formMeta
   */
  formMeta,
  /**
   * End Node cannot be added
   */
  canAdd() {
    return false;
  },
};
