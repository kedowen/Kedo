import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlayground, usePlaygroundTools } from '@flowgram.ai/free-layout-editor';
import { Divider, Dropdown } from '@douyinfe/semi-ui';

import { SelectZoom } from './styles';

export const ZoomSelect = () => {
  const tools = usePlaygroundTools();
  const playground = usePlayground();
  const { t } = useTranslation();
  const [dropDownVisible, openDropDown] = useState(false);
  return (
    <Dropdown
      position="top"
      trigger="custom"
      visible={dropDownVisible}
      onClickOutSide={() => openDropDown(false)}
      render={
        <Dropdown.Menu>
          <Dropdown.Item onClick={() => tools.zoomin()}>{t('tools.zoom.in')}</Dropdown.Item>
          <Dropdown.Item onClick={() => tools.zoomout()}>{t('tools.zoom.out')}</Dropdown.Item>
          <Divider layout="horizontal" />
          <Dropdown.Item onClick={() => playground.config.updateZoom(0.5)}>
            {t('tools.zoom.to')} 50%
          </Dropdown.Item>
          <Dropdown.Item onClick={() => playground.config.updateZoom(1)}>
            {t('tools.zoom.to')} 100%
          </Dropdown.Item>
          <Dropdown.Item onClick={() => playground.config.updateZoom(1.5)}>
            {t('tools.zoom.to')} 150%
          </Dropdown.Item>
          <Dropdown.Item onClick={() => playground.config.updateZoom(2.0)}>
            {t('tools.zoom.to')} 200%
          </Dropdown.Item>
        </Dropdown.Menu>
      }
    >
      <SelectZoom onClick={() => openDropDown(true)}>{Math.floor(tools.zoom * 100)}%</SelectZoom>
    </Dropdown>
  );
};
