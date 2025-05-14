import { useState, useEffect } from "react";

import { useRefresh } from "@flowgram.ai/free-layout-editor";
import { useClientContext } from "@flowgram.ai/free-layout-editor";
import { Tooltip, IconButton, Divider } from "@douyinfe/semi-ui";
import { IconUndo, IconRedo } from "@douyinfe/semi-icons";

import { AddNode } from "../add-node";
import { Run } from "../run";
import { ZoomSelect } from "./zoom-select";
import { SwitchLine } from "./switch-line";
import { ToolContainer, ToolSection } from "./styles";
import { Save } from "./save";
import { Readonly } from "./readonly";
import { MinimapSwitch } from "./minimap-switch";
import { Minimap } from "./minimap";
import { Interactive } from "./interactive";
import { FitView } from "./fit-view";
import { AutoLayout } from "./auto-layout";
import { Load } from "./load";
import { GlobalVariable } from "./global-variable";
import { useTranslation } from "react-i18next";
export const DemoTools = () => {
  const { t } = useTranslation();
  const { history, playground } = useClientContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [minimapVisible, setMinimapVisible] = useState(true);
  useEffect(() => {
    const disposable = history.undoRedoService.onChange(() => {
      setCanUndo(history.canUndo());
      setCanRedo(history.canRedo());
    });
    return () => disposable.dispose();
  }, [history]);
  const refresh = useRefresh();

  useEffect(() => {
    const disposable = playground.config.onReadonlyOrDisabledChange(() =>
      refresh()
    );
    return () => disposable.dispose();
  }, [playground]);

  return (
    <ToolContainer className="demo-free-layout-tools">
      <ToolSection>
        <Interactive />
        <AutoLayout />
        <SwitchLine />
        <ZoomSelect />
        <FitView />
        <MinimapSwitch
          minimapVisible={minimapVisible}
          setMinimapVisible={setMinimapVisible}
        />
        <Minimap visible={minimapVisible} />
        <Readonly />
        <Tooltip content={t('tools.undo.title')}>
          <IconButton
            type="tertiary"
            theme="borderless"
            icon={<IconUndo />}
            disabled={!canUndo || playground.config.readonly}
            onClick={() => history.undo()}
          />
        </Tooltip>
        <Tooltip content={t('tools.redo.title')}>
          <IconButton
            type="tertiary"
            theme="borderless"
            icon={<IconRedo />}
            disabled={!canRedo || playground.config.readonly}
            onClick={() => history.redo()}
          />
        </Tooltip>
        <Divider layout="vertical" style={{ height: "16px" }} margin={3} />
        <GlobalVariable disabled={playground.config.readonly} />
        <Divider layout="vertical" style={{ height: "16px" }} margin={3} />
        <AddNode disabled={playground.config.readonly} />
        <Divider layout="vertical" style={{ height: "16px" }} margin={3} />
        <Save disabled={playground.config.readonly} />
        <Divider layout="vertical" style={{ height: "16px" }} margin={3} />
        <Load disabled={playground.config.readonly} />
      </ToolSection>
      <ToolSection>
        <Run disabled={playground.config.readonly} />
      </ToolSection>
    </ToolContainer>
  );
};
