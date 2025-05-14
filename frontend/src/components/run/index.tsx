import {
  Button,
  Form,
  Input,
  InputNumber,
  SideSheet,
  Switch,
  JsonViewer,
  Notification,
  Typography,
  Modal,
  Collapse,
  Toast,
  MarkdownRender,
  Empty,
  Image,
  ImagePreview,
  Popover,
  Chat,
} from "@douyinfe/semi-ui";
import {
  IconEyeClosed,
  IconEyeOpened,
  IconTreeTriangleRight,
  IconStop,
  IconChevronDown,
  IconChevronRight,
  IconArrowDown,
  IconArrowUp,
  IconImport,
  IconExport,
  IconClear,
  IconDelete,
  IconClose,
} from "@douyinfe/semi-icons";
import logo from "@/assets/logo_o.svg";
import iconUser from "@/assets/icon-user.svg";
import { useTranslation } from "react-i18next";

import { useRun } from "./use-run";
import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useContext,
} from "react";
import * as ReactDOM from "react-dom";
import { FormFiledProps } from "./use-run";
import {
  ConfigBtnContainer,
  PreviewButton,
  ResultDisplayContainer,
  ResultDisplayItem,
  ResultHeader,
  ResultKey,
  ResultKeyValue,
  ResultSectionTitle,
  ResultTitle,
  ResultValue,
  StyledCollapse,
  TypeLabel,
} from "./styles";

import iconRun from "@/assets/icon-run.svg";
import {
  Field,
  getNodeForm,
  useRefresh,
  useClientContext,
  FlowNodeEntity,
  WorkflowDocument,
  useService,
  WorkflowLinesManager,
} from "@flowgram.ai/free-layout-editor";
import { nanoid } from "nanoid";
import { awaitWrapper, execute, getExecuteResult } from "@/api";
import { StoreContext } from "@/store";
import { FormItem, TypeDefault } from "@/form-components";
import { BasicType } from "@/typings/json-schema";
import { useWorkflowSave } from "@/components/tools/save";
import { isEmpty } from "lodash-es";
import iconConfig from "@/assets/icon-config.svg";
import emptyImage from "@/assets/empty.svg";
import { StyledSideSheet } from "@/components/sidebar/styles";
import { Header, Title, Icon } from "@/form-components/form-header/styles";
import { SidebarContext } from "@/context";

// 检测是否为markdown内容
const isMarkdown = (content: string): boolean => {
  try {
    // 简单数字、空字符串或者太短的内容不太可能是markdown
    if (!content || content.length < 10 || !isNaN(Number(content))) {
      return false;
    }
    // 检查是否包含典型的markdown标记
    const markdownPatterns = [
      /^#+ .*$/m, // 标题
      /\*\*.+\*\*/, // 粗体
      /\*.+\*/, // 斜体
      /\[.+\]\(.+\)/, // 链接
      /!\[.+\]\(.+\)/, // 图片
      /```[\s\S]*```/, // 代码块
      /^\s*[*-] .+$/m, // 无序列表
      /^\s*\d+\. .+$/m, // 有序列表
      /^\s*>.+$/m, // 引用
      /\|.+\|.+\|/, // 表格
      /^---+$/m, // 分割线
    ];
    // 至少匹配一种markdown特征即可判定为markdown
    return markdownPatterns.some((pattern) => pattern.test(content));
  } catch (e) {
    return false;
  }
};

function isValidUrl(url: string): boolean {
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
  return urlRegex.test(url);
}
// 验证是否为图片链接
const isImageUrl = (url: string) => {
  const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i;
  return imageExtensions.test(url);
};

const validateImageArray = (arrayString: string) => {
  try {
    const arr = JSON.parse(arrayString);
    if (!Array.isArray(arr) || arr.length === 0) {
      return false;
    }
    // 验证是否所有元素都是 URL
    const allUrls = arr.every(isValidUrl);
    if (!allUrls) {
      return false;
    }
    // 验证是否所有 URL 都是图片资源
    const allImages = arr.every(isImageUrl);
    if (!allImages) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
};

// 创建一个独立的结果显示组件，不使用useNodeRender钩子
export const ResultDisplay = ({
  node,
  result,
}: {
  node: FlowNodeEntity;
  result?: any;
}) => {
  const { Text, Title } = Typography;
  const [visible, setVisible] = useState(false);
  const [markdownContent, setMarkdownContent] = useState("");
  const [expandedKeys, setExpandedKeys] = useState<string[]>([
    "inputs",
    "outputs",
  ]);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  // 直接获取节点表单数据
  const form = getNodeForm(node);
  const nodeTitle = form?.values?.title || "节点";
  const parseResult = JSON.parse(result);

  const showMarkdownModal = (content: string) => {
    const modalContent = <MarkdownRender raw={content} />;
    setModalContent(modalContent);
    setVisible(true);
  };
  const showImageModal = (content: string) => {
    const arr = JSON.parse(content);

    const imageList = arr.map((str: string, index: number) => {
      return (
        <Image
          key={index}
          src={str}
          alt={str}
          width={150}
          height={150}
          style={{
            overflow: "visible",
            objectFit: "cover",
            borderRadius: "4px",
          }}
        />
      );
    });
    const modalContent = (
      <ImagePreview
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {imageList}
      </ImagePreview>
    );
    setModalContent(modalContent);
    setVisible(true);
  };

  const renderKeyValuePair = (
    key: string,
    value: any,
    isOutputs: boolean = false
  ) => {
    const strValue =
      value === undefined || value === null
        ? "null"
        : typeof value === "object"
        ? JSON.stringify(value, null, 2)
        : String(value);

    return (
      <ResultKeyValue key={key}>
        <ResultKey>{key}：</ResultKey>
        <ResultValue>
          {strValue}
          {isMarkdown(strValue) && (
            <PreviewButton
              type="tertiary"
              theme="borderless"
              size="small"
              icon={<IconEyeOpened />}
              style={{ marginLeft: "8px" }}
              onClick={() => showMarkdownModal(strValue)}
            >
              预览
            </PreviewButton>
          )}
          {validateImageArray(strValue) && (
            <PreviewButton
              type="tertiary"
              theme="borderless"
              size="small"
              icon={<IconEyeOpened />}
              style={{ marginLeft: "8px" }}
              onClick={() => showImageModal(strValue)}
            >
              预览图片
            </PreviewButton>
          )}
        </ResultValue>
      </ResultKeyValue>
    );
  };

  return (
    <ResultDisplayContainer>
      <ResultHeader>
        <ResultTitle>{nodeTitle} - 执行结果</ResultTitle>
      </ResultHeader>

      {parseResult !== undefined ? (
        typeof parseResult === "object" ? (
          <StyledCollapse
            defaultActiveKey={expandedKeys}
            onChange={(keys: string[]) => setExpandedKeys(keys as string[])}
          >
            {parseResult?.inputs &&
              Object.keys(parseResult.inputs).length > 0 && (
                <Collapse.Panel
                  header={
                    <ResultSectionTitle>
                      <IconImport
                        style={{
                          fontSize: "14px",
                          marginRight: "6px",
                          color: "#0072F5",
                        }}
                      />
                      输入结果
                    </ResultSectionTitle>
                  }
                  itemKey="inputs"
                >
                  <ResultDisplayItem>
                    {Object.keys(parseResult.inputs).map((key) =>
                      renderKeyValuePair(key, parseResult.inputs[key])
                    )}
                  </ResultDisplayItem>
                </Collapse.Panel>
              )}

            {parseResult?.outputs &&
              Object.keys(parseResult.outputs).length > 0 && (
                <Collapse.Panel
                  header={
                    <ResultSectionTitle>
                      <IconExport
                        style={{
                          fontSize: "14px",
                          marginRight: "6px",
                          color: "#FF9800",
                        }}
                      />
                      输出结果
                    </ResultSectionTitle>
                  }
                  itemKey="outputs"
                >
                  <ResultDisplayItem>
                    {Object.keys(parseResult.outputs).map((key) =>
                      renderKeyValuePair(key, parseResult.outputs[key], true)
                    )}
                  </ResultDisplayItem>
                </Collapse.Panel>
              )}
          </StyledCollapse>
        ) : (
          <Text>{parseResult?.toString()}</Text>
        )
      ) : (
        <Text type="tertiary">节点未返回结果</Text>
      )}

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <IconEyeOpened style={{ marginRight: "8px", color: "#4caf50" }} />
            <span>预览</span>
          </div>
        }
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={600}
      >
        <div
          style={{
            padding: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {modalContent}
        </div>
      </Modal>
    </ResultDisplayContainer>
  );
};

// 用于线条动画的全局样式
const GlobalStyles = () => {
  useEffect(() => {
    // 只在客户端渲染时添加样式
    if (typeof document === "undefined") return;

    if (!document.getElementById("line-animation-styles")) {
      const styleEl = document.createElement("style");
      styleEl.id = "line-animation-styles";
      styleEl.innerHTML = `
        @keyframes flowAnimation {
          0% {
            stroke-dashoffset: 20;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        
        .animated-line {
          stroke: #4CAF50 !important;
          stroke-width: 2.5px !important;
          stroke-dasharray: 5, 5 !important;
          animation: flowAnimation 1s linear infinite !important;
          filter: drop-shadow(0 0 3px rgba(76, 175, 80, 0.5)) !important;
        }
        
        .highlighted-line {
          stroke: #ff9800 !important;
          stroke-width: 2px !important;
          transition: stroke 0.3s ease, stroke-width 0.3s ease;
        }
      `;
      document.head.appendChild(styleEl);
    }

    // 清理函数
    return () => {
      const styleEl = document.getElementById("line-animation-styles");
      if (styleEl) {
        styleEl.remove();
      }
    };
  }, []);

  return null;
};

const { Label } = Form;
const FormFiled = ({
  form,
  onChange,
}: {
  form: FormFiledProps[];
  onChange: (updatedForm: FormFiledProps[]) => void;
}) => {
  console.log(form);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (index: number, newValue: any) => {
    // Create a new copy of the form data
    const updatedForm = [...form];
    // Update the value at the specified index
    updatedForm[index] = {
      ...updatedForm[index],
      value: newValue,
    };

    // Clear error for this field when value changes
    if (formErrors[updatedForm[index].name]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[updatedForm[index].name];
        return updated;
      });
    }

    // Call the onChange callback with the updated form data
    onChange(updatedForm);
  };

  // Validate the entire form and return result
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    form.forEach((item) => {
      if (
        item.required &&
        (item.value === undefined || item.value === null || item.value === "")
      ) {
        newErrors[item.name] = `${item.name}不能为空`;
        isValid = false;
      }
    });

    setFormErrors(newErrors);
    return isValid;
  };

  const formList = form.map((item, index) => {
    // Convert FormFiledProps to JsonSchema format for TypeDefault
    const jsonSchemaValue = {
      type: item.type as BasicType,
      default: item.value,
      title: item.name,
      extra: {
        required: item.required,
      },
    };

    return (
      <div key={item.name}>
        <Label
          text={item.name}
          required={item.required}
          extra={<TypeLabel>{item.type}</TypeLabel>}
          style={{ display: "flex", alignItems: "center" }}
        />
        <TypeDefault
          type={item.type as BasicType}
          value={jsonSchemaValue}
          onChange={(newValue) => {
            console.log("New value:", newValue);
            // Call the handler with index and new value
            handleFieldChange(index, newValue.default);
          }}
        />
        {formErrors[item.name] && (
          <div
            style={{
              color: "var(--semi-color-danger)",
              fontSize: "12px",
              marginTop: "4px",
            }}
          >
            {formErrors[item.name]}
          </div>
        )}
      </div>
    );
  });

  return (
    <Form style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {formList}
    </Form>
  );
};
// Expose validateForm to parent
FormFiled.displayName = "FormFiled";
// SideSheet Footer component
const SideSheetFooter = ({
  isRunning,
  executeWorkflow,
  handleStopPolling,
  formChildren,
  showResults,
  wasExecutionStopped,
  errorNodes,
}: {
  isRunning: boolean;
  executeWorkflow: () => void;
  handleStopPolling: () => void;
  showResults: boolean;
  formChildren: React.ReactNode;
  wasExecutionStopped: boolean;
  errorNodes: string[];
}) => {
  const { t } = useTranslation();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        border: "1px solid var(--semi-color-border)",
        borderRadius: 8,
        padding: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <Popover
          trigger="click"
          content={<div style={{ padding: 12 }}>{formChildren}</div>}
        >
          <ConfigBtnContainer>
            <img
              style={{ width: "20px", height: "20px" }}
              src={iconConfig}
              alt=""
            />
            <span>{t("tools.run.sideSheet.footer.config.title")}</span>
          </ConfigBtnContainer>
        </Popover>
        {isRunning ? (
          <Button
            icon={<IconStop style={{ fontSize: "14px" }} />}
            style={{
              background: "linear-gradient(135deg, #FF5252 0%, #f44336 100%)",
              color: "#fff",
              width: "120px",
              height: "32px",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: 500,
              boxShadow: "0 2px 6px rgba(244, 67, 54, 0.2)",
              transition: "all 0.3s ease",
              border: "none",
            }}
            onClick={handleStopPolling}
          >
            {t("tools.run.sideSheet.footer.stop.title")}
          </Button>
        ) : (
          <Button
            type="primary"
            theme="solid"
            style={{
              width: "120px",
              height: "32px",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: 500,
              boxShadow: "0 2px 6px rgba(24, 144, 255, 0.2)",
              transition: "all 0.3s ease",
              background: "linear-gradient(135deg, #40a9ff 0%, #1890ff 100%)",
              border: "none",
            }}
            icon={<IconTreeTriangleRight style={{ fontSize: "14px" }} />}
            loading={isRunning}
            loadingProps={{ type: "spinner" }}
            onClick={executeWorkflow}
          >
            {t("tools.run.sideSheet.footer.execute.title")}
          </Button>
        )}
      </div>
    </div>
  );
};

// 单个节点结果组件 - 使用React Portal
const NodeResult = ({
  node,
  result,
}: {
  node: FlowNodeEntity;
  result: any;
}) => {
  // 用于跟踪portal目标元素是否已创建
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  );

  // 组件挂载时创建容器元素
  useEffect(() => {
    if (!node.renderData?.node || typeof document === "undefined") return;

    // 检查是否已存在结果容器
    const existingContainer = document.getElementById(
      `result-container-${node.id}`
    );
    if (existingContainer) {
      setPortalContainer(existingContainer);
      return;
    }

    // 创建新的容器
    const container = document.createElement("div");
    container.id = `result-container-${node.id}`;
    container.className = "node-result-container";

    // 添加到节点DOM
    node.renderData.node.appendChild(container);
    setPortalContainer(container);

    // 清理函数 - React会自动处理portal内容的卸载
    return () => {
      // 使用安全的方式移除容器
      if (container && document.body.contains(container)) {
        try {
          // 如果是常规的父子关系
          if (container.parentNode) {
            container.parentNode.removeChild(container);
          } else {
            container.remove();
          }
        } catch (e) {
          console.warn(`安全移除节点 ${node.id} 的结果容器失败:`, e);
          // 忽略错误，让浏览器自己处理DOM清理
        }
      }

      setPortalContainer(null);
    };
  }, [node]);

  // 如果没有容器，不渲染任何内容
  if (!portalContainer) return null;

  // 使用React Portal将内容渲染到节点DOM中
  return ReactDOM.createPortal(
    <ResultDisplay node={node} result={result} />,
    portalContainer
  );
};
export const Run = (props: { disabled: boolean }) => {
  const [visible, setVisible] = useState(false);
  const { isValid, getRunProperties } = useRun();
  const [showResults, setShowResults] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [errorNodes, setErrorNodes] = useState<string[]>([]);
  const [form, setForm] = useState<FormFiledProps[]>([]);
  const [formRef, setFormRef] = useState<any>(null);
  const { state, dispatch } = useContext(StoreContext);
  const { saveWorkflow, getLinkedNodes } = useWorkflowSave();
  const { selection } = useClientContext();
  const { nodeRender, setNodeRender } = useContext(SidebarContext);
  // 聊天消息数组
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  const { t, i18n } = useTranslation();

  // 初始化系统消息
  useEffect(() => {
    setChatMessages([
      {
        role: "system",
        direction: "incoming",
        content: t("tools.run.sideSheet.chat.system.prompt"),
        createAt: new Date().toLocaleTimeString(),
      },
    ]);
  }, []);

  // 存储节点执行结果
  const [nodeResults, setNodeResults] = useState<Map<string, any>>(new Map());
  // 存储当前高亮的线条
  const [highlightedLines, setHighlightedLines] = useState<string[]>([]);
  // 存储当前流动动画的线条
  const [animatedLines, setAnimatedLines] = useState<string[]>([]);
  // 存储当前执行的节点ID
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  // 控制是否停止轮询
  const [shouldStopPolling, setShouldStopPolling] = useState(false);
  // 使用ref来跟踪停止状态，避免闭包问题
  const stopPollingRef = useRef(false);
  // 记录执行是否被用户停止(这个状态会被保留，用于结果显示)
  const [wasExecutionStopped, setWasExecutionStopped] = useState(false);

  const context = useClientContext();
  const flowDocument = context.document;

  // 清除所有高亮和动画
  const clearAllLineEffects = useCallback(() => {
    try {
      // 先更新状态
      setHighlightedLines([]);
      setAnimatedLines([]);

      // 安全地清除DOM元素上的类
      if (typeof document !== "undefined") {
        try {
          document.querySelectorAll(".highlighted-line").forEach((el) => {
            el.classList.remove("highlighted-line");
          });

          document.querySelectorAll(".animated-line").forEach((el) => {
            el.classList.remove("animated-line");
          });
        } catch (domError) {
          console.warn("清除线条动画类时出错:", domError);
        }
      }
    } catch (error) {
      console.error("清除线条效果时出错:", error);
    }
  }, []);

  // 应用高亮和动画效果
  useEffect(() => {
    try {
      // 确保在浏览器环境中执行
      if (typeof document === "undefined") return;

      // 应用高亮效果
      document.querySelectorAll(".highlighted-line").forEach((el) => {
        el.classList.remove("highlighted-line");
      });

      highlightedLines.forEach((lineId) => {
        const lineElement = document.querySelector(
          `[data-line-id="${lineId}"] path`
        );
        if (lineElement) {
          lineElement.classList.add("highlighted-line");
        }
      });

      // 应用动画效果
      document.querySelectorAll(".animated-line").forEach((el) => {
        el.classList.remove("animated-line");
      });

      animatedLines.forEach((lineId) => {
        const lineElement = document.querySelector(
          `[data-line-id="${lineId}"] path`
        );
        if (lineElement) {
          lineElement.classList.add("animated-line");
        }
      });

      // 确保副作用清理
      return () => {
        try {
          if (document) {
            document
              .querySelectorAll(".highlighted-line, .animated-line")
              .forEach((el) => {
                el.classList.remove("highlighted-line", "animated-line");
              });
          }
        } catch (cleanupError) {
          console.warn("清理动画效果时出错:", cleanupError);
        }
      };
    } catch (effectError) {
      console.error("应用线条效果时出错:", effectError);
      return () => {}; // 返回空函数避免清理时的错误
    }
  }, [highlightedLines, animatedLines]);

  // 监听节点选择变化
  useEffect(() => {
    const toDispose = selection.onSelectionChanged(() => {
      // 如果有节点被选中，且运行侧边栏是打开的，则关闭它
      if (selection.selection.length > 0 && visible) {
        setVisible(false);
      }
    });
    return () => toDispose.dispose();
  }, [selection, visible]);

  // 异步任务
  const executeTask = async (id: string) => {
    let formData: any = {};
    form?.forEach((item) => {
      formData[item.name] = item.value;
    });
    const [err, res] = await awaitWrapper(
      execute({
        agentFlowId: id,
        graphicAgentId: state.flowId,
        data: formData,
      })
    );
    if (res && res.data) {
      return [null, res.data];
    } else {
      return [err, null];
    }
  };
  // 轮训获取结果
  const getResult = async (executeId: string) => {
    // 更新最后一条消息的loading状态
    setChatMessages((prev) => {
      const newMessages = [...prev];
      const lastMessageIndex = newMessages.length - 1;
      if (
        lastMessageIndex >= 0 &&
        newMessages[lastMessageIndex].role === "assistant"
      ) {
        newMessages[lastMessageIndex] = {
          ...newMessages[lastMessageIndex],
          status: "loading",
        };
      }
      return newMessages;
    });

    const [err, res] = await awaitWrapper(
      getExecuteResult({
        agentFlowId: executeId,
      })
    );

    if (res && res.data) {
      return [null, res.data];
    } else {
      return [err, null];
    }
  };

  // 处理停止轮询
  const handleStopPolling = useCallback(() => {
    // 同时更新state和ref
    setShouldStopPolling(true);
    stopPollingRef.current = true;
    setWasExecutionStopped(true);

    setIsRunning(false);
  }, []);
  // 清除所有结果
  const clearAllResults = useCallback(() => {
    clearAllLineEffects();
    setNodeResults(new Map());
    setShowResults(false);
    setErrorNodes([]);
    // setChatMessages([]); // 清除聊天消息
  }, [clearAllLineEffects]);
  // 执行整个流程
  const executeWorkflow = async () => {
    // 验证表单
    const requiredFields = form.filter((field) => field.required);
    const hasEmptyRequiredFields = requiredFields.some((field) =>
      isEmpty(field.value)
    );
    if (hasEmptyRequiredFields) {
      // 显示表单验证错误
      const errorFieldNames = requiredFields
        .filter((field) => isEmpty(field.value))
        .map((field) => field.name)
        .join(", ");

      Toast.error({
        content: `${t(
          "tools.run.sideSheet.footer.config.emptyError"
        )}: ${errorFieldNames}`,
        duration: 3,
      });
      return;
    }

    // 第一步：检查是否有结果，如果有则先清除
    if (nodeResults.size > 0) {
      // 清除所有之前的结果
      clearAllResults();
    }
    // 设置运行状态要在任何异步操作之前
    setIsRunning(true);
    // 生成执行ID，之后直接使用这个本地变量
    const id = nanoid();
    // 保存工作流，直接传入ID而不是等待状态更新
    await saveWorkflow(id);
    // 重置结果状态
    setShowResults(false);
    setNodeResults(new Map());
    setErrorNodes([]);
    clearAllLineEffects();
    setShouldStopPolling(false);
    stopPollingRef.current = false; // 重置ref值
    setWasExecutionStopped(false); // 重置执行停止状态

    // 将表单添加为用户消息
    const formMessage = form
      .map((item) => `${item.name}: ${item.value || "未填写"}`)
      .join("\n");
    const newUserMessage = {
      role: "user",
      direction: "outgoing",
      content: formMessage || t("tools.run.sideSheet.chat.user.empty"),
      createAt: new Date().toLocaleTimeString(),
    };
    setChatMessages((prev) => [...prev, newUserMessage]);

    // 立即添加一条加载中的消息
    const loadingMessage = {
      id: "loading-" + id,
      role: "assistant",
      direction: "incoming",
      content: "正在处理中...",
      status: "loading",
      createAt: new Date().toLocaleTimeString(),
    };
    setChatMessages((prev) => [...prev, loadingMessage]);

    const newErrorNodes: string[] = [];
    const newResults = new Map<string, any>();

    try {
      const allNodes = getLinkedNodes();
      console.log("待执行节点数量:", allNodes.length);

      // 首先调用executeTask来启动流程执行
      const [execErr, execRes] = await executeTask(id);
      if (execErr) {
        // 添加错误消息
        setChatMessages((prev) => [
          ...prev.filter((msg) => msg.id !== "loading-" + id),
          {
            direction: "incoming",
            role: "assistant",
            content: `执行任务失败: ${execErr}`,
            status: "error",
            createAt: new Date().toLocaleTimeString(),
          },
        ]);
        throw new Error(`执行任务失败: ${execErr}`);
      }

      console.log("执行任务启动成功:", execRes);
      console.log("执行ID:", id); // 使用本地变量id，而不是state变量executeId

      // 通过轮询获取结果
      let pollCount = 0;
      let isEnd = false;

      // 记录已经处理过的节点ID，避免重复添加消息
      const processedNodeIds = new Set<string>();

      // 每次循环开始检查stopPollingRef
      while (!isEnd && !stopPollingRef.current) {
        console.log("isEnd", isEnd);
        console.log("stopPollingRef.current", stopPollingRef.current);
        console.log(`开始第 ${pollCount + 1} 次轮询获取结果, 执行ID: ${id}`);

        // 再次检查停止标志 - 确保最新状态
        if (stopPollingRef.current) {
          console.log("检测到停止标志，中断轮询");
          break;
        }

        const [pollErr, pollRes] = await getResult(id);

        if (pollErr) {
          console.error(`轮询获取结果失败:`, pollErr);

          // 向聊天添加错误消息
          setChatMessages((prev) => [
            ...prev.filter((msg) => msg.id !== "loading-" + id),
            {
              direction: "incoming",
              role: "assistant",
              content: `获取结果失败: ${pollErr}`,
              status: "error",
              createAt: new Date().toLocaleTimeString(),
            },
          ]);

          // 检查是否在请求过程中被停止
          if (stopPollingRef.current) {
            console.log("在请求过程中被停止");
            break;
          }
        } else if (pollRes) {
          console.log(`轮询获取结果成功:`, pollRes);

          // 解析节点结果数组
          const nodeResultsArray = JSON.parse(pollRes) || [];

          // 处理每个节点的结果
          nodeResultsArray.forEach((nodeResult: any) => {
            if (nodeResult && nodeResult.id) {
              // 保存到节点结果Map
              const result = JSON.stringify({
                inputs: nodeResult.input,
                outputs: nodeResult.output,
                title: nodeResult.title,
                type: nodeResult.type,
              });
              newResults.set(nodeResult.id, result);

              // 检查节点是否有错误
              if (nodeResult.hasError) {
                newErrorNodes.push(nodeResult.id);
              }

              // 如果这个节点还没有处理过，添加到聊天消息
              if (!processedNodeIds.has(nodeResult.id)) {
                processedNodeIds.add(nodeResult.id);

                // 构建消息文本
                let messageText = `节点: ${
                  nodeResult.title || nodeResult.id
                }\n\n`;

                // 添加输出内容
                if (
                  nodeResult.output &&
                  Object.keys(nodeResult.output).length > 0
                ) {
                  messageText += "输出结果:\n";
                  Object.entries(nodeResult.output).forEach(([key, value]) => {
                    const valueStr =
                      typeof value === "object"
                        ? JSON.stringify(value, null, 2)
                        : String(value);
                    messageText += `${key}: ${valueStr}\n`;
                  });
                } else {
                  messageText += "无输出结果";
                }

                // 添加到聊天
                setChatMessages((prev) => [
                  ...prev.filter((msg) => msg.id !== "loading-" + id),
                  {
                    direction: "incoming",
                    role: "assistant",
                    content: messageText,
                    status: "completed",
                    createAt: new Date().toLocaleTimeString(),
                  },
                ]);
              }
            }
          });

          // 如果最后一个节点的type为end，则结束轮询
          if (
            nodeResultsArray.length > 0 &&
            nodeResultsArray[nodeResultsArray.length - 1].type === "end"
          ) {
            isEnd = true;
          }
          // 如果返回结果数量等于节点数量，则结束轮询
          if (nodeResultsArray.length === allNodes.length) {
            isEnd = true;
          }

          // 更新UI
          setNodeResults(new Map(newResults));

          // 根据返回状态可以决定是否继续轮询
          if (pollRes.data && pollRes.data.status === "completed") {
            console.log("流程已完成，停止轮询");
            break;
          }
        }

        // 再次检查是否应该停止轮询 (使用ref以获取最新值)
        if (stopPollingRef.current) {
          console.log("用户手动停止了轮询");
          break;
        }

        // 轮询间隔1秒，使用可中断的等待
        try {
          await new Promise((resolve, reject) => {
            const timeoutId = setTimeout(resolve, 1000);

            // 创建一个定时器来定期检查停止标志
            const intervalId = setInterval(() => {
              if (stopPollingRef.current) {
                clearTimeout(timeoutId);
                clearInterval(intervalId);
                reject(new Error("轮询被手动停止"));
              }
            }, 100);

            // 超时完成后清除间隔检查
            setTimeout(() => {
              clearInterval(intervalId);
            }, 1100);
          });
        } catch (error) {
          console.log(
            "等待被中断:",
            error instanceof Error ? error.message : String(error)
          );
          break; // 中断被捕获后直接退出循环
        }

        pollCount++;
      }

      // 最终处理
      setNodeResults(new Map(newResults));
      setErrorNodes(newErrorNodes);
      setShowResults(true);

      // 添加最终状态消息
      let finalMessage = "";

      if (stopPollingRef.current) {
        finalMessage = "流程执行已被停止，只显示部分结果";
      } else if (newErrorNodes.length > 0) {
        finalMessage = `已执行完成，但有 ${newErrorNodes.length} 个节点出现问题`;
      } else {
        finalMessage = "所有节点已成功执行";
      }

      setChatMessages((prev) => [
        ...prev.filter((msg) => msg.id !== "loading-" + id),
        {
          role: "assistant",
          direction: "incoming",
          content: finalMessage,
          status: "completed",
          createAt: new Date().toLocaleTimeString(),
        },
      ]);

      // 显示执行结果通知
      if (stopPollingRef.current) {
        Toast.info({
          content: t("tools.run.sideSheet.tip.stop"),
          duration: 3,
        });
      } else if (newErrorNodes.length > 0) {
        Notification.warning({
          title: t("tools.run.sideSheet.tip.executeError.title"),
          content: `${t("tools.run.sideSheet.tip.executeError.content")}:${
            newErrorNodes.length
          } `,
          duration: 3,
        });
      } else {
        Notification.success({
          title: t("tools.run.sideSheet.tip.executeSuccess.title"),
          content: t("tools.run.sideSheet.tip.executeSuccess.content"),
          duration: 3,
        });
      }
    } catch (error) {
      console.error("执行出错:", error);

      // 区分是用户取消还是其他错误
      if (stopPollingRef.current) {
        Toast.info({
          content: t("tools.run.sideSheet.tip.userStop"),
          duration: 3,
        });
      } else {
        // 添加错误消息到聊天
        setChatMessages((prev) => [
          ...prev.filter((msg) => msg.id !== "loading-" + id),
          {
            direction: "incoming",
            role: "assistant",
            content: `执行出错: ${
              error instanceof Error ? error.message : String(error)
            }`,
            status: "error",
            time: new Date().toLocaleTimeString(),
          },
        ]);

        Notification.error({
          title: "执行失败",
          content: `节点执行过程中发生错误: ${
            error instanceof Error ? error.message : String(error)
          }`,
          duration: 3,
        });
      }
    } finally {
      setIsRunning(false);
      setCurrentNodeId(null);
      setShouldStopPolling(false);
      // 注意：这里不重置wasExecutionStopped，因为我们需要它用于显示结果
      stopPollingRef.current = false; // 重置ref
    }
  };

  // 处理侧边栏打开/关闭
  const handleSideSheetToggle = useCallback(() => {
    if (isRunning) {
      Toast.warning({
        content: t("tools.run.sideSheet.tip.closeError"),
        duration: 3,
      });
      return;
    }
    const newVisible = !visible;

    // 不再在关闭侧边栏时清理结果和聊天消息，保留结果显示
    setVisible(newVisible);
  }, [visible, isRunning]);

  // 处理运行按钮点击
  const handleRunClick = useCallback(async () => {
    if (!state.userId) {
      Toast.error({
        content: t("tools.run.sideSheet.tip.noUser"),
        duration: 3,
      });
      return;
    }
    if (!state.flowId) {
      Toast.error({
        content: t("tools.run.sideSheet.tip.noFlowId"),
        duration: 3,
      });
      return;
    }
    try {
      // 如果有节点被选中，先清除选中状态
      if (selection.selection.length > 0) {
        selection.selection = [];
        setNodeRender(undefined);
      }

      const res = await isValid();
      if (res) {
        setVisible(true);
        const formData = getRunProperties();
        console.log(formData);
        formData && setForm(formData);
      }
    } catch (err) {
      console.error("验证失败:", err);
      Notification.error({
        title: "验证失败",
        content: "无法验证节点有效性",
        duration: 3,
      });
    }
  }, [isValid, getRunProperties, state, selection, setNodeRender]);

  // 渲染节点结果
  const renderedResults = useMemo(() => {
    // 空结果不渲染
    if (nodeResults.size === 0) return null;

    return Array.from(nodeResults.entries()).map(([nodeId, result]) => {
      const node = flowDocument
        .getAllNodes()
        .find((node) => node.id === nodeId);
      if (!node) return null;

      return (
        <NodeResult key={`result-${nodeId}`} node={node} result={result} />
      );
    });
  }, [nodeResults, flowDocument]);

  // 用于确保组件卸载时清理所有副作用
  useEffect(() => {
    // 组件卸载时清理所有效果
    return () => {
      clearAllLineEffects();
    };
  }, [clearAllLineEffects]);

  // 检查是否有结果显示
  const hasResults = nodeResults.size > 0;

  const roleInfo = useMemo(
    () => ({
      user: {
        name: t("tools.run.sideSheet.chat.user.title"),
        avatar: iconUser,
      },
      assistant: {
        name: t("tools.run.sideSheet.chat.assistant.title"),
        avatar: logo,
      },
      system: {
        name: t("tools.run.sideSheet.chat.system.title"),
        avatar: logo,
      },
    }),
    [t]
  );

  return (
    <>
      <GlobalStyles />

      <div style={{ display: "flex", gap: "10px" }}>
        <Button
          icon={<IconTreeTriangleRight />}
          style={{
            backgroundColor: isRunning ? "#008B2E" : "#00A838",
            color: "#fff",
            borderRadius: "8px",
            border: "none",
          }}
          disabled={props.disabled}
          loading={isRunning}
          onClick={handleRunClick}
        >
          {isRunning ? t("tools.run.runningTitle") : t("tools.run.title")}
        </Button>

        {hasResults && !isRunning && (
          <Button
            type="danger"
            theme="light"
            icon={<IconClear />}
            style={{
              backgroundColor: "#FFF2F0",
              borderColor: "#FFCCC7",
              borderRadius: "8px",
            }}
            onClick={clearAllResults}
          >
            {t("tools.run.clearTitle")}
          </Button>
        )}
      </div>

      <StyledSideSheet
        placement="right"
        visible={visible}
        onCancel={handleSideSheetToggle}
        mask={false}
        keepDOM={true}
        footer={null}
      >
        <Header>
          <Icon src={iconRun} alt="" />
          <Title
            style={{
              fontWeight: 600,
              fontSize: "16px",
              lineHeight: "28px",
              padding: 0,
              color: "#303030",
            }}
          >
            {t("tools.run.sideSheet.title")}
          </Title>
          <Button
            icon={<IconClose />}
            size="small"
            theme="borderless"
            onClick={handleSideSheetToggle}
          />
        </Header>
        <div
          style={{
            height: "calc(100% - 40px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Chat
            style={{ height: "100%" }}
            chats={chatMessages}
            roleConfig={roleInfo}
            renderMessageContent={(message: any) => {
              if (typeof message.content === "object" && message.content.text) {
                return (
                  <div style={{ whiteSpace: "pre-wrap" }}>
                    {message.content.text}
                  </div>
                );
              }
              return message.content;
            }}
            renderInputArea={() => (
              <div style={{ margin: "0 10px" }}>
                <SideSheetFooter
                  isRunning={isRunning}
                  formChildren={
                    form && form.length > 0 ? (
                      <FormFiled form={form} onChange={setForm} />
                    ) : (
                      <Empty
                        image={<img style={{ width: 200 }} src={emptyImage} />}
                        title={t("tools.run.sideSheet.footer.config.empty")}
                        style={{ margin: "40px 0" }}
                      />
                    )
                  }
                  executeWorkflow={executeWorkflow}
                  handleStopPolling={handleStopPolling}
                  showResults={showResults}
                  wasExecutionStopped={wasExecutionStopped}
                  errorNodes={errorNodes}
                />
              </div>
            )}
          />
        </div>
      </StyledSideSheet>

      {/* 渲染节点结果 */}
      {renderedResults}
    </>
  );
};
