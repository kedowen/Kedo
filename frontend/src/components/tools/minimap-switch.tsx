import { Tooltip, IconButton } from '@douyinfe/semi-ui';
import { useTranslation } from 'react-i18next';
import { UIIconMinimap } from './styles';

export const MinimapSwitch = (props: {
  minimapVisible: boolean;
  setMinimapVisible: (visible: boolean) => void;
}) => {
  const { minimapVisible, setMinimapVisible } = props;
  const { t } = useTranslation();

  return (
    <Tooltip content={t('tools.minimap.title')}>
      <IconButton
        type="tertiary"
        theme="borderless"
        icon={<UIIconMinimap visible={minimapVisible} />}
        onClick={() => setMinimapVisible(!minimapVisible)}
      />
    </Tooltip>
  );
};
