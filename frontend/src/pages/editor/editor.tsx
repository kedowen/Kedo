import {
  EditorRenderer,
  FreeLayoutEditorProvider,
  FreeLayoutPluginContext,
} from "@flowgram.ai/free-layout-editor";

import "@flowgram.ai/free-layout-editor/index.css";
import "./index.css";
import { nodeRegistries } from "../../nodes";
import { initialData } from "./initial-data";
import { useEditorProps } from "@/hooks";
import { DemoTools } from "@/components/tools";
import { SidebarProvider, SidebarRenderer } from "@/components/sidebar";
import { Watermark } from "@/components/watermark";
import { ChangeLang } from "@/components";
import {
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { StoreContext } from "@/store";
import { Spin } from "@douyinfe/semi-ui";

import { awaitWrapper, loadData } from "@/api";
import { Base64 } from "js-base64";
const load = async (id: string) => {
  if (!id) return null;
  const [err, res] = await awaitWrapper(
    loadData({
      id,
    })
  );
  if (res && res.data) {
    const { f_OnionFlowSchemeData: flowData } = res.data;
    try {
      const deCodeData = JSON.parse(Base64.decode(flowData));
      console.log(">>>>> load data: ", deCodeData);
      return deCodeData;
    } catch (e) {
      console.log(">>>>> JSON err: ", e);
      return null;
    }
  } else {
    console.log(">>>>>response err: ", err);
    return null;
  }
};

export const Editor = () => {
  const { dispatch } = useContext(StoreContext);
  // 使用useMemo缓存editorProps，只有当defaultData变化时才重新计算
  const ref = useRef<FreeLayoutPluginContext | undefined>();
  const [loading, setLoading] = useState(true); // 默认为加载状态
  const editorProps = useEditorProps({ nodes: [], edges: [] }, nodeRegistries);
  useEffect(() => {
    // 获取地址栏的参数
    const urlParams = new URLSearchParams(window.location.search);
    const flowId = urlParams.get("flowId");
    flowId && dispatch({ type: "setFlowId", payload: flowId });
    const userId = urlParams.get("userId");
    userId && dispatch({ type: "setUserId", payload: userId });
    const name = urlParams.get("flowName");
    name && dispatch({ type: "setFlowName", payload: name });
    const description = urlParams.get("flowDescription");
    description &&
      dispatch({ type: "setFlowDescription", payload: description });
    // 加载数据
    const loadWorkflow = async () => {
      try {
        if (flowId) {
          const loadedData = await load(flowId);
          if (loadedData) {
            ref.current!.document.fromJSON(loadedData);
            if (loadedData?.variableList && loadedData.variableList.length > 0) {
              dispatch({
                type: "setVariableList",
                payload: loadedData.variableList,
              });
            }
          } else {
            ref.current!.document.fromJSON(initialData);
          }
          setTimeout(() => {
            // 加载后触发画布的 fitview 让节点自动居中
            ref.current!.document.fitView();
          }, 100);
        }
        setLoading(false);
      } catch (error) {
        console.error("加载工作流数据失败:", error);
        setLoading(false);
      }
    };
    loadWorkflow();
  }, []); // 只在组件挂载时执行一次
  // 只有当数据加载完成且editorProps准备好后才渲染编辑器
  return (
    <div className="doc-free-feature-overview">
      <FreeLayoutEditorProvider
        ref={ref as React.RefObject<FreeLayoutPluginContext>}
        {...editorProps}
      >
        <SidebarProvider>
          <div className="demo-container">
            <EditorRenderer className="demo-editor">
              <Watermark />
              <ChangeLang style={{position: 'absolute', top: '20px', right: '40px'}} />
            </EditorRenderer>
          </div>
        
          <DemoTools />
          <SidebarRenderer />
        </SidebarProvider>
      </FreeLayoutEditorProvider>
    </div>
  );
};
