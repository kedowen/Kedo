import { usePlaygroundTools } from '@flowgram.ai/free-layout-editor';
import { IconButton, Tooltip } from '@douyinfe/semi-ui';
import { IconExpand } from '@douyinfe/semi-icons';
import { useTranslation } from 'react-i18next';

export const FitView = () => {
  const tools = usePlaygroundTools();
  const { t } = useTranslation();
  return (
    <Tooltip content={t('tools.fitView.title')}>
      <IconButton
        icon={<IconExpand />}
        type="tertiary"
        theme="borderless"
        onClick={() => tools.fitView()}
      />
    </Tooltip>
  );
};
