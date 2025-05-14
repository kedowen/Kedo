import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlayground } from '@flowgram.ai/free-layout-editor';
import { IconButton,Tooltip } from '@douyinfe/semi-ui';
import { IconUnlock, IconLock } from '@douyinfe/semi-icons';

export const Readonly = () => {
  const playground = usePlayground();
  const { t } = useTranslation();
  const toggleReadonly = useCallback(() => {
    playground.config.readonly = !playground.config.readonly;
  }, [playground]);
  return playground.config.readonly ? (
    <Tooltip content={t('tools.lock.isUnlock')}>
      <IconButton
        theme="borderless"
        type="tertiary"
        icon={<IconLock size="default" />}
        onClick={toggleReadonly}
      />
    </Tooltip>
  ) : (
    <Tooltip content={t('tools.lock.isLock')}>
      <IconButton
        theme="borderless"
        type="tertiary"
        icon={<IconUnlock size="default" />}
        onClick={toggleReadonly}
      />
    </Tooltip>
  );
};
