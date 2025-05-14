import { useCallback } from 'react';

import { useService, WorkflowLinesManager } from '@flowgram.ai/free-layout-editor';
import { IconButton, Tooltip } from '@douyinfe/semi-ui';

import { IconSwitchLine } from '../../assets/icon-switch-line';
import { useTranslation } from 'react-i18next';

export const SwitchLine = () => {
  const linesManager = useService(WorkflowLinesManager);
  const { t } = useTranslation();
  const switchLine = useCallback(() => {
    linesManager.switchLineType();
  }, [linesManager]);

    return (
      <Tooltip content={t('tools.switchLine.title')}>
      <IconButton type="tertiary" theme="borderless" onClick={switchLine} icon={IconSwitchLine} />
    </Tooltip>
  );
};
