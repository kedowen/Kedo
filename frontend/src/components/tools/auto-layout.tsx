import { useCallback } from 'react';

import { usePlayground, usePlaygroundTools } from '@flowgram.ai/free-layout-editor';
import { IconButton, Tooltip } from '@douyinfe/semi-ui';

import { IconAutoLayout } from '@/assets/icon-auto-layout';
import { useTranslation } from "react-i18next";

export const AutoLayout = () => {
  const tools = usePlaygroundTools();
  const playground = usePlayground();
  const { t } = useTranslation();
  const autoLayout = useCallback(async () => {
    await tools.autoLayout();
  }, [tools]);

  return (
    <Tooltip content={t('tools.automaticLayout.title')}>
      <IconButton
        disabled={playground.config.readonly}
        type="tertiary"
        theme="borderless"
        onClick={autoLayout}
        icon={IconAutoLayout}
      />
    </Tooltip>
  );
};
