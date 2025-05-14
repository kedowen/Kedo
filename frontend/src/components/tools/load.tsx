import { useCallback, useContext } from "react";
import {
  useClientContext,
  useRefresh,
  useWorkflowDocument,
} from "@flowgram.ai/free-layout-editor";

import { Button, Tooltip } from "@douyinfe/semi-ui";
import { IconUpload } from "@douyinfe/semi-icons";
import { awaitWrapper, loadData } from "@/api";
import { StoreContext } from "@/store";
import { Base64 } from "js-base64";
import { useTranslation } from 'react-i18next';

export function Load(props: { disabled: boolean }) {
  const { playground } = useClientContext();
  const refresh = useRefresh();
  const { state } = useContext(StoreContext);
  const workflowDocument = useWorkflowDocument();
  const { t } = useTranslation();

  const handleLoad = useCallback(async () => {
    if (playground.config.readonly) return;
    if (!state.flowId) return;
    const [err, res] = await awaitWrapper(
      loadData({
        id: state.flowId,
      })
    );
    if (res && res.data) {
      const { f_AgentData: flowData } = res.data;
      const deCodeData = JSON.parse(Base64.decode(flowData));
      console.log(">>>>> load data: ", deCodeData);
      workflowDocument.reload(deCodeData);
      refresh();
    } else {
      console.log(">>>>> err: ", err);
    }
  }, [playground.config.readonly, refresh, state.flowId]);

  return (
    <Tooltip content={t('tools.load.title')}>
      <Button
        disabled={props.disabled}
        onClick={handleLoad}
        style={{
          backgroundColor: "rgba(171,181,255,0.3)",
          borderRadius: "8px",
        }}
      >
        {t('tools.load.title')}
      </Button>
    </Tooltip>
  );
}
