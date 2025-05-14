import { useState, useEffect, useCallback, useContext } from "react";
import { useTranslation } from 'react-i18next';
import { saveData, awaitWrapper, modifyData, uploadFileToOSS } from "@/api";

import {
  useClientContext,
  getNodeForm,
  FlowNodeEntity,
  type WorkflowEdgeJSON,
} from "@flowgram.ai/free-layout-editor";
import { Button, Badge, Toast } from "@douyinfe/semi-ui";
import { Base64 } from "js-base64";
import { StoreContext } from "@/store";

/**
 * Captures a screenshot of the editor interface and converts it to base64
 * @param selector - CSS selector for the element to capture (defaults to the editor container)
 * @returns Promise with base64 string of the screenshot
 */
const captureScreenshot = async (selector = "#root") => {
  // Dynamic import of html2canvas (requires adding to package.json)
  const html2canvasModule = await import("html2canvas").catch(() => {
    console.error(
      "html2canvas module is not available, please install it first"
    );
    return null;
  });

  if (!html2canvasModule) {
    return null;
  }

  const html2canvas = html2canvasModule.default;
  const element = document.querySelector(selector);

  if (!element) {
    console.error(`Element with selector "${selector}" not found`);
    return null;
  }

  try {
    const canvas = await html2canvas(element as HTMLElement, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      scale: 1,
    });
    // 返回blob
    return canvas;
  } catch (error) {
    console.error("Failed to capture screenshot:", error);
    return null;
  }
};

/**
 * Hook for saving workflow data with built-in validation
 * @returns Functions and state for saving workflow
 */
export function useWorkflowSave() {
  const clientContext = useClientContext();
  const { state, dispatch } = useContext(StoreContext);
  const { t } = useTranslation();

  // 获取所有被连接的节点
  const getLinkedNodes = useCallback(() => {
    // 获取文档的JSON数据，其中包含edges信息
    const documentJSON = clientContext.document.toJSON();
    const allNodes = clientContext.document.getAllNodes();

    // 从JSON中获取边缘信息
    const edges = documentJSON.edges || [];

    // 找出已被链接的节点ID
    const linkedNodeIds = new Set<string>();
    edges.forEach((edge) => {
      if (edge.sourceNodeID) linkedNodeIds.add(edge.sourceNodeID);
      if (edge.targetNodeID) linkedNodeIds.add(edge.targetNodeID);
    });

    // 筛选出被链接的节点
    return allNodes.filter((node) => linkedNodeIds.has(node.id));
  }, [clientContext]);

  // 验证已连接节点的内部函数
  const validateLinkedNodes = useCallback(async () => {
    // 获取被链接的节点
    const linkedNodes = getLinkedNodes();

    // 验证所有被链接的节点
    const linkedForms = linkedNodes.map((node) => getNodeForm(node));
    const validationResults = await Promise.all(
      linkedForms.map(async (form) => {
        if (!form) return true; // 如果没有表单，视为有效
        await form.validate();
        return !form.state.invalid; // 返回验证结果，true表示验证通过
      })
    );
    
    // 返回所有节点是否都通过验证
    return validationResults.every(result => result === true);
  }, [getLinkedNodes]);

  const saveWorkflow = useCallback(async (executeId?: string) => {
    if (!state.userId) {
      Toast.error(t('tools.save.errors.noUser'));
      return { err: { message: t('tools.save.errors.noUser') }, res: null };
    }
    // 验证连接的节点
    const isValid = await validateLinkedNodes();
    
    // 如果验证失败，提示用户并中断保存操作
    if (!isValid) {
      Toast.error(t('tools.save.errors.validationFailed'));
      return { err: { message: t('tools.save.errors.validationFailed') }, res: null };
    }

    // 获取文档数据并编码
    const data = clientContext.document.toJSON();
    let variableList = state.variableList;
    
    // 如果提供了新的executeId，则更新sys_executeId变量
    if (executeId) {
      variableList = variableList.map(item => 
        item.title === "sys_executeId" ? { ...item, value: executeId } : item
      );
    }
    
    console.log(">>>>> variableList: ", variableList);
    const base64Data = Base64.encode(JSON.stringify({
      ...data,
      variableList,
    }));

    // 对当前界面截图并转为base64
    const screenshotCanvas = await captureScreenshot(".demo-container");

    // 先执行上传图片
    let uploadUrl = "";
    if (screenshotCanvas) {
      try {
        // Convert canvas to blob with a Promise to make it easier to await
        const blob = await new Promise<Blob | null>((resolve) => {
          screenshotCanvas.toBlob((blob) => resolve(blob), "image/png");
        });

        if (blob) {
          const [err, res] = await awaitWrapper(
            uploadFileToOSS(blob, state.userId, `${state.flowId}.png`)
          );
          if (res) {
            console.log(">>>>> upload file to oss success: ", res);
            uploadUrl = res.data; // Store the URL returned from the server
          } else {
            console.error(">>>>> upload file to oss failed: ", err);
          }
        } else {
          console.error("Failed to convert canvas to blob");
        }
      } catch (error) {
        console.error("Error during file upload: ", error);
      }
    }

    // 根据是否有flowId决定创建新流程或更新现有流程
    if (state.flowId) {
      // 更新现有流程
      const [err, res] = await awaitWrapper(
        modifyData({
          f_Id: state.flowId,
          f_Caption: state.flowName,
          f_Description: state.flowDescription,
          f_OnionFlowSchemeData: base64Data,
          f_Type: "0",
          f_ModifyUserId: state.userId,
          f_ImgUrl: uploadUrl,
        })
      );
      Toast.success(t('tools.save.success'));
      return { err, res };
    } else {
      // 创建新流程
      const [err, res] = await awaitWrapper(
        saveData({
          f_Caption: state.flowName,
          f_CreateUserId: state.userId,
          f_IndustryCategory: "",
          f_Description: state.flowDescription,
          f_OnionFlowSchemeData: base64Data,
          f_Type: "0",
          f_TeamId: "",
          f_TeamOnionFlowFileGroup: "",
        })
      );
      if (res && res.data) {
        dispatch({ type: "setFlowId", payload: res.data });
        Toast.success(t('tools.save.success'));
      }
      return { err, res };
    }
  }, [clientContext, state, dispatch, validateLinkedNodes, t]);

  return {
    getLinkedNodes,
    saveWorkflow,
    validateLinkedNodes, // 暴露验证函数，以便需要时单独使用
  };
}

/**
 * Hook for error validation and tracking
 * @returns Error count and update function
 */
export function useNodeErrorValidation() {
  const [errorCount, setErrorCount] = useState(0);
  const clientContext = useClientContext();

  const updateValidateData = useCallback(() => {
    const allForms = clientContext.document
      .getAllNodes()
      .map((node) => getNodeForm(node))
      .filter(form => form !== null && form !== undefined); // Filter out null/undefined forms
    
    const count = allForms.filter((form) => form.state.invalid).length;
    setErrorCount(count);
  }, [clientContext]);

  // 监听节点验证
  useEffect(() => {
    // 立即检查一次当前的验证状态
    updateValidateData();
    
    const listenSingleNodeValidate = (node: FlowNodeEntity) => {
      const form = getNodeForm(node);
      if (form) {
        const formValidateDispose = form.onValidate(() => updateValidateData());
        node.onDispose(() => formValidateDispose.dispose());
      }
    };

    // 对所有现有节点添加监听
    clientContext.document
      .getAllNodes()
      .forEach((node) => listenSingleNodeValidate(node));

    // 监听新创建的节点
    const dispose = clientContext.document.onNodeCreate(({ node }) =>
      listenSingleNodeValidate(node)
    );

    // 清理函数
    return () => dispose.dispose();
  }, [clientContext, updateValidateData]);

  return { errorCount };
}

/**
 * Save Button Component
 */
export function Save(props: { disabled: boolean }) {
  const { state } = useContext(StoreContext);
  const { saveWorkflow } = useWorkflowSave();
  const { errorCount } = useNodeErrorValidation();
  const { t } = useTranslation();
  
  // 创建一个处理点击事件的函数
  const handleSaveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    saveWorkflow();
  };
  
  if (errorCount === 0) {
    return (
      <Button
        disabled={props.disabled}
        onClick={handleSaveClick}
        style={{
          backgroundColor: "rgba(171,181,255,0.3)",
          borderRadius: "8px",
        }}
      >
        {t('tools.save.title')}
      </Button>
    );
  }

  return (
    <Badge 
      count={errorCount} 
      position="rightTop" 
      type="danger"
      overflowCount={99}
    >
      <Button
        type="danger"
        disabled={props.disabled}
        onClick={handleSaveClick}
        style={{
          backgroundColor: "rgba(255, 179, 171, 0.3)",
          borderRadius: "8px",
        }}
        title={`有 ${errorCount} 个节点存在验证错误，请修复后再保存`}
      >
        {t('tools.save.title')}
      </Button>
    </Badge>
  );
}
