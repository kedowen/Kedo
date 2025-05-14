import React, { type CSSProperties, useState } from 'react';

import { Popover, Typography } from '@douyinfe/semi-ui';

import { IconPad, IconPadTool } from '../../assets/icon-pad';
import { IconMouse, IconMouseTool } from '../../assets/icon-mouse';
import {  useTranslation } from 'react-i18next';

import './mouse-pad-selector.less';

const { Title, Paragraph } = Typography;

export enum InteractiveType {
  Mouse = 'MOUSE',
  Pad = 'PAD',
}

export interface MousePadSelectorProps {
  value: InteractiveType;
  onChange: (value: InteractiveType) => void;
  onPopupVisibleChange?: (visible: boolean) => void;
  containerStyle?: CSSProperties;
  iconStyle?: CSSProperties;
  arrowStyle?: CSSProperties;
}

const InteractiveItem: React.FC<{
  title: string;
  subTitle: string;
  icon: React.ReactNode;
  value: InteractiveType;
  selected: boolean;
  onChange: (value: InteractiveType) => void;
}> = ({ title, subTitle, icon, onChange, value, selected }) => (
  <div
    className={`mouse-pad-option ${selected ? 'mouse-pad-option-selected' : ''}`}
    onClick={() => onChange(value)}
  >
    <div className={`mouse-pad-option-icon ${selected ? 'mouse-pad-option-icon-selected' : ''}`}>
      {icon}
    </div>
    <Title
      heading={6}
      className={`mouse-pad-option-title ${selected ? 'mouse-pad-option-title-selected' : ''}`}
    >
      {title}
    </Title>
    <Paragraph
      type="tertiary"
      className={`mouse-pad-option-subTitle ${
        selected ? 'mouse-pad-option-subTitle-selected' : ''
      }`}
    >
      {subTitle}
    </Paragraph>
  </div>
);

export const MousePadSelector: React.FC<
  MousePadSelectorProps & React.RefAttributes<HTMLDivElement>
> = ({ value, onChange, onPopupVisibleChange, containerStyle, iconStyle, arrowStyle }) => {
  const isMouse = value === InteractiveType.Mouse;
  const [visible, setVisible] = useState(false);
  const {t} = useTranslation();

  return (
    <Popover
      trigger="custom"
      position="topLeft"
      closeOnEsc
      visible={visible}
      onVisibleChange={(v) => {
        onPopupVisibleChange?.(v);
      }}
      onClickOutSide={() => {
        setVisible(false);
      }}
      spacing={20}
      content={
        <div className={'ui-mouse-pad-selector-popover'}>
          <Typography.Title heading={4}>{t("tools.interactiveMode.title")}</Typography.Title>
          <div className={'ui-mouse-pad-selector-popover-options'}>
            <InteractiveItem
              title={t("tools.interactiveMode.mouse.title")}
              subTitle={t("tools.interactiveMode.mouse.description")}
              value={InteractiveType.Mouse}
              selected={value === InteractiveType.Mouse}
              icon={<IconMouse />}
              onChange={onChange}
            />

            <InteractiveItem
              title={t("tools.interactiveMode.touchPad.title")}
              subTitle={t("tools.interactiveMode.touchPad.description")}
              value={InteractiveType.Pad}
              selected={value === InteractiveType.Pad}
              icon={<IconPad />}
              onChange={onChange}
            />
          </div>
        </div>
      }
    >
      <div
        className={`ui-mouse-pad-selector ${visible ? 'ui-mouse-pad-selector-active' : ''}`}
        onClick={() => {
          setVisible(!visible);
        }}
        style={containerStyle}
      >
        <div className={'ui-mouse-pad-selector-icon'} style={iconStyle}>
          {isMouse ? <IconMouseTool /> : <IconPadTool />}
        </div>
      </div>
    </Popover>
  );
};
